'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
}

export function CollapsibleSection({
  title,
  children,
  icon,
  defaultOpen = false,
  className,
  headerClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        'border border-border/80 rounded-md bg-card overflow-hidden transition-all duration-200',
        className
      )}
    >
      <h3>
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/30 transition-colors text-left focus-visible:bg-muted/50 outline-hidden cursor-pointer select-none',
            headerClassName
          )}
        >
          <span className="flex items-center gap-2 text-foreground/80">
            {icon}
            {title}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200 text-muted-foreground/80',
              isOpen && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen
            ? 'grid grid-rows-[1fr] opacity-100'
            : 'grid grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-border/40 text-xs">
            {children}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
