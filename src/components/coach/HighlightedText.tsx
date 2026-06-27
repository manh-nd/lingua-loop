'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface Correction {
  original: string;
  improved: string;
  reasonVi: string;
  category: string;
}

interface HighlightedTextProps {
  text: string;
  corrections?: Correction[];
}

export function HighlightedText({
  text,
  corrections = [],
}: HighlightedTextProps) {
  if (!text) return null;
  if (!corrections || corrections.length === 0) {
    return <span className="select-all">{text}</span>;
  }

  // Filter out corrections that are not actually in the text
  const validCorrections = corrections.filter(
    (c) => c.improved && text.includes(c.improved)
  );

  if (validCorrections.length === 0) {
    return <span className="select-all">{text}</span>;
  }

  // Sort corrections by length of improved text descending to match longest matches first
  const sortedCorrections = [...validCorrections].sort(
    (a, b) => b.improved.length - a.improved.length
  );

  // Escapes regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Build matching groups
  const regexPattern = `(${sortedCorrections
    .map((c) => escapeRegExp(c.improved))
    .join('|')})`;
  const regex = new RegExp(regexPattern, 'g');

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const match = sortedCorrections.find((c) => c.improved === part);
        if (match) {
          let colorClass =
            'text-primary underline decoration-primary/40 bg-primary/5 dark:bg-primary/10';
          if (match.category === 'grammar') {
            colorClass =
              'text-red-500 underline decoration-red-500/40 bg-red-500/5 dark:bg-red-500/10';
          } else if (match.category === 'tone') {
            colorClass =
              'text-pink-500 underline decoration-pink-500/40 bg-pink-500/5 dark:bg-pink-500/10';
          } else if (match.category === 'word_choice') {
            colorClass =
              'text-amber-500 underline decoration-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10';
          }

          return (
            <span key={index} className="group relative inline-block">
              <span
                className={cn(
                  'px-1 py-0.5 rounded cursor-help font-semibold transition-all hover:bg-opacity-20 select-all',
                  colorClass
                )}
              >
                {part}
              </span>
              {/* CSS Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900/95 dark:bg-slate-100/95 text-slate-50 dark:text-slate-900 p-3 text-[10px] font-sans font-normal leading-relaxed shadow-md opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 flex flex-col gap-1 border border-slate-800/40 dark:border-slate-200/40">
                <span className="font-bold uppercase tracking-wider text-[9px] text-primary dark:text-indigo-600">
                  {match.category.replace('_', ' ')}
                </span>
                <span className="font-medium">{match.reasonVi}</span>
              </span>
            </span>
          );
        }
        return (
          <span key={index} className="select-all">
            {part}
          </span>
        );
      })}
    </span>
  );
}
