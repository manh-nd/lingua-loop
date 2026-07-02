'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field';
import { submitReadingCoach, saveReadingCandidateAction } from './actions';
import { ReadingCoachResult } from '@/core/reading/reading.schema';
import {
  Sparkle,
  BookOpen,
  ArrowRight,
  Languages,
  BadgeAlert,
  AlertTriangle,
  Lightbulb,
  MessageSquareReply,
  XCircle,
  CheckCircle2,
  Brain,
  Check,
} from 'lucide-react';
import { CopyButton } from '@/components/coach/CopyButton';
import { TTSButton } from '@/components/coach/TTSButton';
import { ErrorPanel } from '@/components/coach/ErrorPanel';
import { StarterScreen } from '@/components/coach/StarterScreen';
import { SampleChips } from '@/components/coach/SampleChips';
import { CollapsibleSection } from '@/components/coach/CollapsibleSection';
import { ReusablePhraseList } from '@/components/coach/ReusablePhraseList';
import { CoachShell } from '@/components/coach/CoachShell';
import { LoadingPanel } from '@/components/coach/LoadingPanel';
import { MessageSample, ExplanationSample, ReadingSample } from '@/lib/samples';
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

  const handleSelectSample = (
    sample: MessageSample | ExplanationSample | ReadingSample
  ) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setResult(null);
    setError(null);
    const readingSample = sample as ReadingSample;
    setContext(readingSample.context || '');

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
      badge="MVP v1"
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
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary animate-pulse" />
                  <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phân tích từ Reading Coach
                  </h2>
                </div>
              </div>

              {/* 1. Natural Translation & Summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 px-1 select-none">
                  <Languages className="size-4 text-primary" />
                  Bản dịch nghĩa tự nhiên (Translation Slate):
                </span>

                <Card className="glass-card rounded-2xl p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
                  {/* Mock Editor Window Header Bar */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3 -mt-1 select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors" />
                        <div className="size-2.5 rounded-full bg-amber-400/80 hover:bg-amber-400 transition-colors" />
                        <div className="size-2.5 rounded-full bg-emerald-400/80 hover:bg-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10.5px] font-semibold text-muted-foreground/80 font-mono ml-2">
                        Reader translation view
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TTSButton
                        text={text}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-xs interactive-hover"
                      />
                      <CopyButton
                        text={result.naturalTranslation}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-xs interactive-hover"
                      />
                    </div>
                  </div>

                  {/* Document Slate Body */}
                  <div className="bg-card border border-border p-5 rounded-xl shadow-xs text-xs leading-relaxed text-foreground select-all font-sans font-semibold transition-all duration-300 hover:border-primary/30">
                    {result.naturalTranslation}
                  </div>

                  {/* Summary section */}
                  <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3.5 flex gap-2.5 items-start text-[11px] text-foreground/90 select-text mt-1">
                    <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-amber-800 dark:text-accent block mb-0.5 select-none">
                        Tóm tắt đại ý:
                      </span>
                      {result.summaryVi}
                    </div>
                  </div>
                </Card>
              </div>

              {/* 2. Tone Analysis */}
              <Card className="border border-border bg-card/40 shadow-none rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold tracking-wider text-foreground/85">
                    <BadgeAlert className="size-4 text-indigo-600 dark:text-indigo-400" />
                    Phân tích tông giọng (Tone & Implied Meaning)
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                    {result.toneAnalysis.toneVi}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  <span className="font-semibold text-foreground/85">
                    Hàm ý/Sắc thái:{' '}
                  </span>
                  {result.toneAnalysis.impliedMeaningVi}
                </p>
              </Card>

              {/* 3. Collapsible Learning Sections */}
              <div className="flex flex-col gap-3.5 border-t border-border/30 pt-5">
                <CollapsibleSection
                  title="Xem giải thích ngữ nghĩa & Góp ý nguồn"
                  defaultOpen={false}
                >
                  <div className="flex flex-col gap-4 mt-4">
                    {/* Reading Memory Candidates */}
                    {result.readingMemoryCandidates &&
                      result.readingMemoryCandidates.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Đề xuất lưu học theo vòng lặp (Không quên lỗi cũ):
                          </h4>
                          <div className="grid grid-cols-1 gap-3.5 mb-2">
                            {result.readingMemoryCandidates.map(
                              (candidate, idx) => (
                                <ReadingCandidateCard
                                  key={idx}
                                  candidate={candidate}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Key Phrases */}
                    {result.keyPhrases && result.keyPhrases.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                          Cụm từ hữu ích cần ghi nhớ:
                        </h4>
                        <ReusablePhraseList
                          phrases={result.keyPhrases.map((kp) => ({
                            phrase: kp.phrase,
                            meaningVi: kp.meaningVi,
                            situationVi: kp.usageVi,
                          }))}
                        />
                      </div>
                    )}

                    {/* Word-by-word traps / Misunderstandings */}
                    {result.misunderstandingsVi &&
                      result.misunderstandingsVi.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Bẫy dịch nghĩa & Hiểu lầm dễ gặp:
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {result.misunderstandingsVi.map((m, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-lg bg-red-500/[0.02] border border-red-500/15 flex flex-col gap-2 text-xs"
                              >
                                <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <AlertTriangle className="size-3.5 shrink-0" />
                                  Dễ nhầm lẫn: &ldquo;{m.trapVi}&rdquo;
                                </span>
                                <p className="leading-relaxed text-foreground/90 font-medium">
                                  {m.explanationVi}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Source Issues */}
                    {result.sourceIssues && result.sourceIssues.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                          Góp ý chi tiết về câu nguồn (Source Issues):
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {result.sourceIssues.map((s, idx) => {
                            let catColor = '';
                            let catLabel = '';
                            if (s.category === 'typo') {
                              catColor =
                                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                              catLabel = 'Chính tả';
                            } else if (s.category === 'grammar') {
                              catColor =
                                'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
                              catLabel = 'Ngữ pháp';
                            } else if (s.category === 'awkward_wording') {
                              catColor =
                                'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
                              catLabel = 'Dựng câu vụng';
                            } else {
                              catColor =
                                'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                              catLabel = 'Mơ hồ';
                            }

                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-lg bg-card border border-border flex flex-col gap-2.5 text-xs shadow-2xs"
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className="font-mono font-bold text-foreground/90 line-through decoration-rose-500/60 select-all">
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
                                  <span className="text-foreground/75 font-normal">
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
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
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
                          className="glass-card hover:border-primary/45 hover:shadow-md transition-all duration-300 rounded-xl p-4.5 flex flex-col gap-3 interactive-hover"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-foreground/80 font-medium flex items-center gap-1 leading-relaxed">
                              💡{' '}
                              <span className="font-semibold text-foreground/90">
                                Trường hợp dùng:
                              </span>{' '}
                              {reply.contextVi}
                            </span>
                            <div className="flex items-center gap-1">
                              <TTSButton text={reply.text} size="icon-sm" />
                              <CopyButton text={reply.text} size="icon-sm" />
                            </div>
                          </div>
                          <div className="text-xs font-sans font-semibold p-3 bg-muted/60 dark:bg-black/30 border border-border select-all rounded-lg leading-relaxed text-foreground">
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

function ReadingCandidateCard({
  candidate,
}: {
  candidate: NonNullable<ReadingCoachResult['readingMemoryCandidates']>[number];
}) {
  const [isIgnored, setIsIgnored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (isIgnored) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveReadingCandidateAction(candidate);
      setIsSaved(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi lưu Sổ tay.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 py-0 rounded-xl interactive-hover">
      {/* Header Banner */}
      <div className="py-2 px-3.5 border-b flex flex-row items-center justify-between gap-3 text-[10px] bg-muted/15 border-border">
        <div className="flex items-center gap-1.5">
          <span className="font-bold bg-primary/10 dark:bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20 text-[9px] tracking-wide">
            {candidate.patternNameVi}
          </span>
          <span
            className={cn(
              'text-[9px] font-bold px-1.5 rounded uppercase border',
              candidate.memoryType === 'reading_trap'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            )}
          >
            {candidate.memoryType === 'reading_trap'
              ? 'Bẫy đọc hiểu'
              : 'Cụm từ hay'}
          </span>
        </div>
      </div>

      <CardContent className="p-3.5 flex flex-col gap-2.5 text-xs">
        {candidate.memoryType === 'reading_trap' ? (
          <div className="flex flex-col gap-2">
            <div className="font-mono text-rose-600 dark:text-rose-400 font-bold select-all leading-relaxed break-all">
              Bẫy dịch: &ldquo;{candidate.trapText}&rdquo;
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
              <div className="p-2 bg-red-500/[0.03] border border-red-500/10 rounded flex flex-col gap-0.5">
                <span className="text-[9px] text-red-700 dark:text-red-400 block font-bold uppercase select-none">
                  Dễ hiểu lầm là:
                </span>
                <span className="text-red-700 dark:text-red-300 font-semibold select-text">
                  {candidate.wrongInterpretationVi}
                </span>
              </div>
              <div className="p-2 bg-emerald-500/[0.03] border border-emerald-500/10 rounded flex flex-col gap-0.5">
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block font-bold uppercase select-none">
                  Hiểu đúng ngữ cảnh:
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold select-text">
                  {candidate.correctInterpretationVi}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold select-all leading-relaxed break-all">
              Cụm từ: &ldquo;{candidate.phrase}&rdquo;
            </div>
            {candidate.situationVi && (
              <div className="text-[11px] text-foreground/80 leading-relaxed p-2 bg-muted/30 border border-border/40 rounded">
                <span className="font-bold text-foreground/90">
                  Tình huống:
                </span>{' '}
                {candidate.situationVi}
              </div>
            )}
          </div>
        )}

        <div className="text-foreground/90 font-medium text-[11.5px] leading-relaxed border-t border-border/20 pt-2 flex items-start gap-1">
          <span className="select-none">💡</span>
          <span className="select-text">{candidate.explanationVi}</span>
        </div>

        {candidate.culturalContextVi && (
          <div className="text-indigo-700 dark:text-indigo-300 text-[11px] leading-relaxed bg-indigo-500/[0.03] dark:bg-indigo-950/20 border border-indigo-500/15 p-2.5 rounded flex items-start gap-1.5 font-medium">
            <span className="select-none">🌍</span>
            <span className="select-text">
              <strong>Văn hóa/Ngữ cảnh:</strong> {candidate.culturalContextVi}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 border-t border-border/10 pt-2 mt-0.5 select-none">
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              size="xs"
              onClick={() => setIsIgnored(true)}
              disabled={isSaving}
              className="text-[10px] h-7 px-2.5 font-semibold text-muted-foreground border-border hover:bg-muted"
            >
              Bỏ qua
            </Button>
            {isSaved ? (
              <span className="text-[10px] h-7 px-2.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/5 rounded">
                Đã lưu Sổ tay
                <Check className="size-3" />
              </span>
            ) : (
              <Button
                type="button"
                size="xs"
                onClick={handleSave}
                disabled={isSaving}
                className="text-[10px] h-7 px-3.5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1 cursor-pointer"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu vào Sổ tay'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
