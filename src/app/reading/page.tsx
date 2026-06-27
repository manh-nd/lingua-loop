'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field';
import { submitReadingCoach } from './actions';
import { ReadingCoachResult } from '@/core/reading/reading.schema';
import {
  Sparkle,
  BookOpen,
  ArrowRight,
  CheckCircle,
  FileCheck,
  Languages,
  BadgeAlert,
  AlertTriangle,
  Lightbulb,
  MessageSquareReply,
} from 'lucide-react';
import { CopyButton } from '@/components/coach/CopyButton';
import { ErrorPanel } from '@/components/coach/ErrorPanel';
import { StarterScreen } from '@/components/coach/StarterScreen';
import { SampleChips } from '@/components/coach/SampleChips';
import { CollapsibleSection } from '@/components/coach/CollapsibleSection';
import { ReusablePhraseList } from '@/components/coach/ReusablePhraseList';
import { CoachShell } from '@/components/coach/CoachShell';
import { LoadingPanel } from '@/components/coach/LoadingPanel';
import { cn } from '@/lib/utils';

export default function ReadingPage() {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<ReadingCoachResult | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [pulseSubmit, setPulseSubmit] = useState(false);
  const [osBadge, setOsBadge] = useState('⌘↵');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect OS for keyboard shortcuts badge
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectOs = () => {
        const userAgent = navigator.userAgent.toUpperCase();
        const platform = navigator.platform.toUpperCase();
        const isMac =
          platform.indexOf('MAC') >= 0 || userAgent.indexOf('MAC') >= 0;
        setOsBadge(isMac ? '⌘↵' : 'Ctrl+Enter');
      };
      const id = setTimeout(detectOs, 0);
      return () => clearTimeout(id);
    }
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + Enter) inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (text.trim() && text.length <= 3000 && !isPending) {
        e.preventDefault();
        triggerSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmit();
  };

  const triggerSubmit = () => {
    if (!text.trim() || text.length > 3000) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setError(null);
    startTransition(async () => {
      try {
        const data = await submitReadingCoach({
          text,
          context: context.trim() || undefined,
        });
        setResult(data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.'
        );
      }
    });
  };

  const handleSelectSample = (sample: any) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setContext(sample.context || '');

    // Typing effect
    let currentText = '';
    let index = 0;
    setText('');

    typingIntervalRef.current = setInterval(() => {
      if (index < sample.text.length) {
        currentText += sample.text[index];
        setText(currentText);
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 8);

    setPulseSubmit(true);
    setTimeout(() => setPulseSubmit(false), 2000);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleReset = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setText('');
    setContext('');
    setResult(null);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  return (
    <CoachShell
      headerTitle="READING COACH"
      headerIcon={<BookOpen className="size-4 text-primary" />}
      sidebarTitle="Hiểu sâu tiếng Anh công sở"
      sidebarDescription="Dán tin nhắn Slack/Teams, email, comment PR hoặc Jira để xem giải nghĩa, sắc thái và gợi ý phản hồi tự nhiên."
      showReset={!!(text || context || result)}
      onReset={handleReset}
      sidebarContent={
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            {/* Context Input */}
            <Field>
              <FieldLabel
                htmlFor="context-input"
                className="font-bold text-xs uppercase tracking-wider"
              >
                Ngữ cảnh / Tình huống (Không bắt buộc)
              </FieldLabel>
              <Input
                id="context-input"
                name="context"
                autoComplete="off"
                placeholder="Ví dụ: tin nhắn Slack từ đồng nghiệp, email từ đối tác..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={isPending}
                className="h-8.5 text-xs placeholder:text-muted-foreground/60"
              />
            </Field>

            {/* Input Text */}
            <Field>
              <div className="flex justify-between items-baseline mb-1">
                <FieldLabel
                  htmlFor="text-input"
                  className="font-bold text-xs uppercase tracking-wider mb-0"
                >
                  Nội dung tiếng Anh cần đọc
                </FieldLabel>
                <span
                  className={cn(
                    'text-[10px] font-mono',
                    text.length > 3000
                      ? 'text-red-500 font-bold'
                      : 'text-muted-foreground'
                  )}
                >
                  {text.length}/3000
                </span>
              </div>
              <Textarea
                id="text-input"
                name="text"
                autoComplete="off"
                ref={textareaRef}
                rows={8}
                placeholder="Dán đoạn tin nhắn tiếng Anh vào đây..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                required
                autoFocus
                className={cn(
                  'text-xs p-3 focus-visible:ring-primary/40 resize-y min-h-32',
                  text.length > 3000 &&
                    'border-red-500 focus-visible:ring-red-500/40'
                )}
              />
              <div className="flex justify-between items-center mt-1">
                <FieldDescription className="text-[10px] m-0">
                  Bấm{' '}
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">
                    {osBadge}
                  </kbd>{' '}
                  để gửi nhanh khi đang gõ.
                </FieldDescription>
                {text.length > 3000 && (
                  <span className="text-[10px] text-red-500 font-medium">
                    Vượt quá giới hạn 3000 ký tự!
                  </span>
                )}
              </div>
            </Field>
          </FieldGroup>

          {/* Quick chips templates */}
          <SampleChips
            type="reading"
            onSelectSample={handleSelectSample}
            className="mt-1"
          />

          <Button
            type="submit"
            disabled={isPending || !text.trim() || text.length > 3000}
            className={cn(
              'w-full h-9 font-bold uppercase tracking-wider text-xs cursor-pointer select-none active:scale-99 transition-all duration-300',
              'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
              pulseSubmit && 'animate-bounce',
              (isPending || text.length > 3000) &&
                'opacity-85 cursor-not-allowed'
            )}
          >
            {isPending ? (
              <>
                <span className="animate-spin mr-2 size-3.5 border-2 border-current border-t-transparent rounded-full" />
                Coach đang phân tích…
              </>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                Phân tích tin nhắn
                <kbd className="px-1 py-0.5 rounded bg-primary-foreground/15 text-[8.5px] font-mono select-none tracking-normal opacity-85">
                  {osBadge.replace('↵', 'Enter')}
                </kbd>
                <ArrowRight className="size-3.5" />
              </span>
            )}
          </Button>
        </form>
      }
      mainContent={
        <>
          <ErrorPanel error={error} />

          {isPending ? (
            <LoadingPanel layoutType="explanation" />
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phân tích từ Reading Coach
                  </h2>
                </div>
              </div>

              {/* 1. Natural Translation & Summary */}
              <Card className="border border-primary/35 bg-gradient-to-br from-primary/[0.02] to-indigo-500/[0.01] backdrop-blur-md shadow-sm relative overflow-hidden rounded-xl p-5 flex flex-col gap-4">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-indigo-500" />
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-primary">
                  <Languages className="size-4" />
                  Dịch nghĩa tự nhiên (Natural Translation)
                </div>
                <div className="text-sm font-semibold leading-relaxed text-foreground select-all bg-white/40 dark:bg-black/20 p-4 rounded-lg border border-border/40">
                  {result.naturalTranslation}
                </div>
                <div className="h-px bg-border/80 w-full" />
                <div className="flex gap-2 items-start text-xs text-muted-foreground">
                  <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed italic">
                    <span className="font-bold text-foreground/80 not-italic">
                      Tóm tắt:{' '}
                    </span>
                    {result.summaryVi}
                  </p>
                </div>
              </Card>

              {/* 2. Tone Analysis */}
              <Card className="border border-border bg-white/20 dark:bg-black/10 shadow-none rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    <BadgeAlert className="size-4 text-indigo-500" />
                    Phân tích tông giọng (Tone & Implied Meaning)
                  </div>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {result.toneAnalysis.toneVi}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  <span className="font-semibold text-muted-foreground">
                    Hàm ý/Sắc thái:{' '}
                  </span>
                  {result.toneAnalysis.impliedMeaningVi}
                </p>
              </Card>

              {/* 3. Collapsible Learning Sections */}
              <div className="flex flex-col gap-3.5 border-t border-border/30 pt-5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Chi tiết ngôn ngữ & Góp ý nguồn
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Key Phrases */}
                  {result.keyPhrases && result.keyPhrases.length > 0 && (
                    <CollapsibleSection
                      title="Cụm từ hữu ích (Key Phrases)"
                      defaultOpen={true}
                    >
                      <ReusablePhraseList
                        phrases={result.keyPhrases.map((kp) => ({
                          phrase: kp.phrase,
                          meaningVi: kp.meaningVi,
                          situationVi: kp.usageVi,
                        }))}
                      />
                    </CollapsibleSection>
                  )}

                  {/* Word-by-word traps / Misunderstandings */}
                  {result.misunderstandingsVi &&
                    result.misunderstandingsVi.length > 0 && (
                      <CollapsibleSection
                        title="Bẫy dịch nghĩa & Hiểu lầm dễ gặp"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-3">
                          {result.misunderstandingsVi.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-lg bg-red-500/[0.02] border border-red-500/15 flex flex-col gap-2 text-xs"
                            >
                              <span className="font-semibold text-red-500 flex items-center gap-1">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                Dễ nhầm lẫn: &ldquo;{m.trapVi}&rdquo;
                              </span>
                              <p className="leading-relaxed text-muted-foreground">
                                {m.explanationVi}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                  {/* Source Issues */}
                  {result.sourceIssues && result.sourceIssues.length > 0 && (
                    <CollapsibleSection
                      title="Lỗi sai & Điễn đạt của nguồn (Source Issues)"
                      defaultOpen={true}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {result.sourceIssues.map((s, idx) => {
                          let catColor = '';
                          let catLabel = '';
                          if (s.category === 'typo') {
                            catColor =
                              'bg-rose-500/10 text-rose-500 border-rose-500/20';
                            catLabel = 'Chính tả';
                          } else if (s.category === 'grammar') {
                            catColor =
                              'bg-amber-500/10 text-amber-500 border-amber-500/20';
                            catLabel = 'Ngữ pháp';
                          } else if (s.category === 'awkward_wording') {
                            catColor =
                              'bg-sky-500/10 text-sky-500 border-sky-500/20';
                            catLabel = 'Dựng câu vụng';
                          } else {
                            catColor =
                              'bg-purple-500/10 text-purple-500 border-purple-500/20';
                            catLabel = 'Mơ hồ';
                          }

                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-lg bg-card border border-border flex flex-col gap-2.5 text-xs shadow-2xs"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="font-mono font-bold text-foreground/80 line-through decoration-rose-500/60 select-all">
                                  {s.originalText}
                                </span>
                                <span
                                  className={cn(
                                    'text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border',
                                    catColor
                                  )}
                                >
                                  {catLabel}
                                </span>
                              </div>
                              <p className="leading-relaxed text-foreground/90 font-medium">
                                <span className="text-muted-foreground font-normal">
                                  Góp ý:
                                </span>{' '}
                                {s.issueVi}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 bg-muted/40 p-2 rounded border border-border/40 font-mono text-[11px]">
                                <span className="text-emerald-500 font-bold">
                                  Nên là:
                                </span>
                                <span className="text-foreground select-all font-semibold">
                                  {s.suggestedFix}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>
              </div>

              {/* 4. Reply Suggestions */}
              {result.replySuggestions &&
                result.replySuggestions.length > 0 && (
                  <div className="flex flex-col gap-3 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MessageSquareReply className="size-4 text-primary" />
                      Gợi ý phản hồi bằng tiếng Anh (Reply Suggestions)
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {result.replySuggestions.map((reply, index) => (
                        <Card
                          key={index}
                          className="border border-border bg-white/20 dark:bg-black/10 hover:border-primary/35 hover:bg-white/40 dark:hover:bg-black/20 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4.5 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 leading-relaxed">
                              💡{' '}
                              <span className="font-semibold text-foreground/80">
                                Trường hợp dùng:
                              </span>{' '}
                              {reply.contextVi}
                            </span>
                            <CopyButton text={reply.text} size="icon-sm" />
                          </div>
                          <div className="text-xs font-mono font-medium p-3 bg-muted/60 dark:bg-black/30 border border-border select-all rounded-lg leading-relaxed text-foreground">
                            {reply.text}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            /* Starter Screen */
            <StarterScreen type="reading" onSelectSample={handleSelectSample} />
          )}
        </>
      }
    />
  );
}
