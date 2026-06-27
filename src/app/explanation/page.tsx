'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { submitExplanationCoach } from './actions';
import { ExplanationCoachResult } from '@/core/explanation/explanation.schema';
import { HighlightedText } from '@/components/coach/HighlightedText';
import {
  ArrowLeft,
  Sparkle,
  FileText,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileCheck,
  LayoutGrid,
} from 'lucide-react';
import { CopyButton } from '@/components/coach/CopyButton';
import { ErrorPanel } from '@/components/coach/ErrorPanel';
import { StarterScreen } from '@/components/coach/StarterScreen';
import { SampleChips } from '@/components/coach/SampleChips';
import { CollapsibleSection } from '@/components/coach/CollapsibleSection';
import { CorrectionList } from '@/components/coach/CorrectionList';
import { MistakeCandidateList } from '@/components/coach/MistakeCandidateList';
import { ReusablePhraseList } from '@/components/coach/ReusablePhraseList';
import { MessageSample, ExplanationSample } from '@/lib/samples';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type ExplanationMode = 'write_from_vietnamese' | 'improve_english_draft';
type ExplanationTone =
  | 'friendly'
  | 'polite'
  | 'direct'
  | 'professional'
  | 'casual';
type ExplanationLength = 'short' | 'medium' | 'detailed';
type ExplanationPurpose =
  | 'explain_issue'
  | 'explain_solution'
  | 'pr_description'
  | 'technical_explanation'
  | 'requirement_description'
  | 'decision_explanation'
  | 'general_explanation';

const purposeItems = [
  { label: 'Giải thích chung (General)', value: 'general_explanation' },
  { label: 'Mô tả lỗi / sự cố (Issue)', value: 'explain_issue' },
  { label: 'Giải thích giải pháp (Solution)', value: 'explain_solution' },
  { label: 'Mô tả Pull Request (PR)', value: 'pr_description' },
  { label: 'Giải thích kỹ thuật (Tech spec)', value: 'technical_explanation' },
  { label: 'Mô tả yêu cầu (Requirement)', value: 'requirement_description' },
  { label: 'Giải thích quyết định (Decision)', value: 'decision_explanation' },
];

