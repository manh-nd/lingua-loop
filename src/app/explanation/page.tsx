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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitExplanationCoach } from './actions';
import { ExplanationCoachResult } from '@/core/explanation/explanation.schema';
import { HighlightedText } from '@/components/coach/HighlightedText';
import {
  Sparkle,
  FileText,
  ArrowRight,
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
import { CoachShell } from '@/components/coach/CoachShell';
import { LoadingPanel } from '@/components/coach/LoadingPanel';
import { MessageSample, ExplanationSample, ReadingSample } from '@/lib/samples';
import { cn } from '@/lib/utils';

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
  const handleSelectSample = (
    sample: MessageSample | ExplanationSample | ReadingSample
  ) => {
    setResult(null);
    setError(null);
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
    <CoachShell
      headerTitle="DOCUMENT COACH"
      headerIcon={<FileText className="size-4 text-primary" />}
      sidebarTitle="Tinh chỉnh tài liệu & Giải thích"
      sidebarDescription="Tối ưu hóa các văn bản dài (PR descriptions, technical specifications, Jira issues) để đạt tính rõ ràng và chuyên nghiệp tối đa."
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
                  Viết từ ý định
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="improve_english_draft"
                  className="text-xs"
                >
                  Sửa bản nháp tiếng Anh
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
                {mode === 'write_from_vietnamese'
                  ? 'Ý định tiếng Việt'
                  : 'Bản nháp tiếng Anh'}
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
                Viết lại & học từ lỗi
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
                        defaultOpen={true}
                      >
                        <ReusablePhraseList
                          phrases={result.reusablePhrases}
                          sourceWorkflow="explanation"
                        />
                      </CollapsibleSection>
                    )}

                  {/* Mistake Candidates */}
                  {result.mistakeCandidates &&
                    result.mistakeCandidates.length > 0 && (
                      <CollapsibleSection
                        title={`Đề xuất học theo vòng lặp (Không quên lỗi cũ) (${result.mistakeCandidates.length})`}
                        defaultOpen={true}
                      >
                        <MistakeCandidateList
                          candidates={result.mistakeCandidates}
                          sourceWorkflow="explanation"
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
