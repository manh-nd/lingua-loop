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
import { submitFollowUpQuestion } from '../message/actions';
import { ExplanationCoachResult } from '@/core/explanation/explanation.schema';
import { FollowUpChatMessage } from '@/core/message/follow-up.schema';
import { HighlightedText } from '@/components/coach/HighlightedText';
import {
  Sparkle,
  FileText,
  ArrowRight,
  BookOpen,
  FileCheck,
  LayoutGrid,
  Loader2,
  Send,
  MessageSquare,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { CopyButton } from '@/components/coach/CopyButton';
import { TTSButton } from '@/components/coach/TTSButton';
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

  // Follow-up chat thread states
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [thread, setThread] = useState<FollowUpChatMessage[]>([]);
  const [isFollowUpPending, setIsFollowUpPending] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

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
    setThread([]);
    setFollowUpQuestion('');
    setFollowUpError(null);

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
    setThread([]);
    setFollowUpQuestion('');
    setFollowUpError(null);

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
    setThread([]);
    setFollowUpQuestion('');
    setFollowUpError(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFollowUpSubmit = async (
    e?: React.FormEvent,
    presetQuestion?: string
  ) => {
    if (e) e.preventDefault();
    const question = (presetQuestion || followUpQuestion).trim();
    if (!question || isFollowUpPending || !result) return;

    setFollowUpError(null);
    setIsFollowUpPending(true);

    const newUserMessage: FollowUpChatMessage = {
      role: 'user',
      text: question,
    };
    const updatedThread = [...thread, newUserMessage];
    setThread(updatedThread);
    setFollowUpQuestion('');

    try {
      const res = await submitFollowUpQuestion({
        originalInput: text,
        recommendedDraft: result.improvedText,
        userQuestion: question,
        history: thread,
      });

      setThread([...updatedThread, { role: 'assistant', text: res.answerVi }]);
    } catch (err) {
      console.error(err);
      setFollowUpError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi trao đổi với AI.'
      );
      // Rollback user question on failure
      setThread(thread);
    } finally {
      setIsFollowUpPending(false);
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
                spacing={0}
                className="w-full bg-muted/60 dark:bg-black/30 p-1 rounded-xl border border-border/80"
              >
                <ToggleGroupItem
                  value="write_from_vietnamese"
                  className="text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 flex-1 justify-center data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                >
                  Viết từ ý định
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="improve_english_draft"
                  className="text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 flex-1 justify-center data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
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

            {/* Advanced Options (Tone, Length, Context collapsed) */}
            <div className="pt-1 pb-1.5 border-t border-border/35">
              <CollapsibleSection title="Tùy chọn nâng cao" defaultOpen={false}>
                <div className="flex flex-col gap-4.5 mt-3.5 pb-1">
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
                      spacing={0}
                      className="w-full bg-muted/60 dark:bg-black/30 p-1 rounded-xl border border-border/80"
                    >
                      <ToggleGroupItem
                        value="friendly"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Thân thiện
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="polite"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Lịch sự
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="direct"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Trực tiếp
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="professional"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Trang trọng
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="casual"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
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
                      spacing={0}
                      className="w-full bg-muted/60 dark:bg-black/30 p-1 rounded-xl border border-border/80"
                    >
                      <ToggleGroupItem
                        value="short"
                        className="text-xs font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Ngắn
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="medium"
                        className="text-xs font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Vừa
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="detailed"
                        className="text-xs font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-white dark:data-[pressed]:bg-zinc-800 data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
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
                </div>
              </CollapsibleSection>
            </div>

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

              {/* 1. Recommended Explanation Slate */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 px-1 select-none">
                  <FileCheck className="size-3.5 text-primary" />
                  {mode === 'write_from_vietnamese'
                    ? 'Bản xem trước văn bản đề xuất (Editor Slate):'
                    : 'Bản tinh chỉnh đề xuất:'}
                </span>

                <Card className="border border-border bg-slate-50/50 dark:bg-black/20 rounded-2xl p-5 flex flex-col gap-4 shadow-xs relative overflow-hidden">
                  {/* Mock Editor Window Header Bar */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3 -mt-1 select-none">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-red-400" />
                      <div className="size-2.5 rounded-full bg-amber-400" />
                      <div className="size-2.5 rounded-full bg-emerald-400" />
                      <span className="text-[10.5px] font-semibold text-muted-foreground/80 font-mono ml-2">
                        GitHub / Jira Description Editor
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TTSButton
                        text={result.improvedText}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-2xs"
                      />
                      <CopyButton
                        text={result.improvedText}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Document Slate Body */}
                  <div className="bg-white dark:bg-zinc-900 border border-border/80 p-5 rounded-xl shadow-2xs text-xs leading-relaxed text-foreground select-all min-h-48 max-h-[28rem] overflow-y-auto font-sans font-medium whitespace-pre-wrap">
                    <HighlightedText
                      text={result.improvedText}
                      corrections={result.corrections}
                    />
                  </div>
                </Card>
              </div>

              {/* 2. Alternative Versions (Short / Detailed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Short Version */}
                <Card className="border border-border bg-white/20 dark:bg-black/10 hover:border-primary/35 hover:bg-white/40 dark:hover:bg-black/20 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider px-2 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 h-5 inline-flex items-center justify-center">
                      Bản rút gọn (Short version)
                    </span>
                    <div className="flex items-center gap-1">
                      <TTSButton text={result.shortVersion} size="icon-xs" />
                      <CopyButton text={result.shortVersion} size="icon-xs" />
                    </div>
                  </div>
                  <div className="text-xs font-sans font-semibold whitespace-pre-wrap p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg leading-relaxed max-h-40 overflow-y-auto shadow-xs">
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
                      <div className="flex items-center gap-1">
                        <TTSButton
                          text={result.detailedVersion}
                          size="icon-xs"
                        />
                        <CopyButton
                          text={result.detailedVersion}
                          size="icon-xs"
                        />
                      </div>
                    </div>
                    <div className="text-xs font-sans font-semibold whitespace-pre-wrap p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg leading-relaxed max-h-40 overflow-y-auto shadow-xs">
                      {result.detailedVersion}
                    </div>
                  </Card>
                )}
              </div>

              {/* 3. Follow-up Chat Thread Panel */}
              <div className="flex flex-col gap-4.5 border-t border-border/30 pt-5">
                {(thread.length > 0 || isFollowUpPending || followUpError) && (
                  <div className="flex flex-col gap-3.5 bg-slate-50/30 dark:bg-black/10 border border-border/60 rounded-2xl p-4.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none">
                      <MessageSquare className="size-3.5 text-primary animate-pulse" />
                      Trò chuyện cùng Coach về bản nháp này:
                    </div>

                    <div className="flex flex-col gap-3 max-h-[24rem] overflow-y-auto pr-1">
                      {thread.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex gap-2.5 items-start max-w-[85%]',
                            msg.role === 'user'
                              ? 'self-end flex-row-reverse'
                              : 'self-start'
                          )}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="size-7.5 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5">
                              LC
                            </div>
                          ) : (
                            <div className="size-7.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5">
                              U
                            </div>
                          )}
                          <div
                            className={cn(
                              'p-3 rounded-2xl text-xs leading-relaxed font-sans font-medium select-text',
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-xs'
                                : 'bg-white dark:bg-zinc-900 border border-border/60 text-foreground rounded-tl-xs shadow-3xs'
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {isFollowUpPending && (
                        <div className="flex gap-2.5 items-start max-w-[85%] self-start animate-pulse">
                          <div className="size-7.5 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5">
                            LC
                          </div>
                          <div className="bg-white dark:bg-zinc-900 border border-border/60 p-3 rounded-2xl rounded-tl-xs text-xs font-sans font-medium flex items-center gap-2 select-none shadow-3xs">
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                            <span>Đang trả lời...</span>
                          </div>
                        </div>
                      )}

                      {followUpError && (
                        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[11px] font-sans">
                          ⚠️ Lỗi: {followUpError}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Follow-up Question Input & Preset Chips */}
                <div className="flex flex-col gap-3 bg-slate-50/50 dark:bg-black/20 border border-border/75 rounded-2xl p-4.5">
                  <div className="flex flex-wrap gap-1.5 select-none">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isFollowUpPending}
                      onClick={() =>
                        handleFollowUpSubmit(
                          undefined,
                          'Tại sao lại sửa như vậy?'
                        )
                      }
                      className="text-[10px] font-semibold border-border/80 text-muted-foreground hover:text-foreground bg-background hover:bg-muted cursor-pointer"
                    >
                      💡 Tại sao lại sửa như vậy?
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isFollowUpPending}
                      onClick={() =>
                        handleFollowUpSubmit(
                          undefined,
                          'Bản dịch này phù hợp ngữ cảnh công sở chưa?'
                        )
                      }
                      className="text-[10px] font-semibold border-border/80 text-muted-foreground hover:text-foreground bg-background hover:bg-muted cursor-pointer"
                    >
                      👔 Giao tiếp công sở tốt chưa?
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isFollowUpPending}
                      onClick={() =>
                        handleFollowUpSubmit(
                          undefined,
                          'Viết ngắn gọn hơn nữa giúp tôi.'
                        )
                      }
                      className="text-[10px] font-semibold border-border/80 text-muted-foreground hover:text-foreground bg-background hover:bg-muted cursor-pointer"
                    >
                      ⚡ Viết ngắn gọn hơn
                    </Button>
                  </div>

                  <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                    <Input
                      type="text"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      disabled={isFollowUpPending}
                      placeholder="Hỏi trợ lý thêm về bản dịch này (ví dụ: cấu trúc, sắc thái kỹ thuật)..."
                      className="text-xs focus-visible:ring-primary/40 h-8.5 bg-background font-sans font-medium"
                      required
                    />
                    <Button
                      type="submit"
                      size="icon-xs"
                      disabled={isFollowUpPending}
                      className="h-8.5 w-8.5 cursor-pointer shrink-0"
                      title="Gửi câu hỏi"
                    >
                      {isFollowUpPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* 4. Learning Notes (Collapsible accordions grouped) */}
              <div className="flex flex-col gap-3.5 border-t border-border/30 pt-5">
                <CollapsibleSection
                  title="Xem giải thích & Tích lũy sổ tay"
                  defaultOpen={false}
                >
                  <div className="flex flex-col gap-4 mt-4">
                    {/* Structure Feedback */}
                    {result.structureFeedback &&
                      result.structureFeedback.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Góp ý cấu trúc tài liệu:
                          </h4>
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
                        </div>
                      )}

                    {/* Corrections */}
                    {mode === 'improve_english_draft' &&
                      result.corrections &&
                      result.corrections.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Lỗi sai & Cách diễn đạt tốt hơn:
                          </h4>
                          <CorrectionList corrections={result.corrections} />
                        </div>
                      )}

                    {/* Reusable Phrases */}
                    {result.reusablePhrases &&
                      result.reusablePhrases.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Cấu trúc hữu ích khuyên dùng:
                          </h4>
                          <ReusablePhraseList
                            phrases={result.reusablePhrases}
                            sourceWorkflow="explanation"
                          />
                        </div>
                      )}

                    {/* Mistake Candidates */}
                    {result.mistakeCandidates &&
                      result.mistakeCandidates.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Đề xuất lưu học theo vòng lặp (Không quên lỗi cũ):
                          </h4>
                          <MistakeCandidateList
                            candidates={result.mistakeCandidates}
                            sourceWorkflow="explanation"
                            mode={mode}
                          />
                        </div>
                      )}
                  </div>
                </CollapsibleSection>
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
