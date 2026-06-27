'use client';

import { TriangleAlert } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/lib/error';
import { cn } from '@/lib/utils';

interface ErrorPanelProps {
  error: unknown;
  className?: string;
}

export function ErrorPanel({ error, className }: ErrorPanelProps) {
  if (!error) return null;

  const friendlyMessage = getFriendlyErrorMessage(error);

  return (
    <div
      className={cn(
        'p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex gap-2.5 items-start animate-in fade-in slide-in-from-top-1 duration-200',
        className
      )}
      role="alert"
    >
      <TriangleAlert className="size-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed font-medium">{friendlyMessage}</span>
    </div>
  );
}
