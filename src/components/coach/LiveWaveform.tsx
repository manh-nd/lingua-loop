import React from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveWaveformProps {
  micLevel: number;
  speakerLevel: number;
  isThinking: boolean;
  isConnected: boolean;
  isMuted: boolean;
}

export function LiveWaveform({
  micLevel,
  speakerLevel,
  isThinking,
  isConnected,
  isMuted,
}: LiveWaveformProps) {
  // Normalize levels to a nice multiplier for visual scaling (clamp to max 2.2x scale)
  const activeLevel = Math.max(micLevel, speakerLevel);
  const scale = 1 + Math.min(activeLevel * 7, 1.2);
  const opacity = 0.15 + Math.min(activeLevel * 2.5, 0.4);

  return (
    <div className="relative flex items-center justify-center size-44 select-none">
      {/* Outer Glow Ring 3 (Deepest) */}
      {isConnected && activeLevel > 0.015 && (
        <div
          className="absolute inset-0 rounded-full bg-primary/10 blur-xl transition-all duration-75"
          style={{
            transform: `scale(${scale * 1.3})`,
            opacity: opacity * 0.4,
          }}
        />
      )}

      {/* Outer Glow Ring 2 */}
      {isConnected && activeLevel > 0.015 && (
        <div
          className="absolute inset-2 rounded-full bg-primary/20 blur-md transition-all duration-75"
          style={{
            transform: `scale(${scale * 1.15})`,
            opacity: opacity * 0.7,
          }}
        />
      )}

      {/* Pulsing Ring 1 (Base ripple) */}
      <div
        className={cn(
          'absolute inset-6 rounded-full border border-primary/20 bg-primary/[0.01] transition-all duration-100',
          !isConnected && 'animate-pulse'
        )}
        style={{
          transform: isConnected ? `scale(${scale})` : undefined,
        }}
      />

      {/* Spinning Ring for Thinking state */}
      {isThinking && (
        <div className="absolute inset-6 rounded-full border-2 border-transparent border-t-primary/75 border-r-primary/30 animate-spin" />
      )}

      {/* Inner Sphere */}
      <div
        className={cn(
          'relative size-24 rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 bg-card',
          isConnected
            ? isMuted
              ? 'border-red-500/30 text-red-500'
              : isThinking
                ? 'border-amber-500/30 text-amber-500'
                : speakerLevel > 0.015
                  ? 'border-primary/30 text-primary bg-primary/[0.02]'
                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.01]'
            : 'border-border text-muted-foreground'
        )}
      >
        {isThinking ? (
          <Loader2 className="size-7 animate-spin stroke-[1.8]" />
        ) : isMuted ? (
          <MicOff className="size-7 stroke-[1.8]" />
        ) : speakerLevel > 0.015 ? (
          <Volume2 className="size-7 stroke-[1.8] animate-pulse" />
        ) : (
          <Mic className="size-7 stroke-[1.8] animate-pulse" />
        )}

        {/* Small active status dot */}
        {isConnected && (
          <span
            className={cn(
              'absolute bottom-2 right-2 size-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900',
              isMuted
                ? 'bg-red-500'
                : isThinking
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500 animate-ping'
            )}
          />
        )}
      </div>
    </div>
  );
}
