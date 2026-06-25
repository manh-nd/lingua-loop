'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  ArrowLeft,
  Sparkle,
  FileText,
  Copy,
  Check,
  Warning,
  Lightbulb,
  ArrowRight,
  ListChecks,
  Article,
  TextIndent,
} from '@phosphor-icons/react';

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

  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedDetailed, setCopiedDetailed] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

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

  const copyToClipboard = async (
    content: string,
    type: 'main' | 'short' | 'detailed'
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      if (type === 'main') {
        setCopiedMain(true);
        setTimeout(() => setCopiedMain(false), 2000);
      } else if (type === 'short') {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else if (type === 'detailed') {
        setCopiedDetailed(true);
        setTimeout(() => setCopiedDetailed(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

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
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

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
            <span className="font-heading font-bold text-sm tracking-tight">
              EXPLANATION COACH
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
              Tinh chỉnh tài liệu & Giải thích
            </h1>
            <p className="text-xs text-muted-foreground">
              Tối ưu hóa các văn bản dài (PR descriptions, technical
              specifications, Jira issues) để đạt tính rõ ràng và chuyên nghiệp
              tối đa.
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
                    className="w-full h-8"
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
                  <ToggleGroupItem value="short">Ngắn</ToggleGroupItem>
                  <ToggleGroupItem value="medium">Vừa</ToggleGroupItem>
                  <ToggleGroupItem value="detailed">Chi tiết</ToggleGroupItem>
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
                  placeholder="Ví dụ: mô tả lỗi hệ thống thanh toán cho các bên thứ ba..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={isPending}
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
                  rows={8}
                  placeholder={
                    mode === 'write_from_vietnamese'
                      ? 'Mô tả lỗi: Khi user click nút checkout thì loading vô tận. Nguyên nhân do API /checkout phản hồi chậm hơn 10s dẫn đến timeout...'
                      : 'Bug: when checkout click, infinite loading. API /checkout slow response >10s and timeout...'
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isPending}
                  required
                />
                <FieldDescription>
                  Viết nháp tự do lập luận của bạn để AI giúp sắp xếp và chuẩn
                  hóa lại cấu trúc văn bản.
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
              <Warning className="size-4 shrink-0" />
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
                  <div className="h-20 bg-muted/40 rounded w-full" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="h-4 bg-muted/60 rounded w-1/3" />
                  <div className="h-10 bg-muted/40 rounded w-full" />
                  <div className="h-4 bg-muted/60 rounded w-1/3" />
                  <div className="h-14 bg-muted/40 rounded w-full" />
                </CardContent>
              </Card>
            </div>
          ) : result ? (
            /* Results Panel */
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Sparkle className="size-4 text-primary animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Phân tích & Đề xuất cấu trúc
                </h2>
              </div>

              {/* 1. Main Improved Text */}
              <Card className="border border-primary/20 bg-primary/[0.01]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      Văn bản khuyên dùng (Recommended)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        copyToClipboard(result.improvedText, 'main')
                      }
                      title="Sao chép văn bản"
                    >
                      {copiedMain ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed mt-2 text-foreground p-4 bg-background border border-border/60 rounded-none max-h-96 overflow-y-auto select-all">
                    {result.improvedText}
                  </div>
                </CardHeader>
              </Card>

              {/* 2. Alternative Versions (Short / Detailed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Short Version */}
                <Card className="border border-border bg-card">
                  <CardHeader className="py-2.5 px-3 flex flex-row items-center justify-between gap-2 border-b border-border/40">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                      Bản rút gọn (Short version)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        copyToClipboard(result.shortVersion, 'short')
                      }
                    >
                      {copiedShort ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="py-3 px-3">
                    <div className="text-xs font-mono whitespace-pre-wrap p-2 bg-muted/20 border border-border/20 max-h-40 overflow-y-auto select-all">
                      {result.shortVersion}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Version */}
                {result.detailedVersion && (
                  <Card className="border border-border bg-card">
                    <CardHeader className="py-2.5 px-3 flex flex-row items-center justify-between gap-2 border-b border-border/40">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                        Bản chi tiết (Detailed version)
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          copyToClipboard(result.detailedVersion!, 'detailed')
                        }
                      >
                        {copiedDetailed ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="py-3 px-3">
                      <div className="text-xs font-mono whitespace-pre-wrap p-2 bg-muted/20 border border-border/20 max-h-40 overflow-y-auto select-all">
                        {result.detailedVersion}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 3. Structure Feedback */}
              {result.structureFeedback &&
                result.structureFeedback.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Góp ý cấu trúc tài liệu (Structure feedback)
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {result.structureFeedback.map((fb, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-muted/30 border border-border/80 rounded flex flex-col gap-1.5 text-xs"
                        >
                          <div className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-bold shrink-0">
                              ⚠
                            </span>
                            <p className="text-foreground/90 font-medium">
                              {fb.issueVi}
                            </p>
                          </div>
                          <div className="flex gap-1.5 items-start pl-4 border-l border-border">
                            <span className="text-emerald-500 font-bold shrink-0">
                              💡
                            </span>
                            <p className="text-muted-foreground">
                              {fb.suggestionVi}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. Corrections */}
              {result.corrections && result.corrections.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lỗi sai & Cách diễn đạt tốt hơn (Corrections)
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

              {/* 5. Reusable Phrases */}
              {result.reusablePhrases && result.reusablePhrases.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cấu trúc hữu ích khuyên dùng (Reusable phrases)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.reusablePhrases.map((item, idx) => (
                      <Card
                        key={idx}
                        className="border border-border/80 bg-card"
                      >
                        <CardContent className="p-3 flex flex-col gap-1.5 text-xs">
                          <span className="font-mono font-bold text-primary select-all">
                            {item.phrase}
                          </span>
                          <span className="text-[10px] text-foreground/80">
                            🇻🇳 Nghĩa: {item.meaningVi}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-relaxed">
                            💼 Ngữ cảnh: {item.situationVi}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Mistake Candidates */}
              {result.mistakeCandidates &&
                result.mistakeCandidates.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Đề xuất lưu học tập (Mistake Candidates)
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
                                {mistake.category}
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
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/80 rounded bg-muted/5 text-center px-6">
              <FileText className="size-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-bold mb-1">
                Chưa có nội dung tối ưu
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Hãy nhập nội dung ý kiến hoặc tài liệu viết thô ở cột bên trái
                và nhấn nút "Gửi Coach" để bắt đầu nhận phân tích chuyên sâu.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
