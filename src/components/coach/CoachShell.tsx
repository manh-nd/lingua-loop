'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface CoachShellProps {
  headerTitle: string;
  headerIcon: ReactNode;
  sidebarTitle: string;
  sidebarDescription: string;
  showReset: boolean;
  onReset: () => void;
  sidebarContent: ReactNode;
  mainContent: ReactNode;
}

export function CoachShell({
  headerTitle,
  headerIcon,
  sidebarTitle,
  sidebarDescription,
  showReset,
  onReset,
  sidebarContent,
  mainContent,
}: CoachShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Skip to content
      </a>

      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-gradient-to-tr from-primary/10 via-pink-500/5 to-transparent rounded-full blur-3xl -z-10 animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-gradient-to-br from-amber-500/5 via-primary/5 to-transparent rounded-full blur-3xl -z-10 animate-float-2" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            <span>Quay lại</span>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              {headerIcon}
            </div>
            <span className="font-heading font-bold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent uppercase">
              {headerTitle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
            MVP v0
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:grid md:grid-cols-12 gap-8"
      >
        {/* Left Column: Form Controls */}
        <section className="md:col-span-5 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold tracking-tight text-balance">
                {sidebarTitle}
              </h1>
              <p className="text-xs text-muted-foreground">
                {sidebarDescription}
              </p>
            </div>
            {/* New Draft / Clear button */}
            {showReset && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={onReset}
                className="text-[10px] shrink-0 font-bold border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="size-3 mr-1" />
                Làm mới
              </Button>
            )}
          </div>
          {sidebarContent}
        </section>

        {/* Right Column: Coach Response */}
        <section className="md:col-span-7 flex flex-col gap-6">
          {mainContent}
        </section>
      </main>
    </div>
  );
}
