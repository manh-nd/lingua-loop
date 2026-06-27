'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MistakeCandidateItem = {
  patternKey: string;
  category: string;
  wrongText: string;
  correctText: string;
  explanationVi: string;
  shouldSave: boolean;
};

interface MistakeCandidateListProps {
  candidates: MistakeCandidateItem[];
  className?: string;
}

export function MistakeCandidateList({
  candidates,
  className,
}: MistakeCandidateListProps) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-3', className)}>
      {candidates.map((mistake, idx) => (
        <Card
          key={idx}
          className="border border-border/60 bg-muted/5 shadow-none overflow-hidden animate-in fade-in duration-200"
        >
          <div className="py-2.5 px-3.5 bg-muted/20 border-b border-border/40 flex flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-foreground font-bold">
                {mistake.patternKey}
              </code>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border font-medium">
                Khung: {mistake.category}
              </span>
            </div>
            {mistake.shouldSave && (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold flex items-center gap-1 dark:bg-amber-500/20 dark:text-amber-400">
                <BookOpen className="size-2.5" />
                Khuyên học
              </span>
            )}
          </div>
          <CardContent className="py-3 px-3.5 flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-red-500/5 rounded-sm border border-red-500/10">
                <span className="text-[9px] text-red-600/70 block uppercase font-bold mb-0.5">
                  Lỗi sai (Incorrect):
                </span>
                <span className="text-red-600 dark:text-red-400 line-through select-all">
                  {mistake.wrongText}
                </span>
              </div>
              <div className="p-2 bg-emerald-500/5 rounded-sm border border-emerald-500/10">
                <span className="text-[9px] text-emerald-600/70 block uppercase font-bold mb-0.5">
                  Đúng (Correct):
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold select-all">
                  {mistake.correctText}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal mt-1 border-t border-border/30 pt-2 flex items-start gap-1">
              <span className="text-primary mt-0.5">💡</span>
              <span>{mistake.explanationVi}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
