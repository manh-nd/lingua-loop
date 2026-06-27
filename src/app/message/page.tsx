'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { submitMessageCoach } from './actions';
import { MessageCoachResult } from '@/core/message/message.schema';
import { HighlightedText } from '@/components/coach/HighlightedText';
import {
  Sparkle,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { CopyButton } from '@/components/coach/CopyButton';
import { ErrorPanel } from '@/components/coach/ErrorPanel';
import { StarterScreen } from '@/components/coach/StarterScreen';
import { SampleChips } from '@/components/coach/SampleChips';
import { CollapsibleSection } from '@/components/coach/CollapsibleSection';
import { CorrectionList } from '@/components/coach/CorrectionList';
import { MistakeCandidateList } from '@/components/coach/MistakeCandidateList';
import { CoachShell } from '@/components/coach/CoachShell';
import { LoadingPanel } from '@/components/coach/LoadingPanel';
import { MessageSample, ExplanationSample, ReadingSample } from '@/lib/samples';
import { cn } from '@/lib/utils';

type MessageMode = 'write_from_vietnamese' | 'improve_english_draft';
type MessageTone = 'friendly' | 'polite' | 'direct' | 'professional' | 'casual';

export default function MessagePage() {
  const [mode, setMode] = useState<MessageMode>('write_from_vietnamese');
  const [tone, setTone] = useState<MessageTone>('professional');
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<MessageCoachResult | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // UX Polish additions
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
      if (text.trim() && !isPending) {
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
    if (!text.trim()) return;

    // Clear typing animation if active
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setError(null);
    startTransition(async () => {
      try {
        const data = await submitMessageCoach({
          mode,
          text,
          context: context.trim() || undefined,
          tone,
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

  // Sample prompt selection
  const handleSelectSample = (
    sample: MessageSample | ExplanationSample | ReadingSample
  ) => {
    setResult(null);
    setError(null);
    const msgSample = sample as MessageSample;
    setMode(msgSample.mode);
    setTone(msgSample.tone);

    // Clear existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

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
    }, 12);

    // Pulse submit button
    setPulseSubmit(true);
    setTimeout(() => setPulseSubmit(false), 2000);

    // Focus input
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Reset form (New Draft)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleModeChange = (val: string[]) => {
    if (val && val[0]) {
      setMode(val[0] as MessageMode);
    }
  };

  const handleToneChange = (val: string[]) => {
    if (val && val[0]) {
      setTone(val[0] as MessageTone);
    }
  };

  return (
    <CoachShell
      headerTitle="MESSAGE COACH"
      headerIcon={<MessageSquare className="size-4 text-primary" />}
      sidebarTitle="Viết tin nhắn thông minh"
      sidebarDescription="Nhập ý định tiếng Việt hoặc bản nháp tiếng Anh để nhận đề xuất tự nhiên nhất cho công sở."
      showReset={!!(text || context || result)}
      onReset={handleReset}
      sidebarContent={
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            {/* Mode Toggle */}
            <Field>
              <FieldTitle
                id="mode-label"
                className="font-bold text-xs uppercase tracking-wider"
              >
                Chế độ hoạt động
              </FieldTitle>
              <ToggleGroup
                aria-labelledby="mode-label"
                value={[mode]}
                onValueChange={handleModeChange}
                variant="outline"
                className="w-full justify-start *:flex-1"
              >
                <ToggleGroupItem
                  value="write_from_vietnamese"
                  className="text-xs"
                >
                  Dịch từ tiếng Việt
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="improve_english_draft"
                  className="text-xs"
                >
                  Sửa nháp tiếng Anh
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            {/* Tone Selection */}
            <Field>
              <FieldTitle
                id="tone-label"
                className="font-bold text-xs uppercase tracking-wider"
              >
                Tông giọng (Tone)
              </FieldTitle>
              <ToggleGroup
                aria-labelledby="tone-label"
                value={[tone]}
                onValueChange={handleToneChange}
                variant="outline"
                className="w-full justify-start grid grid-cols-5 gap-1"
              >
                <ToggleGroupItem value="friendly" className="text-[10px] px-1">
                  Thân thiện
                </ToggleGroupItem>
                <ToggleGroupItem value="polite" className="text-[10px] px-1">
                  Lịch sự
                </ToggleGroupItem>
                <ToggleGroupItem value="direct" className="text-[10px] px-1">
                  Trực tiếp
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="professional"
                  className="text-[10px] px-1"
                >
                  Trang trọng
                </ToggleGroupItem>
                <ToggleGroupItem value="casual" className="text-[10px] px-1">
                  Thường ngày
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            {/* Context Input */}
            <Field>
              <FieldLabel
                htmlFor="context-input"
                className="font-bold text-xs uppercase tracking-wider"
              >
                Ngữ cảnh / Mục tiêu (Không bắt buộc)
              </FieldLabel>
              <Input
                id="context-input"
                name="context"
                autoComplete="off"
                placeholder="Ví dụ: gửi cho sếp qua Slack, giải thích việc chậm trễ tiến độ…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={isPending}
                className="h-8.5 text-xs placeholder:text-muted-foreground/60"
              />
            </Field>

            {/* Input Text */}
            <Field>
              <FieldLabel
                htmlFor="text-input"
                className="font-bold text-xs uppercase tracking-wider"
              >
                Nội dung nhập
              </FieldLabel>
              <Textarea
                id="text-input"
                name="text"
                autoComplete="off"
                ref={textareaRef}
                rows={6}
                placeholder={
                  mode === 'write_from_vietnamese'
                    ? 'Chào anh, em gửi báo cáo tiến độ tuần này. Có một số task bị chậm do phát sinh lỗi…'
                    : 'hi team, i send the report. some task is late because bug…'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                required
                autoFocus
                className="text-xs p-3 focus-visible:ring-primary/40 resize-y min-h-24"
              />
              <FieldDescription className="text-[10px]">
                Bấm{' '}
                <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">
                  {osBadge}
                </kbd>{' '}
                để gửi nhanh khi đang gõ.
              </FieldDescription>
            </Field>
          </FieldGroup>

          {/* Quick chips templates */}
          <SampleChips
            type="message"
            onSelectSample={handleSelectSample}
            className="mt-1"
          />

          <Button
            type="submit"
            disabled={isPending || !text.trim()}
            className={cn(
              'w-full h-9 font-bold uppercase tracking-wider text-xs cursor-pointer select-none active:scale-99 transition-all duration-300',
              'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
              pulseSubmit && 'animate-bounce',
              isPending && 'opacity-80 cursor-wait'
            )}
          >
            {isPending ? (
              <>
                <span className="animate-spin mr-2 size-3.5 border-2 border-current border-t-transparent rounded-full" />
                Coach đang phân tích…
              </>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                Gửi Coach
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
            <LoadingPanel layoutType="message" />
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phản hồi từ Coach
                  </h2>
                </div>
              </div>

              {/* 1. Recommended Message */}
              <Card className="border border-primary/35 bg-gradient-to-br from-primary/[0.02] to-indigo-500/[0.01] backdrop-blur-md shadow-sm relative overflow-hidden rounded-xl p-5 flex flex-col gap-4">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-indigo-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5 h-5 inline-flex items-center justify-center">
                    <FileCheck className="size-3.5" />
                    Tin nhắn khuyên dùng (Recommended)
                  </span>
                  <CopyButton
                    text={result.recommendedMessage}
                    size="icon-sm"
                    className="bg-background dark:bg-black/40 border border-border shadow-2xs hover:bg-muted"
                  />
                </div>
                <div className="text-sm font-semibold leading-relaxed text-foreground select-all">
                  <HighlightedText
                    text={result.recommendedMessage}
                    corrections={result.corrections}
                  />
                </div>
                <div className="h-px bg-border/80 w-full" />
                <div className="flex gap-2 items-start text-xs text-muted-foreground">
                  <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed italic">
                    {result.explanationVi}
                  </p>
                </div>
              </Card>

              {/* 2. Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="size-3.5 text-primary" />
                    Các lựa chọn khác (Alternatives)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.alternatives.map((alt, index) => (
                      <Card
                        key={index}
                        className="border border-border bg-white/20 dark:bg-black/10 hover:border-primary/35 hover:bg-white/40 dark:hover:bg-black/20 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] uppercase tracking-wider px-2 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 h-5 inline-flex items-center justify-center">
                            {alt.label.replace('more_', 'Tông giọng ')}
                          </span>
                          <CopyButton text={alt.text} size="icon-xs" />
                        </div>
                        <div className="text-xs font-mono font-medium p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg shadow-xs leading-relaxed">
                          {alt.text}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <span>💡</span>
                          <span>{alt.whenToUseVi}</span>
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Learning Notes (Collapsible accordions) */}
              <div className="flex flex-col gap-3.5 border-t border-border/30 pt-5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Chi tiết học tập (Learning Notes)
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Detailed Explanation */}
                  <CollapsibleSection title="Tại sao cách diễn đạt này tốt hơn?">
                    <div className="flex gap-2.5 items-start">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-foreground/90 font-medium">
                        {result.explanationVi}
                      </p>
                    </div>
                  </CollapsibleSection>

                  {/* Corrections */}
                  {result.corrections && result.corrections.length > 0 && (
                    <CollapsibleSection
                      title={`Lỗi sai & Cải thiện (${result.corrections.length})`}
                    >
                      <CorrectionList corrections={result.corrections} />
                    </CollapsibleSection>
                  )}

                  {/* Mistake Candidates */}
                  {result.mistakeCandidates &&
                    result.mistakeCandidates.length > 0 && (
                      <CollapsibleSection
                        title={`Đề xuất học theo vòng lặp (Không quên lỗi cũ) (${result.mistakeCandidates.length})`}
                      >
                        <MistakeCandidateList
                          candidates={result.mistakeCandidates}
                        />
                      </CollapsibleSection>
                    )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State / Starter Screen */
            <StarterScreen
              type="message"
              mode={mode}
              onSelectSample={handleSelectSample}
              className="py-8"
            />
          )}
        </>
      }
    />
  );
}
