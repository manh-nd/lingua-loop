'use client';

import { Card, CardContent } from '@/components/ui/card';
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
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)}>
      {phrases.map((item, idx) => (
        <Card
          key={idx}
          className="border border-border/80 bg-card hover:border-primary/30 transition-all duration-200 shadow-none overflow-hidden animate-in fade-in duration-200"
        >
          <CardContent className="p-3 flex flex-col gap-1.5 text-xs">
            <span className="font-mono font-bold text-primary select-all text-[12px] border-b border-border/30 pb-1.5">
              {item.phrase}
            </span>
            <span className="text-[10px] text-foreground/90 font-medium">
              🇻🇳{' '}
              <span className="text-muted-foreground font-normal">Nghĩa:</span>{' '}
              {item.meaningVi}
            </span>
            <span className="text-[10px] text-muted-foreground leading-relaxed">
              💼{' '}
              <span className="font-medium text-foreground/80">Ngữ cảnh:</span>{' '}
              {item.situationVi}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
