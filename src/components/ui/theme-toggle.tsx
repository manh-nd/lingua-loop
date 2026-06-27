'use client';

import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme('dark'); // default
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-md opacity-0"
        disabled
      >
        <Moon className="size-4" />
      </Button>
    );
  }

  const themes = [
    { key: 'light', label: 'Sáng (Light)', icon: Sun, color: 'text-amber-500' },
    { key: 'dark', label: 'Tối (Dark)', icon: Moon, color: 'text-indigo-400' },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: Laptop,
      color: 'text-emerald-500',
    },
  ] as const;

  const ActiveIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;
  const activeColor =
    theme === 'light'
      ? 'text-amber-500'
      : theme === 'dark'
        ? 'text-indigo-400'
        : 'text-emerald-500';

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title={`Giao diện: ${theme.toUpperCase()}`}
        className="size-8 rounded-md hover:bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground relative transition-all active:scale-95 cursor-pointer"
      >
        <ActiveIcon
          className={cn('size-4 animate-in fade-in duration-250', activeColor)}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-38 rounded-xl border border-border/50 bg-white/70 dark:bg-black/65 backdrop-blur-md p-1 shadow-lg shadow-black/5 dark:shadow-black/25 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-0.5">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleThemeChange(t.key)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all text-left',
                  isSelected
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'hover:bg-muted/65 text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('size-3.5', t.color)} />
                  <span>{t.label}</span>
                </div>
                {isSelected && <Check className="size-3 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
