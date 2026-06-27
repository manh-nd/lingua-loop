'use client';

import { cn } from '@/lib/utils';

export type CorrectionItem = {
  category: string;
  original: string;
  improved: string;
  reasonVi: string;
};

interface CorrectionListProps {
  corrections: CorrectionItem[];
  className?: string;
}

export function CorrectionList({
  corrections,
  className,
}: CorrectionListProps) {
  if (!corrections || corrections.length === 0) return null;

  return (
    <div
      className={cn(
        'border border-border/60 rounded-md bg-card overflow-hidden',
        className
      )}
    >
      <div className="grid grid-cols-1 divide-y divide-border/40">
        {corrections.map((corr, idx) => (
          <div
            key={idx}
            className="p-4 text-xs flex flex-col gap-3 animate-in fade-in duration-200"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30">
                {corr.category}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-sm text-red-600 dark:text-red-400 line-through select-all leading-normal whitespace-pre-wrap">
                {corr.original}
              </div>
              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-sm text-emerald-600 dark:text-emerald-400 font-semibold select-all leading-normal whitespace-pre-wrap">
                {corr.improved}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1">
              <span className="text-primary mt-0.5">👉</span>
              <span>{corr.reasonVi}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
