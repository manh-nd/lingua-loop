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
import { submitMessageCoach, submitFollowUpQuestion } from './actions';
import { MessageCoachResult } from '@/core/message/message.schema';
import { FollowUpChatMessage } from '@/core/message/follow-up.schema';
import { HighlightedText } from '@/components/coach/HighlightedText';
import {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '@/components/ui/message';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import {
  Sparkle,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileCheck,
  Loader2,
  Send,
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

type MessageMode = 'write_from_vietnamese' | 'improve_english_draft';
type MessageTone = 'friendly' | 'polite' | 'direct' | 'professional' | 'casual';

export default function MessagePage() {
  const [mode, setMode] = useState<MessageMode>('write_from_vietnamese');
  const [tone, setTone] = useState<MessageTone>('professional');
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<MessageCoachResult | null>(null);

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
    setThread([]);
    setFollowUpQuestion('');
    setFollowUpError(null);

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
        recommendedDraft: result.recommendedMessage,
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
      headerTitle="EMAIL & MESSAGE COACH"
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
                spacing={0}
                className="w-full bg-muted/60 dark:bg-black/30 p-1 rounded-xl border border-border/80"
              >
                <ToggleGroupItem
                  value="write_from_vietnamese"
                  className="text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 flex-1 justify-center data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                >
                  Viết từ ý định
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="improve_english_draft"
                  className="text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 flex-1 justify-center data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                >
                  Sửa bản nháp tiếng Anh
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            {/* Advanced Options (Tone & Context collapsed) */}
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
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Thân thiện
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="polite"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Lịch sự
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="direct"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Trực tiếp
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="professional"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
                        Trang trọng
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="casual"
                        className="text-[10px] font-semibold py-1.5 flex-1 justify-center rounded-lg transition-all duration-200 data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-xs text-muted-foreground hover:bg-muted/30"
                      >
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
              'bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20',
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
            <LoadingPanel layoutType="message" />
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary animate-pulse" />
                  <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phản hồi từ Coach
                  </h2>
                </div>
              </div>

              {/* 1. Recommended Message Chat Preview */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 px-1 select-none">
                  <FileCheck className="size-3.5 text-primary" />
                  {mode === 'write_from_vietnamese'
                    ? 'Bản xem trước tin nhắn gửi đi (Chat Preview):'
                    : 'Bản sửa đổi đề xuất:'}
                </span>

                <Card className="glass-card rounded-2xl p-5 flex flex-col gap-4.5 shadow-md relative overflow-hidden">
                  {/* Mock Chat Window Header Bar */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3 -mt-1 select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors" />
                        <div className="size-2.5 rounded-full bg-amber-400/80 hover:bg-amber-400 transition-colors" />
                        <div className="size-2.5 rounded-full bg-emerald-400/80 hover:bg-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10.5px] font-semibold text-muted-foreground/80 font-mono ml-2">
                        Slack #communication
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TTSButton
                        text={result.recommendedMessage}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-xs interactive-hover"
                      />
                      <CopyButton
                        text={result.recommendedMessage}
                        size="icon-sm"
                        className="bg-background hover:bg-muted border border-border h-7 w-7 shadow-xs interactive-hover"
                      />
                    </div>
                  </div>

                  {/* Message Bubble Block */}
                  <Message align="start">
                    {/* Bot Avatar */}
                    <MessageAvatar className="relative shrink-0 overflow-visible self-start bg-transparent">
                      <div className="size-8.5 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-white font-black text-xs flex items-center justify-center select-none shadow-sm">
                        LC
                      </div>
                      {/* Active Status Indicator dot */}
                      <span className="absolute bottom-0 right-0 block size-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-zinc-900" />
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader className="flex items-baseline gap-2 select-none px-0">
                        <span className="text-xs font-bold text-foreground hover:underline cursor-pointer">
                          Lingua Coach
                        </span>
                        <span className="text-[9.5px] text-muted-foreground/70">
                          {new Date().toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[8px] bg-primary/10 text-primary border border-primary/15 font-bold uppercase rounded px-1 scale-90 origin-left">
                          Trợ lý
                        </span>
                      </MessageHeader>

                      {/* Chat Bubble Body */}
                      <Bubble variant="outline">
                        <BubbleContent className="bg-card border border-border/80 p-4 rounded-2xl rounded-tl-none shadow-xs text-xs font-medium leading-relaxed text-foreground select-all relative group transition-all duration-300 hover:border-primary/20">
                          <HighlightedText
                            text={result.recommendedMessage}
                            corrections={result.corrections}
                          />
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>

                  {/* Coach Advice section inside bubble */}
                  <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3.5 flex gap-2.5 items-start text-[11px] text-muted-foreground/95 select-text mt-1">
                    <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5 select-none">
                        Mẹo của Coach:
                      </span>
                      {result.explanationVi}
                    </div>
                  </div>
                </Card>
              </div>

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
                        className="border border-border bg-card/20 hover:border-primary/35 hover:bg-card/45 hover:shadow-xs transition-all duration-300 shadow-none rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] uppercase tracking-wider px-2 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 h-5 inline-flex items-center justify-center">
                            {alt.label.replace('more_', 'Tông giọng ')}
                          </span>
                          <div className="flex items-center gap-1">
                            <TTSButton text={alt.text} size="icon-xs" />
                            <CopyButton text={alt.text} size="icon-xs" />
                          </div>
                        </div>
                        <div className="text-xs font-sans font-semibold p-3 bg-muted/40 dark:bg-black/30 border border-border/80 select-all rounded-lg shadow-xs leading-relaxed">
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

              {/* 3. Follow-up Chat Thread Panel */}
              <div className="flex flex-col gap-4.5 border-t border-border/30 pt-5">
                {(thread.length > 0 || isFollowUpPending || followUpError) && (
                  <div className="flex flex-col gap-3.5 bg-muted/30 border border-border/60 rounded-2xl p-4.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none">
                      <MessageSquare className="size-3.5 text-primary animate-pulse" />
                      Trò chuyện cùng Coach về tin nhắn này:
                    </div>

                    <MessageScrollerProvider>
                      <MessageScroller className="max-h-[24rem]">
                        <MessageScrollerViewport className="pr-1">
                          <MessageScrollerContent className="gap-3">
                            {thread.map((msg, idx) => (
                              <MessageScrollerItem
                                key={idx}
                                scrollAnchor={msg.role === 'user'}
                              >
                                <Message
                                  align={msg.role === 'user' ? 'end' : 'start'}
                                >
                                  {msg.role === 'assistant' ? (
                                    <MessageAvatar className="size-7.5 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5 bg-transparent overflow-visible">
                                      LC
                                    </MessageAvatar>
                                  ) : (
                                    <MessageAvatar className="size-7.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5 bg-transparent overflow-visible">
                                      U
                                    </MessageAvatar>
                                  )}
                                  <MessageContent>
                                    <Bubble
                                      variant={
                                        msg.role === 'user'
                                          ? 'default'
                                          : 'outline'
                                      }
                                    >
                                      <BubbleContent
                                        className={cn(
                                          'p-3 rounded-2xl text-xs leading-relaxed font-sans font-medium select-text',
                                          msg.role === 'user'
                                            ? 'rounded-tr-none'
                                            : 'bg-card border border-border/60 text-foreground rounded-tl-none shadow-3xs'
                                        )}
                                      >
                                        {msg.text}
                                      </BubbleContent>
                                    </Bubble>
                                  </MessageContent>
                                </Message>
                              </MessageScrollerItem>
                            ))}

                            {isFollowUpPending && (
                              <MessageScrollerItem scrollAnchor={false}>
                                <Message align="start">
                                  <MessageAvatar className="size-7.5 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center select-none shadow-xs shrink-0 mt-0.5 bg-transparent overflow-visible">
                                    LC
                                  </MessageAvatar>
                                  <MessageContent>
                                    <Bubble variant="outline">
                                      <BubbleContent className="bg-card border border-border/60 p-3 rounded-2xl rounded-tl-none text-xs font-sans font-medium flex items-center gap-2 select-none shadow-3xs">
                                        <Loader2 className="size-3.5 animate-spin text-primary" />
                                        <span>Đang trả lời...</span>
                                      </BubbleContent>
                                    </Bubble>
                                  </MessageContent>
                                </Message>
                              </MessageScrollerItem>
                            )}

                            {followUpError && (
                              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[11px] font-sans">
                                ⚠️ Lỗi: {followUpError}
                              </div>
                            )}
                          </MessageScrollerContent>
                        </MessageScrollerViewport>
                        <MessageScrollerButton />
                      </MessageScroller>
                    </MessageScrollerProvider>
                  </div>
                )}

                {/* Follow-up Question Input & Preset Chips */}
                <div className="flex flex-col gap-3 bg-muted/40 border border-border/75 rounded-2xl p-4.5">
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
                          'Câu này gửi cho sếp nước ngoài có ổn không?'
                        )
                      }
                      className="text-[10px] font-semibold border-border/80 text-muted-foreground hover:text-foreground bg-background hover:bg-muted cursor-pointer"
                    >
                      👔 Gửi cho sếp có ổn không?
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
                      placeholder="Hỏi trợ lý thêm về câu này (ví dụ: giải thích từ vựng, sắc thái)..."
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
                    {/* Detailed Explanation */}
                    <div className="p-4 bg-muted/20 rounded-xl border border-border/80 flex gap-2.5 items-start">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="leading-relaxed text-xs text-foreground/90 font-medium">
                        <span className="font-bold text-foreground block mb-0.5">
                          Tại sao cách diễn đạt này tốt hơn?
                        </span>
                        {result.explanationVi}
                      </div>
                    </div>

                    {/* Corrections */}
                    {mode === 'improve_english_draft' &&
                      result.corrections &&
                      result.corrections.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Lỗi sai & Cải thiện chi tiết:
                          </h4>
                          <CorrectionList corrections={result.corrections} />
                        </div>
                      )}

                    {/* Reusable Phrases */}
                    {result.reusablePhrases &&
                      result.reusablePhrases.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            Mẫu cấu trúc câu khuyên dùng:
                          </h4>
                          <ReusablePhraseList
                            phrases={result.reusablePhrases}
                            sourceWorkflow="message"
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
                            sourceWorkflow="message"
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
