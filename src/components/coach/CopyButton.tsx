'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  size?: 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'secondary';
  title?: string;
}

export function CopyButton({
  text,
  size = 'icon-xs',
  className,
  variant = 'ghost',
  title = 'Sao chép',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      title={title}
      className={cn(
        'relative transition-all duration-200 active:scale-95',
        copied
          ? 'text-emerald-500 hover:text-emerald-600'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {copied ? (
        <Check className="size-3.5 animate-in fade-in zoom-in-50 duration-200" />
      ) : (
        <Copy className="size-3.5 animate-in fade-in zoom-in-50 duration-200" />
      )}
      <span className="sr-only">{title}</span>
    </Button>
  );
}