export default function ExplanationPage() {
  const [mode, setMode] = useState<ExplanationMode>('write_from_vietnamese');
  const [tone, setTone] = useState<ExplanationTone>('professional');
  const [length, setLength] = useState<ExplanationLength>('medium');
  const [purpose, setPurpose] = useState<ExplanationPurpose>(
    'general_explanation'
  );
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<ExplanationCoachResult | null>(null);

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
        const data = await submitExplanationCoach({
          mode,
          text,
          context: context.trim() || undefined,
          purpose,
          tone,
          length,
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
  const handleSelectSample = (sample: MessageSample | ExplanationSample) => {
    const expSample = sample as ExplanationSample;
    setMode(expSample.mode);
    setTone(expSample.tone);
    setPurpose(expSample.purpose);
    if (expSample.length) {
      setLength(expSample.length);
    }

    // Clear existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // Typing effect
    let currentText = '';
    let index = 0;
    setText('');

    typingIntervalRef.current = setInterval(() => {
      if (index < expSample.text.length) {
        currentText += expSample.text[index];
        setText(currentText);
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 10);

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
      setMode(val[0] as ExplanationMode);
    }
  };

  const handleToneChange = (val: string[]) => {
    if (val && val[0]) {
      setTone(val[0] as ExplanationTone);
    }
  };

  const handleLengthChange = (val: string[]) => {
    if (val && val[0]) {
      setLength(val[0] as ExplanationLength);
    }
  };

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
            <div className="p-1 rounded bg-primary/10 border border-primary/20">
              <FileText className="size-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              EXPLANATION COACH
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
                Tinh chỉnh tài liệu & Giải thích
              </h1>
              <p className="text-xs text-muted-foreground">
                Tối ưu hóa các văn bản dài (PR descriptions, technical
                specifications, Jira issues) để đạt tính rõ ràng và chuyên
                nghiệp tối đa.
              </p>
            </div>
            {/* New Draft / Clear button */}
            {(text || context || result) && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleReset}
                className="text-[10px] shrink-0 font-bold border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <RotateCcw className="size-3 mr-1" />
                Làm mới
              </Button>
            )}
          </div>

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

              {/* Purpose Select Dropdown */}
              <Field>
                <FieldTitle
                  id="purpose-label"
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Mục tiêu tài liệu (Purpose)
                </FieldTitle>
                <Select
                  value={purpose}
                  onValueChange={(val) => setPurpose(val as ExplanationPurpose)}
                  items={purposeItems}
                >
                  <SelectTrigger
                    className="w-full h-8 text-xs bg-background dark:bg-input/30 focus-visible:ring-primary/45"
                    aria-labelledby="purpose-label"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {purposeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                  <ToggleGroupItem
                    value="friendly"
                    className="text-[10px] px-1"
                  >
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

              {/* Length Toggle */}
              <Field>
                <FieldTitle
                  id="length-label"
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Độ dài mong muốn (Length)
                </FieldTitle>
                <ToggleGroup
                  aria-labelledby="length-label"
                  value={[length]}
                  onValueChange={handleLengthChange}
                  variant="outline"
                  className="w-full justify-start *:flex-1"
                >
                  <ToggleGroupItem value="short" className="text-xs">
                    Ngắn
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="text-xs">
                    Vừa
                  </ToggleGroupItem>
                  <ToggleGroupItem value="detailed" className="text-xs">
                    Chi tiết
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>

              {/* Context Input */}
              <Field>
                <FieldLabel
                  htmlFor="context-input"
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Ngữ cảnh / Người đọc (Không bắt buộc)
                </FieldLabel>
                <Input
                  id="context-input"
                  name="context"
                  autoComplete="off"
                  placeholder="Ví dụ: mô tả lỗi hệ thống thanh toán cho các bên thứ ba…"
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
                  Nội dung chi tiết
                </FieldLabel>
                <Textarea
                  id="text-input"
                  name="text"
                  autoComplete="off"
                  ref={textareaRef}
                  rows={8}
                  placeholder={
                    mode === 'write_from_vietnamese'
                      ? 'Mô tả lỗi: Khi user click nút checkout thì loading vô tận. Nguyên nhân do API /checkout phản hồi chậm hơn 10s dẫn đến timeout…'
                      : 'Bug: when checkout click, infinite loading. API /checkout slow response >10s and timeout…'
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                  required
                  autoFocus
                  className="text-xs p-3 focus-visible:ring-primary/40 resize-y min-h-28"
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
              type="explanation"
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
        </section>

        {/* Right Column: Coach Response */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <ErrorPanel error={error} />

          {isPending ? (
            /* Loading State */
            <div className="flex flex-col gap-5 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
                <div className="h-4 bg-muted/60 rounded w-1/4" />
              </div>
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3 border-b border-border/20">
                  <div className="h-4 bg-muted/60 rounded w-1/3 mb-2" />
                  <div className="h-20 bg-muted/30 rounded w-full" />
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-4">
                  <div className="h-3 bg-muted/50 rounded w-1/5" />
                  <div className="h-10 bg-muted/30 rounded w-full" />
                  <div className="h-3 bg-muted/50 rounded w-1/4" />
                  <div className="h-14 bg-muted/30 rounded w-full" />
                </CardContent>
              </Card>
            </div>
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phân tích & Đề xuất cấu trúc
                  </h2>
                </div>
              </div>

              {/* 1. Recommended Message */}
              <Card className="border border-primary/35 bg-gradient-to-br from-primary/[0.02] to-indigo-500/[0.01] backdrop-blur-md shadow-sm relative overflow-hidden rounded-xl p-5 flex flex-col gap-4">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-indigo-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5 h-5 inline-flex items-center justify-center">
                    <FileCheck className="size-3.5" />
                    Văn bản khuyên dùng (Recommended)
                  </span>
                  <CopyButton
                    text={result.improvedText}
                    size="icon-sm"
                    className="bg-background dark:bg-black/40 border border-border shadow-2xs hover:bg-muted"
                  />
                </div>
                <div className="text-xs whitespace-pre-wrap leading-relaxed text-foreground select-all max-h-96 overflow-y-auto">
                  <HighlightedText
                    text={result.improvedText}
                    corrections={result.corrections}
                  />
                </div>
              </Card>

              {/* 2. Alternative Versions (Short / Detailed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Short Version */}
                <Card className="border border-border bg-white/20 dark:bg-black/10 hover:border-primary/35 hover:bg-white/40 dark:hover:bg-black/20 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider px-2 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 h-5 inline-flex items-center justify-center">
                      Bản rút gọn (Short version)
                    </span>
                    <CopyButton text={result.shortVersion} size="icon-xs" />
                  </div>
                  <div className="text-xs font-mono whitespace-pre-wrap p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg leading-relaxed max-h-40 overflow-y-auto shadow-xs">
                    {result.shortVersion}
                  </div>
                </Card>

                {/* Detailed Version */}
                {result.detailedVersion && (
                  <Card className="border border-border bg-white/20 dark:bg-black/10 hover:border-primary/35 hover:bg-white/40 dark:hover:bg-black/20 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-wider px-2 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 h-5 inline-flex items-center justify-center">
                        Bản chi tiết (Detailed version)
                      </span>
                      <CopyButton
                        text={result.detailedVersion}
                        size="icon-xs"
                      />
                    </div>
                    <div className="text-xs font-mono whitespace-pre-wrap p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg leading-relaxed max-h-40 overflow-y-auto shadow-xs">
                      {result.detailedVersion}
                    </div>
                  </Card>
                )}
              </div>

              {/* 3. Learning Notes (Collapsible accordions) */}
              <div className="flex flex-col gap-3.5 border-t border-border/30 pt-5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Chi tiết học tập (Learning Notes)
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Structure Feedback */}
                  {result.structureFeedback &&
                    result.structureFeedback.length > 0 && (
                      <CollapsibleSection
                        title={`Góp ý cấu trúc tài liệu (${result.structureFeedback.length})`}
                        icon={<LayoutGrid className="size-3.5 text-primary" />}
                      >
                        <div className="grid grid-cols-1 gap-3">
                          {result.structureFeedback.map((fb, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-muted/30 border border-border/60 rounded-md flex flex-col gap-2 text-xs"
                            >
                              <div className="flex gap-2 items-start">
                                <span className="text-red-500 font-bold shrink-0 mt-0.5">
                                  ⚠
                                </span>
                                <p className="text-foreground/90 font-medium leading-relaxed">
                                  {fb.issueVi}
                                </p>
                              </div>
                              <div className="flex gap-2 items-start pl-4 border-l-2 border-border/80">
                                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">
                                  💡
                                </span>
                                <p className="text-muted-foreground leading-relaxed">
                                  {fb.suggestionVi}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                  {/* Corrections */}
                  {result.corrections && result.corrections.length > 0 && (
                    <CollapsibleSection
                      title={`Lỗi sai & Cách diễn đạt tốt hơn (${result.corrections.length})`}
                    >
                      <CorrectionList corrections={result.corrections} />
                    </CollapsibleSection>
                  )}

                  {/* Reusable Phrases */}
                  {result.reusablePhrases &&
                    result.reusablePhrases.length > 0 && (
                      <CollapsibleSection
                        title={`Cấu trúc hữu ích khuyên dùng (${result.reusablePhrases.length})`}
                      >
                        <ReusablePhraseList phrases={result.reusablePhrases} />
                      </CollapsibleSection>
                    )}

                  {/* Mistake Candidates */}
                  {result.mistakeCandidates &&
                    result.mistakeCandidates.length > 0 && (
                      <CollapsibleSection
                        title={`Đề xuất lưu học tập (${result.mistakeCandidates.length})`}
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
              type="explanation"
              onSelectSample={handleSelectSample}
              className="py-8"
            />
          )}
        </section>
      </main>
    </div>
  );
}
