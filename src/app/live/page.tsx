'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiveSession } from '@/lib/hooks/use-live-session';
import { CoachShell } from '@/components/coach/CoachShell';
import { LiveModeSidebar } from '@/components/live/LiveModeSidebar';
import { LivePreCallCard } from '@/components/live/LivePreCallCard';
import { LiveCallView } from '@/components/live/LiveCallView';
import {
  LiveReportView,
  AnalysisReport,
} from '@/components/live/LiveReportView';
import {
  LIVE_MODES,
  LiveMode,
  LiveTopic,
  LiveScenario,
} from '@/core/live/live-modes';
import { Activity, AlertCircle } from 'lucide-react';

export default function LiveCoachPage() {
  const [selectedMode, setSelectedMode] = useState<LiveMode>(
    LIVE_MODES.find((m) => m.id === 'shadowing') || LIVE_MODES[0]
  );
  const [selectedTopic, setSelectedTopic] = useState<LiveTopic | null>(
    selectedMode.topics?.[0] || null
  );
  const [selectedScenario, setSelectedScenario] = useState<LiveScenario | null>(
    selectedMode.scenarios?.[0] || null
  );

  const [voiceName, setVoiceName] = useState('Aoede');
  const [showReport, setShowReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync default topic/scenario when mode changes in event handler
  const handleSelectMode = (mode: LiveMode) => {
    setSelectedMode(mode);
    if (mode.category === 'guided') {
      setSelectedTopic(mode.topics?.[0] || null);
      setSelectedScenario(null);
    } else {
      setSelectedTopic(null);
      const scenario = mode.scenarios?.[0] || null;
      setSelectedScenario(scenario);
    }
    setShowReport(false);
    setReport(null);
  };

  const {
    isConnected,
    isConnecting,
    error,
    transcript,
    micLevel,
    speakerLevel,
    isMuted,
    isThinking,
    activeMode,
    activeTopic,
    activeScenario,
    startSession,
    endSession,
    toggleMute,
  } = useLiveSession({ voiceName });

  // Scroll live transcription view to bottom when transcript updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, isThinking]);

  // Handle call start
  const handleStartCall = () => {
    setShowReport(false);
    setReport(null);
    setSavedItems({});
    setCallStartTime(Date.now());

    startSession({
      mode: selectedMode,
      topic: selectedTopic || undefined,
      scenario: selectedScenario || undefined,
    });
  };

  const handleEndCall = async () => {
    const modeForReport = activeMode || selectedMode;
    const topicForReport = activeTopic || selectedTopic;
    const scenarioForReport = activeScenario || selectedScenario;

    // 1. Terminate WebSocket session
    endSession();

    // Only analyze if the user actually spoke during the session
    const hasUserSpoken = transcript.some((msg) => msg.role === 'user');
    if (!hasUserSpoken) {
      setShowReport(false);
      setReport(null);
      return;
    }

    const durationSeconds = callStartTime
      ? Math.round((Date.now() - callStartTime) / 1000)
      : 0;

    // 2. Trigger Gemini Analysis Route
    setIsAnalyzing(true);
    setShowReport(true);

    try {
      const scenarioTitle =
        modeForReport.category === 'guided'
          ? `${modeForReport.title} - ${topicForReport?.title || 'Tự do'}`
          : scenarioForReport?.title || modeForReport.title;

      const res = await fetch('/api/live/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: modeForReport.id,
          scenarioTitle,
          scenarioId: scenarioForReport?.id || null,
          durationSeconds,
          transcript,
        }),
      });

      if (!res.ok) {
        throw new Error('Đã xảy ra lỗi khi phân tích cuộc hội thoại.');
      }

      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save mistake / alternative to local memory store (disabled for database migration)
  const handleSaveToMemory = (
    key: string,
    type: 'mistake' | 'alternative',
    original: string,
    correctedOrAlt: string,
    explanation: string
  ) => {
    alert(
      'Tính năng lưu Sổ tay cho Live AI đang được nâng cấp lên cơ sở dữ liệu và tạm thời bị khóa.'
    );
  };

  const getModeTitleForReport = () => {
    const m = activeMode || selectedMode;
    const t = activeTopic || selectedTopic;
    const s = activeScenario || selectedScenario;
    if (m.category === 'guided') {
      return `${m.title} (${t?.title || 'Tự do'})`;
    }
    return s?.title || m.title;
  };

  return (
    <CoachShell
      headerTitle="LIVE SPEAK & LISTEN COACH"
      headerIcon={<Activity className="size-4 text-primary" />}
      sidebarTitle="Thiết lập Phòng nói Live"
      sidebarDescription="Chọn phương pháp luyện tập có hướng dẫn hoặc hội thoại tự do để tăng phản xạ nói tiếng Anh thời gian thực cùng AI."
      showReset={false}
      onReset={() => {}}
      focusMode={isConnected || isConnecting || showReport}
      sidebarContent={
        <LiveModeSidebar
          selectedModeId={selectedMode.id}
          selectedTopicId={selectedTopic?.id || ''}
          selectedScenarioId={selectedScenario?.id || ''}
          onSelectMode={handleSelectMode}
          onSelectTopic={setSelectedTopic}
          onSelectScenario={setSelectedScenario}
          disabled={isConnected || isConnecting}
          voiceName={voiceName}
          onVoiceChange={setVoiceName}
        />
      }
      mainContent={
        <div className="flex flex-col gap-6 max-w-2xl w-full mx-auto py-1">
          {/* Connection Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-2xl animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Pre-Call Card */}
          {!isConnected && !isConnecting && !showReport && (
            <LivePreCallCard
              mode={selectedMode}
              topic={selectedTopic}
              scenario={selectedScenario}
              onStartCall={handleStartCall}
            />
          )}

          {/* Active Call View */}
          {(isConnected || isConnecting) && (
            <LiveCallView
              isConnecting={isConnecting}
              isConnected={isConnected}
              micLevel={micLevel}
              speakerLevel={speakerLevel}
              isThinking={isThinking}
              isMuted={isMuted}
              transcript={transcript}
              mode={activeMode || selectedMode}
              scrollRef={scrollRef}
              toggleMute={toggleMute}
              onEndCall={handleEndCall}
            />
          )}

          {/* Post-Call Report */}
          {showReport && (
            <LiveReportView
              report={report}
              isAnalyzing={isAnalyzing}
              modeTitle={getModeTitleForReport()}
              savedItems={savedItems}
              onSaveToMemory={handleSaveToMemory}
              onRepractice={() => setShowReport(false)}
            />
          )}
        </div>
      }
    />
  );
}
