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
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {phrases.map((item, idx) => (
        <Card
          key={idx}
          className="border border-border bg-card hover:border-primary/35 hover:shadow-xs transition-all duration-200 shadow-none overflow-hidden animate-in fade-in duration-200 py-0"
        >
          <CardContent className="p-4.5 flex flex-col gap-3.5 text-xs">
            <span className="font-mono font-bold text-primary select-all text-[13px] border-b border-border pb-2.5 leading-normal">
              {item.phrase}
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-foreground/90 font-medium leading-relaxed">
                🇻🇳{' '}
                <span className="text-muted-foreground font-normal">
                  Nghĩa:
                </span>{' '}
                {item.meaningVi}
              </span>
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                💼{' '}
                <span className="font-semibold text-foreground/80">
                  Ngữ cảnh:
                </span>{' '}
                {item.situationVi}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
