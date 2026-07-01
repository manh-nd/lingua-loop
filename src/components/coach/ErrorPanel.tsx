'use client';

import { TriangleAlert } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/lib/error';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorPanelProps {
  error: unknown;
  className?: string;
}

export function ErrorPanel({ error, className }: ErrorPanelProps) {
  if (!error) return null;

  const friendlyMessage = getFriendlyErrorMessage(error);

  return (
    <Alert
      variant="destructive"
      className={cn(
        'animate-in fade-in slide-in-from-top-1 duration-200 border-destructive/20 bg-destructive/10 dark:bg-destructive/5 rounded-md p-3.5',
        className
      )}
    >
      <TriangleAlert />
      <AlertDescription className="leading-relaxed font-medium">
        {friendlyMessage}
      </AlertDescription>
    </Alert>
  );
}
