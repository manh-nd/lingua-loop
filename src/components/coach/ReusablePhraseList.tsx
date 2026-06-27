'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { addLocalMemoryItem } from '@/lib/memory/local-memory-store';
import Link from 'next/link';
import { Brain, Check, ExternalLink } from 'lucide-react';
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
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {phrases.map((item, idx) => {
        const savedId = savedIds[idx];
        const isSaved = !!savedId;

        return (
          <Card
            key={idx}
            className={cn(
              'border hover:shadow-xs transition-all duration-200 shadow-none overflow-hidden animate-in fade-in duration-200 py-0 rounded-xl',
              isSaved
                ? 'border-emerald-500/30 bg-emerald-500/[0.01]'
                : 'border-border bg-card'
            )}
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

              {/* Save/Review Action Footer */}
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-border/40 mt-1 select-none">
                {isSaved ? (
                  <div className="flex gap-2">
                    <Link
                      href="/memory"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 py-1 px-2 rounded border border-emerald-500/20"
                    >
                      Xem trong Sổ tay
                      <ExternalLink className="size-3" />
                    </Link>
                    <Link
                      href={`/review?id=${savedId}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-1 px-2.5 rounded shadow-xs"
                    >
                      <Brain className="size-3 mr-0.5" />
                      Luyện ngay
                    </Link>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => handleSave(item, idx)}
                    className="text-[10px] h-7 px-3.5 font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xs cursor-pointer"
                  >
                    <Brain className="size-3 mr-1" />
                    Lưu vào Sổ tay
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
