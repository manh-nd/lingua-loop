'use client';

import React from 'react';
import { LiveMode } from '@/core/live/live-modes';
import { LiveMessage } from '@/lib/hooks/use-live-session';
import { LiveWaveform } from '@/components/coach/LiveWaveform';
import { LiveTranscript } from '@/components/live/LiveTranscript';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

interface LiveCallViewProps {
  isConnecting: boolean;
  isConnected: boolean;
  micLevel: number;
  speakerLevel: number;
  isThinking: boolean;
  isMuted: boolean;
  transcript: LiveMessage[];
  mode: LiveMode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  toggleMute: () => void;
  onEndCall: () => void;
}

export function LiveCallView({
  isConnecting,
  isConnected,
  micLevel,
  speakerLevel,
  isThinking,
  isMuted,
  transcript,
  mode,
  scrollRef,
  toggleMute,
  onEndCall,
}: LiveCallViewProps) {
  return (
    <Card className="w-full border border-border/80 shadow-sm rounded-3xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-6 flex flex-col items-center gap-5.5">
        {/* Call Status Indicator */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full animate-pulse">
            {isConnecting ? 'Đang kết nối...' : 'Cuộc gọi đang diễn ra'}
          </span>
          <span className="text-xs text-muted-foreground font-medium text-center max-w-sm">
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

        {/* Real-time Subtitles */}
        <LiveTranscript
          transcript={transcript}
          isThinking={isThinking}
          mode={mode}
          scrollRef={scrollRef}
        />

        {/* Call Controls */}
        <div className="flex items-center gap-5 pt-2 border-t border-border/40 w-full justify-center">
          <Button
            type="button"
            onClick={toggleMute}
            className={`size-11 rounded-full p-0 flex items-center justify-center cursor-pointer border transition-colors ${
              isMuted
                ? 'bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90'
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
            onClick={onEndCall}
            className="h-11 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer font-bold text-xs"
          >
            <PhoneOff className="size-4.5 fill-current" />
            Gác máy / Xem đánh giá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
