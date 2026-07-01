'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingPanelProps {
  layoutType?: 'message' | 'explanation';
}

export function LoadingPanel({ layoutType = 'message' }: LoadingPanelProps) {
  const headerHeight = layoutType === 'message' ? 'h-9' : 'h-20';
  const contentHeight = layoutType === 'message' ? 'h-6' : 'h-10';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-xs font-semibold text-muted-foreground">
          Coach đang phân tích…
        </span>
      </div>
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border/20 flex flex-col gap-2">
          <Skeleton className="h-4 rounded w-1/3 bg-muted/60" />
          <Skeleton className={`${headerHeight} rounded w-full bg-muted/30`} />
        </CardHeader>
        <CardContent className="pt-4 flex flex-col gap-4">
          <Skeleton className="h-3 rounded w-1/5 bg-muted/50" />
          <Skeleton className={`${contentHeight} rounded w-full bg-muted/30`} />
          <Skeleton className="h-3 rounded w-1/4 bg-muted/50" />
          <Skeleton className="h-14 rounded w-full bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  );
}
