'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiveSession, LiveMessage } from '@/lib/hooks/use-live-session';
import { LiveWaveform } from '@/components/coach/LiveWaveform';
import { CoachShell } from '@/components/coach/CoachShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addLocalMemoryItem } from '@/lib/memory/local-memory-store';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  Brain,
  Check,
  RotateCcw,
  BookOpen,
  Activity,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

// Predefined workplace scenarios
type Scenario = {
  id: string;
  title: string;
  descriptionVi: string;
  systemPrompt: string;
  phrases: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'free_talk',
    title: 'Free Talk (Hội thoại tự do)',
    descriptionVi:
      'Luyện tập nói chuyện ngẫu hứng về các chủ đề tự chọn hoặc cuộc sống thường ngày cùng với Coach.',
    systemPrompt: `
You are a friendly, encouraging English conversation coach. Engage the user in a casual, flowing English chat.
Keep your responses short (1-2 sentences) so the user has plenty of opportunities to speak.
Vary the topics naturally. Gently prompt the user if they pause. Always match their level and remain supportive.
`.trim(),
    phrases: [
      'How has your day been so far?',
      "Let's talk about your hobbies.",
      'Could you tell me about your plans for the weekend?',
    ],
  },
  {
    id: 'daily_standup',
    title: 'Daily Standup Meeting (Họp tiến độ)',
    descriptionVi:
      'Mô phỏng buổi họp cập nhật công việc hàng ngày trong môi trường Agile/Scrum quốc tế.',
    systemPrompt: `
You are the Scrum Master of a global software engineering team. You are running the daily standup meeting.
Ask the user (who is a developer/professional on the team) to share their daily update:
1. What did you work on yesterday?
2. What will you work on today?
3. Are there any blockers or impediments?
Keep your responses very brief (1 sentence), acting professionally, saying "Thanks", and asking follow-up standup questions if needed.
`.trim(),
    phrases: [
      'Yesterday, I finished implementing the login API...',
      "Today, I'm going to focus on writing unit tests...",
      "I'm currently blocked by the server configuration issue...",
    ],
  },
  {
    id: 'mock_interview',
    title: 'Mock Job Interview (Phỏng vấn thử)',
    descriptionVi:
      'Luyện trả lời phỏng vấn ứng tuyển vị trí chuyên viên bằng tiếng Anh với nhà tuyển dụng khó tính.',
    systemPrompt: `
You are an HR Manager interviewing the user for a professional position at a global corporation.
Conduct a structured interview. Ask one professional question at a time and wait for their response.
Start with: "Welcome to our interview. Could you please introduce yourself and summarize your experience?"
Then follow up with classic questions like:
- "Why are you interested in this role?"
- "Can you describe a challenging project you worked on and how you handled it?"
Keep your questions realistic, polite, and brief (1-2 sentences).
`.trim(),
    phrases: [
      'I have over 3 years of experience in software development...',
      "I'm looking for new challenges to grow my skills...",
      'One challenge I faced was meeting a tight deadline...',
    ],
  },
  {
    id: 'customer_negotiation',
    title: 'Client Negotiation (Đàm phán đối tác)',
    descriptionVi:
      'Luyện đàm phán yêu cầu dự án, thống nhất phạm vi và chi phí với khách hàng nước ngoài.',
    systemPrompt: `
You are a foreign client who hired the user's agency for a software project.
You want to negotiate project scope and deadlines. You are pushy but professional.
Start with: "Hi, thanks for joining the call. We really need this project delivered 2 weeks earlier than planned. Is that possible?"
Wait for the user's negotiation response. Counter their offers realistically, discussing resource constraints, budget additions, or features scope cuts.
Keep your responses short (1-2 sentences).
`.trim(),
    phrases: [
      'To deliver 2 weeks earlier, we would need to reduce the initial scope...',
      'That is possible if we add two more developers to the team...',
      "Let's negotiate the budget for this additional acceleration...",
    ],
  },
];

type AnalysisReport = {
  overallScore: number;
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  summaryVi: string;
  mistakes: Array<{
    originalText: string;
    correctedText: string;
    explanationVi: string;
  }>;
  alternatives: Array<{
    originalText: string;
    betterAlternative: string;
    explanationVi: string;
  }>;
};

