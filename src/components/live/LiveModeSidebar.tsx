'use client';

import React from 'react';
import {
  LiveMode,
  LiveTopic,
  LiveScenario,
  LIVE_MODES,
  LIVE_TOPICS,
  CONVERSATION_SCENARIOS,
} from '@/core/live/live-modes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Laptop,
  Sparkles,
} from 'lucide-react';

interface LiveModeSidebarProps {
  selectedModeId: string;
  selectedTopicId: string;
  selectedScenarioId: string;
  onSelectMode: (mode: LiveMode) => void;
  onSelectTopic: (topic: LiveTopic) => void;
  onSelectScenario: (scenario: LiveScenario) => void;
  disabled: boolean;
  voiceName: string;
  onVoiceChange: (voice: string) => void;
}

export function LiveModeSidebar({
  selectedModeId,
  selectedTopicId,
  selectedScenarioId,
  onSelectMode,
  onSelectTopic,
  onSelectScenario,
  disabled,
  voiceName,
  onVoiceChange,
}: LiveModeSidebarProps) {
  const guidedModes = LIVE_MODES.filter((m) => m.category === 'guided');
  const conversationModes = LIVE_MODES.filter(
    (m) => m.category === 'conversation'
  );

  const getTopicIcon = (topicId: string) => {
    switch (topicId) {
      case 'workplace':
        return <Brain className="size-3 text-primary shrink-0" />;
      case 'daily_life':
        return <MessageSquare className="size-3 text-emerald-500 shrink-0" />;
      case 'academic':
        return <GraduationCap className="size-3 text-blue-500 shrink-0" />;
      case 'technology':
        return <Laptop className="size-3 text-amber-500 shrink-0" />;
      default:
        return <Sparkles className="size-3 text-purple-500 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Guided Practice Group */}
      <div className="flex flex-col gap-2.5">
        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="size-3.5" />
          Luyện tập có hướng dẫn
        </span>
        <div className="flex flex-col gap-2">
          {guidedModes.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            return (
              <div key={mode.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectMode(mode)}
                  className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/[0.03] text-foreground shadow-2xs font-semibold'
                      : 'border-border/80 text-muted-foreground hover:bg-muted/30 disabled:opacity-50'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">
                    {mode.title}
                  </span>
                  <span className="text-[10px] leading-relaxed text-muted-foreground font-normal">
                    {mode.descriptionVi}
                  </span>
                </button>

                {/* Topics selection visible only when this guided mode is selected */}
                {isSelected && (
                  <div className="pl-3 pr-1 py-1 flex flex-col gap-1.5 border-l border-primary/20 ml-3 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/80">
                      Chọn chủ đề:
                    </span>
                    {LIVE_TOPICS.map((topic) => {
                      const isTopicSelected = selectedTopicId === topic.id;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onSelectTopic(topic)}
                          className={`flex items-center gap-2 text-[10px] p-2 rounded-lg border text-left transition-all duration-150 ${
                            isTopicSelected
                              ? 'border-primary bg-primary/[0.02] text-primary font-bold'
                              : 'border-border/60 text-muted-foreground hover:bg-muted/20 disabled:opacity-50'
                          }`}
                        >
                          {getTopicIcon(topic.id)}
                          <div className="flex flex-col">
                            <span className="leading-tight">{topic.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation Practice Group */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-border/40">
        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="size-3.5" />
          Luyện nói tự do (Roleplay)
        </span>
        <div className="flex flex-col gap-2">
          {conversationModes.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            return (
              <div key={mode.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectMode(mode);
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/[0.03] text-foreground shadow-2xs font-semibold'
                      : 'border-border/80 text-muted-foreground hover:bg-muted/30 disabled:opacity-50'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">
                    {mode.title}
                  </span>
                  <span className="text-[10px] leading-relaxed text-muted-foreground font-normal">
                    {mode.descriptionVi}
                  </span>
                </button>

                {/* Scenarios sub-menu visible only when selected */}
                {isSelected && (
                  <div className="pl-3 pr-1 py-1 flex flex-col gap-1.5 border-l border-primary/20 ml-3 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/80">
                      Chọn kịch bản:
                    </span>
                    {CONVERSATION_SCENARIOS.map((sc) => {
                      const isScenarioSelected = selectedScenarioId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onSelectScenario(sc)}
                          className={`flex flex-col text-left p-2 rounded-lg border transition-all duration-150 ${
                            isScenarioSelected
                              ? 'border-primary bg-primary/[0.02] text-primary font-bold shadow-2xs'
                              : 'border-border/60 text-muted-foreground hover:bg-muted/20 disabled:opacity-50'
                          }`}
                        >
                          <span className="text-[10px] font-semibold">
                            {sc.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground/90 font-normal leading-normal mt-0.5">
                            {sc.descriptionVi}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
        <label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Giọng nói AI (Google Live)
        </label>
        <Select
          disabled={disabled}
          value={voiceName}
          onValueChange={(val) => {
            if (val) onVoiceChange(val);
          }}
        >
          <SelectTrigger className="w-full text-xs h-8.5 bg-background border border-border rounded-xl">
            <SelectValue placeholder="Chọn giọng nói" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="Aoede">Aoede (Nữ - Truyền cảm)</SelectItem>
            <SelectItem value="Kore">Kore (Nữ - Rõ ràng)</SelectItem>
            <SelectItem value="Charon">Charon (Nam - Trầm ấm)</SelectItem>
            <SelectItem value="Fenrir">Fenrir (Nam - Mạnh mẽ)</SelectItem>
            <SelectItem value="Puck">Puck (Nam - Năng động)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
