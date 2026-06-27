'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from './button';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

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

  const toggleTheme = () => {
    let nextTheme: Theme = 'light';
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'system';
    else if (theme === 'system') nextTheme = 'light';

    setTheme(nextTheme);
    applyTheme(nextTheme);
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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Theme: ${theme.toUpperCase()} (Click to change)`}
      className="size-8 rounded-md hover:bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground relative transition-all active:scale-95"
    >
      {theme === 'light' && (
        <Sun className="size-4 text-amber-500 animate-in spin-in-12 duration-300" />
      )}
      {theme === 'dark' && (
        <Moon className="size-4 text-indigo-400 animate-in spin-in-12 duration-300" />
      )}
      {theme === 'system' && (
        <Laptop className="size-4 text-emerald-500 animate-in spin-in-12 duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
