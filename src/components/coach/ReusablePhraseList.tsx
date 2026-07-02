'use client';

import { cn } from '@/lib/utils';

export type ReusablePhraseItem = {
  phrase: string;
  meaningVi: string;
  situationVi: string;
};

interface ReusablePhraseListProps {
  phrases: ReusablePhraseItem[];
  className?: string;
}

export function ReusablePhraseList({
  phrases,
  className,
}: ReusablePhraseListProps) {
  if (!phrases || phrases.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl glass-card divide-y divide-border/40 overflow-hidden shadow-sm animate-slide-up',
        className
      )}
    >
      {phrases.map((item, idx) => {
        return (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-all duration-200 hover:bg-muted/40 select-text"
          >
            {/* Left side: Phrase, meaning, context */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-sans font-bold text-foreground text-[12.5px] select-all leading-normal">
                  {item.phrase}
                </span>
                <span className="text-[11.5px] text-muted-foreground font-sans font-medium">
                  — {item.meaningVi}
                </span>
              </div>
              <p className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-sans font-medium">
                💼 {item.situationVi}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