export default function LiveCoachPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('free_talk');
  const [voiceName, setVoiceName] = useState('Aoede');
  const [showReport, setShowReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const {
    isConnected,
    isConnecting,
    error,
    transcript,
    micLevel,
    speakerLevel,
    isMuted,
    isThinking,
    sosHint,
    isSosPending,
    startSession,
    endSession,
    toggleMute,
    requestSosHint,
    clearSosHint,
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
    startSession(selectedScenario.title, selectedScenario.systemPrompt);
  };

  // Handle call end and trigger post-call analysis
  const handleEndCall = async () => {
    // 1. Terminate WebSocket session
    endSession();

    if (transcript.length === 0) {
      return;
    }

    // 2. Trigger Gemini Analysis Route
    setIsAnalyzing(true);
    setShowReport(true);

    try {
      const res = await fetch('/api/live/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
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

  // Save mistake / alternative to local memory store
  const handleSaveToMemory = (
    key: string,
    type: 'mistake' | 'alternative',
    original: string,
    correctedOrAlt: string,
    explanation: string
  ) => {
    const memoryType =
      type === 'mistake' ? 'writing_mistake' : 'reusable_phrase';
    addLocalMemoryItem({
      memoryType,
      sourceWorkflow: 'reading', // classified under speaking practice in local store
      patternKey: `live_${type}_${Date.now()}`.toLowerCase(),
      category: type === 'mistake' ? 'grammar' : 'naturalness',
      wrongText: memoryType === 'writing_mistake' ? original : undefined,
      correctText:
        memoryType === 'writing_mistake' ? correctedOrAlt : undefined,
      phrase: memoryType === 'reusable_phrase' ? original : undefined,
      explanationVi:
        type === 'mistake'
          ? `Đề xuất sửa: "${correctedOrAlt}". Giải thích: ${explanation}`
          : `Giải thích sắc thái: ${explanation}`,
      situationVi: `Luyện nói kịch bản: ${selectedScenario.title}`,
      status: 'active',
    });

    setSavedItems((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <CoachShell
      headerTitle="LIVE SPEAK & LISTEN COACH"
      headerIcon={<Activity className="size-4 text-primary" />}
      sidebarTitle="Thiết lập Phòng nói Live"
      sidebarDescription="Chọn kịch bản công sở thực tế hoặc nói chuyện tự do để luyện nói phản xạ thời gian thực với AI."
      showReset={false}
      onReset={() => {}}
      sidebarContent={
        <div className="flex flex-col gap-5">
          {/* Scenario Selector */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Kịch bản nói
            </span>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  disabled={isConnected || isConnecting}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all duration-200 ${
                    selectedScenarioId === sc.id
                      ? 'border-primary bg-primary/[0.03] text-foreground shadow-2xs font-semibold'
                      : 'border-border/80 text-muted-foreground hover:bg-muted/30 disabled:opacity-50'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">{sc.title}</span>
                  <span className="text-[10px] leading-relaxed text-muted-foreground font-normal">
                    {sc.descriptionVi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="flex flex-col gap-2 pt-3 border-t border-border/40">
            <label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Giọng nói AI (Google Live)
            </label>
            <select
              disabled={isConnected || isConnecting}
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full text-xs h-8.5 px-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            >
              <option value="Aoede">Aoede (Nữ - Truyền cảm)</option>
              <option value="Kore">Kore (Nữ - Rõ ràng)</option>
              <option value="Charon">Charon (Nam - Trầm ấm)</option>
              <option value="Fenrir">Fenrir (Nam - Mạnh mẽ)</option>
              <option value="Puck">Puck (Nam - Năng động)</option>
            </select>
          </div>
        </div>
      }
      mainContent={
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-1">
          {/* Connection Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-2xl animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Call screen state */}
          {!isConnected && !isConnecting && !showReport && (
            <Card className="border border-border/80 shadow-none rounded-2xl overflow-hidden bg-card animate-in fade-in duration-200">
              <CardContent className="p-6 flex flex-col gap-5.5">
                <div>
                  <h3 className="text-[17px] font-bold text-foreground">
                    {selectedScenario.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed">
                    {selectedScenario.descriptionVi}
                  </p>
                </div>

                {/* Phrase checklist cards */}
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                    <BookOpen className="size-3.5" />
                    Mẫu câu khuyên dùng trong kịch bản này:
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {selectedScenario.phrases.map((phrase, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-foreground/80 font-medium"
                      >
                        <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-normal select-all bg-white dark:bg-zinc-800/50 py-0.5 px-1.5 rounded border border-border/40">
                          {phrase}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start call button */}
                <div className="flex justify-center py-4">
                  <Button
                    onClick={handleStartCall}
                    className="h-12 px-8 text-xs font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-103"
                  >
                    <Phone className="size-4.5 fill-current" />
                    Bắt đầu cuộc gọi Live Coach
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected call view */}
          {(isConnected || isConnecting) && (
            <Card className="border border-border/80 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
              <CardContent className="p-8 flex flex-col items-center gap-8">
                {/* Call Status Indicator */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full animate-pulse">
                    {isConnecting ? 'Đang kết nối...' : 'Cuộc gọi đang diễn ra'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {isConnecting
                      ? 'Vui lòng đeo tai nghe để có trải nghiệm triệt tiêu tiếng vang tốt nhất'
                      : 'Hãy nói tự nhiên, AI sẽ tự động lắng nghe và trả lời'}
                  </span>
                </div>

                {/* Circular voice visualizer */}
                <LiveWaveform
                  micLevel={micLevel}
                  speakerLevel={speakerLevel}
                  isThinking={isThinking}
                  isConnected={isConnected}
                  isMuted={isMuted}
                />

                {/* Live transcript view */}
                <div className="w-full flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                    Phụ đề thời gian thực (Live STT)
                  </span>
                  <div
                    ref={scrollRef}
                    className="w-full h-36 overflow-y-auto border border-border/60 bg-muted/30 rounded-2xl p-4 flex flex-col gap-3 scroll-smooth select-text"
                  >
                    {transcript.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic font-medium">
                        Bắt đầu nói tiếng Anh để tạo phụ đề...
                      </div>
                    ) : (
                      transcript.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[85%] text-xs ${
                            msg.role === 'user'
                              ? 'self-end items-end'
                              : 'self-start items-start'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-muted-foreground mb-0.5 capitalize">
                            {msg.role === 'user' ? 'Bạn' : 'Coach'}
                          </span>
                          <div
                            className={`p-2.5 rounded-2xl leading-relaxed font-sans ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white dark:bg-zinc-800 text-foreground border border-border/80 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    {isThinking && (
                      <div className="self-start flex flex-col items-start max-w-[85%] text-xs">
                        <span className="text-[9px] font-bold text-muted-foreground mb-0.5">
                          Coach
                        </span>
                        <div className="p-2.5 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-800 text-foreground border border-border/80 italic text-muted-foreground/60 flex items-center gap-1.5">
                          <Loader2 className="size-3 animate-spin text-primary" />
                          Đang suy nghĩ...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SOS Rescue / Help hint */}
                {isConnected && (
                  <div className="w-full border-t border-border/40 pt-5 flex flex-col gap-3 items-center">
                    {sosHint ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-foreground text-xs rounded-2xl w-full flex justify-between items-start gap-3 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                            💡 Gợi ý câu nói tiếp theo (SOS Hint):
                          </span>
                          <span className="font-semibold select-all font-sans italic text-foreground/90">
                            {sosHint}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={clearSosHint}
                          className="text-muted-foreground hover:text-foreground text-[10px] px-2 h-6"
                        >
                          Đóng
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        disabled={isSosPending}
                        onClick={requestSosHint}
                        className="text-xs h-8 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-4 rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="size-3.5 fill-current" />
                        {isSosPending
                          ? 'Đang tạo gợi ý...'
                          : 'Bí từ? Gợi ý câu tiếp theo'}
                      </Button>
                    )}
                  </div>
                )}

                {/* Call Controls */}
                <div className="flex items-center gap-5 pt-2 border-t border-border/40 w-full justify-center">
                  <Button
                    type="button"
                    onClick={toggleMute}
                    className={`size-11 rounded-full p-0 flex items-center justify-center cursor-pointer border ${
                      isMuted
                        ? 'bg-red-500 border-red-500 text-white hover:bg-red-500/90'
                        : 'bg-muted border-border text-foreground hover:bg-muted/80'
                    }`}
                    title={isMuted ? 'Mở Micro' : 'Tắt Micro'}
                  >
                    {isMuted ? (
                      <MicOff className="size-5 stroke-[1.8]" />
                    ) : (
                      <Mic className="size-5 stroke-[1.8]" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleEndCall}
                    className="h-11 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                  >
                    <PhoneOff className="size-4.5 fill-current" />
                    Gác máy / Xem đánh giá
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post-Call Report View */}
          {showReport && (
            <Card className="border border-border/80 shadow-none rounded-2xl overflow-hidden bg-card animate-in fade-in duration-300">
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Báo cáo cuộc gọi: {selectedScenario.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Được phân tích tự động bằng trí tuệ nhân tạo Gemini
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowReport(false)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold rounded-xl"
                  >
                    <RotateCcw className="size-3.5 mr-1" />
                    Luyện tập lại
                  </Button>
                </div>

                {isAnalyzing ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-medium animate-pulse">
                      Đang phân tích cuộc hội thoại và xây dựng sổ tay lỗi
                      sai...
                    </span>
                  </div>
                ) : !report ? (
                  <div className="py-8 flex flex-col items-center gap-3 text-muted-foreground/60 text-xs italic">
                    Không đủ dữ liệu hội thoại để phân tích chi tiết. Vui lòng
                    nói nhiều hơn ở cuộc gọi tiếp theo!
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Performance Dials */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        {
                          label: 'Điểm tổng quát',
                          val: report.overallScore,
                          color: 'text-primary border-primary/20 bg-primary/5',
                        },
                        {
                          label: 'Ngữ pháp',
                          val: report.grammarScore,
                          color:
                            'text-emerald-600 border-emerald-500/20 bg-emerald-500/5',
                        },
                        {
                          label: 'Phát âm (STT)',
                          val: report.pronunciationScore,
                          color:
                            'text-blue-600 border-blue-500/20 bg-blue-500/5',
                        },
                        {
                          label: 'Độ trôi chảy',
                          val: report.fluencyScore,
                          color:
                            'text-amber-600 border-amber-500/20 bg-amber-500/5',
                        },
                      ].map((dial, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-2xl p-4 flex flex-col items-center gap-1.5 text-center ${dial.color}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {dial.label}
                          </span>
                          <span className="text-3xl font-extrabold font-mono tracking-tight">
                            {dial.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Encouraging summary */}
                    <div className="bg-muted/40 border border-border/60 rounded-xl p-4 text-xs leading-relaxed text-foreground/90 font-medium">
                      🏆{' '}
                      <span className="font-bold text-foreground">
                        Đánh giá từ Coach:
                      </span>{' '}
                      {report.summaryVi}
                    </div>

                    {/* Grammar mistakes check */}
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                        ❌ Lỗi ngữ pháp & Từ vựng cần lưu ý:
                      </span>
                      {report.mistakes.length === 0 ? (
                        <div className="p-4 border border-emerald-500/25 bg-emerald-500/[0.01] rounded-2xl text-xs text-emerald-600 font-medium flex items-center gap-2">
                          <Check className="size-4" />
                          Tuyệt vời! Không phát hiện lỗi sai ngữ pháp nghiêm
                          trọng nào.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {report.mistakes.map((mistake, idx) => {
                            const key = `m_${idx}`;
                            const isSaved = !!savedItems[key];

                            return (
                              <div
                                key={idx}
                                className="border border-border/80 rounded-2xl p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium text-red-500 line-through">
                                      {mistake.originalText}
                                    </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                      → {mistake.correctedText}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground font-medium leading-relaxed">
                                    💡 {mistake.explanationVi}
                                  </p>
                                </div>

                                <div className="shrink-0 self-end sm:self-center select-none">
                                  {isSaved ? (
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 py-1 px-2 border border-emerald-500/20 bg-emerald-500/5 rounded">
                                      Đã lưu Sổ tay
                                      <Check className="size-3" />
                                    </span>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="xs"
                                      onClick={() =>
                                        handleSaveToMemory(
                                          key,
                                          'mistake',
                                          mistake.originalText,
                                          mistake.correctedText,
                                          mistake.explanationVi
                                        )
                                      }
                                      className="text-[10px] h-7 px-3 font-bold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 hover:border-primary cursor-pointer flex items-center gap-1"
                                    >
                                      <Brain className="size-3 text-primary group-hover:text-primary-foreground" />
                                      Lưu sổ tay
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Better phrasings */}
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                        💡 Đề xuất cách diễn đạt tự nhiên hơn:
                      </span>
                      <div className="flex flex-col gap-3">
                        {report.alternatives.map((alt, idx) => {
                          const key = `a_${idx}`;
                          const isSaved = !!savedItems[key];

                          return (
                            <div
                              key={idx}
                              className="border border-border/80 rounded-2xl p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium text-muted-foreground">
                                    Bạn nói: "{alt.originalText}"
                                  </span>
                                  <span className="font-bold text-primary">
                                    Nên nói: "{alt.betterAlternative}"
                                  </span>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                  💼 {alt.explanationVi}
                                </p>
                              </div>

                              <div className="shrink-0 self-end sm:self-center select-none">
                                {isSaved ? (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 py-1 px-2 border border-emerald-500/20 bg-emerald-500/5 rounded">
                                    Đã lưu Sổ tay
                                    <Check className="size-3" />
                                  </span>
                                ) : (
                                  <Button
                                    type="button"
                                    size="xs"
                                    onClick={() =>
                                      handleSaveToMemory(
                                        key,
                                        'alternative',
                                        alt.originalText,
                                        alt.betterAlternative,
                                        alt.explanationVi
                                      )
                                    }
                                    className="text-[10px] h-7 px-3 font-bold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 hover:border-primary cursor-pointer flex items-center gap-1"
                                  >
                                    <Brain className="size-3 text-primary group-hover:text-primary-foreground" />
                                    Lưu sổ tay
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      }
    />
  );
}
