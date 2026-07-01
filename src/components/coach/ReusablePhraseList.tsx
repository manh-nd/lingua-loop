'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { addLocalMemoryItem } from '@/lib/memory/local-memory-store';
import Link from 'next/link';
import { Brain, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ReusablePhraseItem = {
  phrase: string;
  meaningVi: string;
  situationVi: string;
};

interface ReusablePhraseListProps {
  phrases: ReusablePhraseItem[];
  sourceWorkflow?: 'message' | 'explanation' | 'reading';
  className?: string;
}

export function ReusablePhraseList({
  phrases,
  sourceWorkflow = 'message',
  className,
}: ReusablePhraseListProps) {
  const [savedIds, setSavedIds] = useState<Record<number, string | null>>({});

  // Sync saved status with localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;
      try {
        const data = localStorage.getItem('lingua-loop-memory');
        const savedItems = data ? JSON.parse(data) : [];
        const ids: Record<number, string | null> = {};
        phrases.forEach((item, index) => {
          const match = savedItems.find(
            (s: any) =>
              s.memoryType === 'reusable_phrase' && s.phrase === item.phrase
          );
          if (match) {
            ids[index] = match.id;
          }
        });
        setSavedIds(ids);
      } catch (e) {
        console.error('Failed to sync reusable phrases', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [phrases]);

  const handleSave = (item: ReusablePhraseItem, index: number) => {
    // Generate a valid pattern key from the phrase
    const cleanPattern = item.phrase
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30);

    const patternKey = cleanPattern
      ? `phrase_${cleanPattern}`
      : 'reusable_phrase_item';

    const saved = addLocalMemoryItem({
      memoryType: 'reusable_phrase',
      sourceWorkflow,
      patternKey,
      category: 'naturalness',
      explanationVi: `Ý nghĩa: ${item.meaningVi}`,
      phrase: item.phrase,
      situationVi: item.situationVi,
      status: 'active',
    });

    setSavedIds((prev) => ({ ...prev, [index]: saved.id }));
  };

  if (!phrases || phrases.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl glass-card divide-y divide-border/40 overflow-hidden shadow-sm animate-slide-up',
        className
      )}
    >
      {phrases.map((item, idx) => {
        const savedId = savedIds[idx];
        const isSaved = !!savedId;

        return (
          <div
            key={idx}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-all duration-200 hover:bg-muted/40 select-text',
              isSaved && 'bg-emerald-500/[0.01]'
            )}
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

            {/* Right side: Actions */}
            <div className="shrink-0 flex items-center gap-2 select-none self-end sm:self-center">
              {isSaved ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/memory"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 py-1 px-2.5 rounded border border-emerald-500/20 h-7"
                    title="Xem trong Sổ tay"
                  >
                    Đã lưu
                    <Check className="size-3" />
                  </Link>
                  <Link
                    href={`/review?id=${savedId}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-1 px-2.5 rounded shadow-2xs h-7"
                  >
                    <Brain className="size-3" />
                    Luyện ngay
                  </Link>
                </div>
              ) : (
                <Button
                  type="button"
                  size="xs"
                  onClick={() => handleSave(item, idx)}
                  className="text-[10px] h-7 px-3 font-bold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 hover:border-primary shadow-xs cursor-pointer flex items-center gap-1 interactive-hover"
                >
                  <Brain className="size-3.5 text-primary group-hover:text-primary-foreground" />
                  Lưu sổ tay
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
