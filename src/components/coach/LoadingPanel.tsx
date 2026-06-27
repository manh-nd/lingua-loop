'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingPanelProps {
  layoutType?: 'message' | 'explanation';
}

export function LoadingPanel({ layoutType = 'message' }: LoadingPanelProps) {
  const headerHeight = layoutType === 'message' ? 'h-9' : 'h-20';
  const contentHeight = layoutType === 'message' ? 'h-6' : 'h-10';

  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-2">
        <span className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-xs font-semibold text-muted-foreground">
          Coach đang phân tích…
        </span>
      </div>
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border/20">
          <div className="h-4 bg-muted/60 rounded w-1/3 mb-2" />
          <div className={`${headerHeight} bg-muted/30 rounded w-full`} />
        </CardHeader>
        <CardContent className="pt-4 flex flex-col gap-4">
          <div className="h-3 bg-muted/50 rounded w-1/5" />
          <div className={`${contentHeight} bg-muted/30 rounded w-full`} />
          <div className="h-3 bg-muted/50 rounded w-1/4" />
          <div className="h-14 bg-muted/30 rounded w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
