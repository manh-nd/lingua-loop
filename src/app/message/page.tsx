'use client';

import { useState, useTransition } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { submitMessageCoach } from './actions';
import { MessageCoachResult } from '@/core/message/message.schema';
import {
  ArrowLeft,
  Sparkle,
  MessageSquare,
  Copy,
  Check,
  TriangleAlert,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

type MessageMode = 'write_from_vietnamese' | 'improve_english_draft';
type MessageTone = 'friendly' | 'polite' | 'direct' | 'professional' | 'casual';

export default function MessagePage() {
  const [mode, setMode] = useState<MessageMode>('write_from_vietnamese');
  const [tone, setTone] = useState<MessageTone>('professional');
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<MessageCoachResult | null>(null);
  const [copiedRecommended, setCopiedRecommended] = useState(false);
  const [copiedAltIndex, setCopiedAltIndex] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

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

  const copyToClipboard = async (
    content: string,
    type: 'recommended' | number
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      if (type === 'recommended') {
        setCopiedRecommended(true);
        setTimeout(() => setCopiedRecommended(false), 2000);
      } else {
        setCopiedAltIndex(type);
        setTimeout(() => setCopiedAltIndex(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] size-125 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] size-125 bg-primary/5 rounded-full blur-3xl -z-10" />

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
              <MessageSquare className="size-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight">
              MESSAGE COACH
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border text-[10px] font-medium">
          MVP v0
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:grid md:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <section className="md:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-tight">
              Viết tin nhắn thông minh
            </h1>
            <p className="text-xs text-muted-foreground">
              Nhập ý định tiếng Việt hoặc bản nháp tiếng Anh để nhận đề xuất tự
              nhiên nhất cho công sở.
            </p>
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
                  <ToggleGroupItem value="write_from_vietnamese">
                    Dịch từ tiếng Việt
                  </ToggleGroupItem>
                  <ToggleGroupItem value="improve_english_draft">
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
                  <ToggleGroupItem value="friendly" className="text-[10px]">
                    Thân thiện
                  </ToggleGroupItem>
                  <ToggleGroupItem value="polite" className="text-[10px]">
                    Lịch sự
                  </ToggleGroupItem>
                  <ToggleGroupItem value="direct" className="text-[10px]">
                    Trực tiếp
                  </ToggleGroupItem>
                  <ToggleGroupItem value="professional" className="text-[10px]">
                    Trang trọng
                  </ToggleGroupItem>
                  <ToggleGroupItem value="casual" className="text-[10px]">
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
                  placeholder="Ví dụ: gửi cho sếp qua Slack, giải thích việc chậm trễ tiến độ..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Thông tin bối cảnh giúp trợ lý tối ưu hóa cách biểu đạt phù
                  hợp nhất.
                </FieldDescription>
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
                  rows={6}
                  placeholder={
                    mode === 'write_from_vietnamese'
                      ? 'Chào anh, em gửi báo cáo tiến độ tuần này. Có một số task bị chậm do phát sinh lỗi...'
                      : 'hi team, i send the report. some task is late because bug...'
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isPending}
                  required
                />
                <FieldDescription>
                  Hãy nhập ý định của bạn bằng tiếng Việt hoặc bản dịch tiếng
                  Anh thô cần chỉnh sửa.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={isPending || !text.trim()}
              className="w-full h-10 font-bold uppercase tracking-wider text-xs"
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2 size-3.5 border-2 border-current border-t-transparent rounded-full" />
                  Coach đang phân tích...
                </>
              ) : (
                <>
                  Gửi Coach
                  <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </form>
        </section>

        {/* Right Column: Coach Response */}
        <section className="md:col-span-7 flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded flex gap-2 items-center">
              <TriangleAlert className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isPending ? (
            /* Loading State */
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-8 bg-muted/60 rounded w-1/3" />
              <Card className="border border-border bg-card">
                <CardHeader>
                  <div className="h-4 bg-muted/60 rounded w-1/4 mb-2" />
                  <div className="h-12 bg-muted/40 rounded w-full" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="h-4 bg-muted/60 rounded w-1/3" />
                  <div className="h-8 bg-muted/40 rounded w-full" />
                  <div className="h-4 bg-muted/60 rounded w-1/3" />
                  <div className="h-16 bg-muted/40 rounded w-full" />
                </CardContent>
              </Card>
            </div>
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Sparkle className="size-4 text-primary animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Phản hồi từ Coach
                </h2>
              </div>

              {/* 1. Recommended Message */}
              <Card className="border border-primary/20 bg-primary/2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      Tin nhắn khuyên dùng (Recommended)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        copyToClipboard(
                          result.recommendedMessage,
                          'recommended'
                        )
                      }
                      title="Sao chép tin nhắn"
                    >
                      {copiedRecommended ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm font-semibold select-all font-mono leading-relaxed mt-2 text-foreground p-3 bg-background border border-border/60">
                    {result.recommendedMessage}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex gap-2 items-start mt-2">
                    <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {result.explanationVi}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Các lựa chọn khác (Alternatives)
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {result.alternatives.map((alt, index) => (
                      <Card
                        key={index}
                        className="border border-border/80 bg-card"
                      >
                        <CardHeader className="py-2.5 px-3 flex flex-row items-center justify-between gap-2">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                            {alt.label.replace('more_', 'Tông giọng ')}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => copyToClipboard(alt.text, index)}
                          >
                            {copiedAltIndex === index ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent className="py-2 px-3 flex flex-col gap-2">
                          <div className="text-xs font-mono font-medium p-2 bg-muted/40 border border-border/40 select-all">
                            {alt.text}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            💡 {alt.whenToUseVi}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Corrections */}
              {result.corrections && result.corrections.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lỗi sai & Cải thiện (Corrections)
                  </h3>
                  <div className="border border-border/80 rounded bg-card overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-border/60">
                      {result.corrections.map((corr, idx) => (
                        <div
                          key={idx}
                          className="p-3 text-xs flex flex-col gap-2"
                        >
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                              {corr.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="p-2 bg-red-500/5 border border-red-500/10 rounded text-red-600 line-through">
                              {corr.original}
                            </div>
                            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-emerald-600 font-semibold">
                              {corr.improved}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            👉 {corr.reasonVi}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Mistake Candidates */}
              {result.mistakeCandidates &&
                result.mistakeCandidates.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Từ vựng & Cấu trúc khuyên học (Mistake Candidates)
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {result.mistakeCandidates.map((mistake, idx) => (
                        <Card
                          key={idx}
                          className="border border-border/60 bg-muted/5"
                        >
                          <CardHeader className="py-2.5 px-3 flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                                {mistake.patternKey}
                              </code>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border font-medium">
                                Category: {mistake.category}
                              </span>
                            </div>
                            {mistake.shouldSave && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
                                Khuyên học
                              </span>
                            )}
                          </CardHeader>
                          <CardContent className="py-2 px-3 flex flex-col gap-1.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                              <div>
                                <span className="text-[9px] text-muted-foreground block uppercase">
                                  Sai:
                                </span>
                                <span className="text-red-500">
                                  {mistake.wrongText}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground block uppercase">
                                  Đúng:
                                </span>
                                <span className="text-emerald-500 font-semibold">
                                  {mistake.correctText}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-normal mt-1 border-t border-border/30 pt-1.5">
                              {mistake.explanationVi}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/80 rounded bg-muted/5 text-center px-6">
              <MessageSquare className="size-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-bold mb-1">
                Chưa có nội dung tối ưu
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Hãy soạn thảo hoặc dán nội dung tin nhắn của bạn ở cột bên trái
                và nhấn nút &quot;Gửi Coach&quot; để trợ lý AI bắt đầu tối ưu
                hóa.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
