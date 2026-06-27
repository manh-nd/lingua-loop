'use client';

import {
  messageSamples,
  explanationSamples,
  readingSamples,
  MessageSample,
  ExplanationSample,
  ReadingSample,
} from '@/lib/samples';
import { Button } from '@/components/ui/button';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleChipsProps {
  type: 'message' | 'explanation' | 'reading';
  onSelectSample: (
    sample: MessageSample | ExplanationSample | ReadingSample
  ) => void;
  className?: string;
}

export function SampleChips({
  type,
  onSelectSample,
  className,
}: SampleChipsProps) {
  const samples =
    type === 'message'
      ? messageSamples
      : type === 'explanation'
        ? explanationSamples
        : readingSamples;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
        <Sparkle className="size-3 text-primary animate-pulse" />
        Điền nhanh mẫu (Click to fill):
      </span>
      <div className="flex flex-wrap gap-1.5">
        {samples.map((sample) => (
          <Button
            key={sample.id}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onSelectSample(sample)}
            className="text-[10px] font-medium border-border/80 hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all text-muted-foreground hover:text-primary"
          >
            {sample.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
