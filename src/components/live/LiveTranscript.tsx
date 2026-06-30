'use client';

import React from 'react';
import { LiveMessage } from '@/lib/hooks/use-live-session';
import { LiveMode } from '@/core/live/live-modes';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Loader2, BookOpen, Volume2 } from 'lucide-react';

interface LiveTranscriptProps {
  transcript: LiveMessage[];
  isThinking: boolean;
  mode: LiveMode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function LiveTranscript({
  transcript,
  isThinking,
  mode,
  scrollRef,
}: LiveTranscriptProps) {
  const isReadAloud = mode.id === 'read_aloud';

  // Find the index of the latest assistant message to highlight/format in Read-Aloud
  const latestAssistantIndex = transcript.reduce<number>(
    (latestIdx, msg, idx) => {
      if (msg.role === 'assistant') {
        return idx;
      }
      return latestIdx;
    },
    -1
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
        Phụ đề thời gian thực (Live STT)
      </span>
      <div
        ref={scrollRef}
        className="w-full h-[380px] overflow-y-auto border border-border/60 bg-muted/30 rounded-2xl p-4 flex flex-col gap-3 scroll-smooth select-text"
      >
        {transcript.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic font-medium">
            Bắt đầu nói tiếng Anh để tạo phụ đề...
          </div>
        ) : (
          transcript.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestAssistant = !isUser && idx === latestAssistantIndex;

            // Render special highlighted card for latest assistant message in Read-Aloud mode
            if (isReadAloud && isLatestAssistant) {
              return (
                <div
                  key={idx}
                  className="w-full border-2 border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.01] rounded-2xl p-4 my-2 flex flex-col gap-2.5 animate-in fade-in duration-300 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <BookOpen className="size-3.5" />
                    Đoạn văn cần đọc từ Coach:
                  </div>
                  <div className="text-sm font-sans font-medium text-foreground leading-relaxed pl-1 italic select-all border-l-2 border-primary/40">
                    &ldquo;{msg.text}&rdquo;
                  </div>
                  <div className="text-[9px] text-muted-foreground/80 flex items-center gap-1 font-semibold">
                    <Volume2 className="size-3 text-primary" />
                    Bí kíp: Nghe kỹ ngữ điệu của Coach rồi đọc to lại toàn bộ
                    câu trên.
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] text-xs ${
                  isUser ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-[9px] font-bold text-muted-foreground mb-0.5 capitalize">
                  {isUser ? 'Bạn' : 'Coach'}
                </span>
                <Bubble
                  variant={isUser ? 'default' : 'outline'}
                  align={isUser ? 'end' : 'start'}
                >
                  <BubbleContent
                    className={
                      isUser
                        ? 'rounded-2xl rounded-tr-none p-2.5 font-sans leading-relaxed text-xs'
                        : 'rounded-2xl rounded-tl-none p-2.5 font-sans leading-relaxed text-xs bg-white dark:bg-zinc-800 border border-border/80'
                    }
                  >
                    {msg.text}
                  </BubbleContent>
                </Bubble>
              </div>
            );
          })
        )}
        {isThinking && (
          <div className="self-start flex flex-col items-start max-w-[85%] text-xs">
            <span className="text-[9px] font-bold text-muted-foreground mb-0.5">
              Coach
            </span>
            <Bubble variant="outline" align="start">
              <BubbleContent className="rounded-2xl rounded-tl-none p-2.5 font-sans leading-relaxed text-xs bg-white dark:bg-zinc-800 border border-border/80 italic text-muted-foreground/60 flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin text-primary" />
                Đang suy nghĩ...
              </BubbleContent>
            </Bubble>
          </div>
        )}
      </div>
    </div>
  );
}
