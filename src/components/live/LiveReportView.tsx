'use client';

import React from 'react';
import { CopyButton } from '@/components/coach/CopyButton';
import { TTSButton } from '@/components/coach/TTSButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Loader2, Check, Brain, BookOpen } from 'lucide-react';

export type AnalysisReport = {
  overallScore: number;
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  summaryVi: string;
  mistakes: Array<{
    originalText: string;
    correctedText: string;
    explanationVi: string;
  }>;
  alternatives: Array<{
    originalText: string;
    betterAlternative: string;
    explanationVi: string;
  }>;
  practiceMonologue?: string;
};

interface LiveReportViewProps {
  report: AnalysisReport | null;
  isAnalyzing: boolean;
  modeTitle: string;
  savedItems: Record<string, boolean>;
  onSaveToMemory: (
    key: string,
    type: 'mistake' | 'alternative',
    original: string,
    correctedOrAlt: string,
    explanation: string
  ) => void;
  onRepractice: () => void;
}

export function LiveReportView({
  report,
  isAnalyzing,
  modeTitle,
  savedItems,
  onSaveToMemory,
  onRepractice,
}: LiveReportViewProps) {
  return (
    <Card className="border border-border/80 shadow-none rounded-2xl overflow-hidden bg-card animate-in fade-in duration-300">
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Báo cáo cuộc gọi: {modeTitle}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Được phân tích tự động bằng trí tuệ nhân tạo Gemini
            </p>
          </div>
          <Button
            onClick={onRepractice}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Luyện tập lại
          </Button>
        </div>

        {isAnalyzing ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium animate-pulse text-center">
              Đang phân tích cuộc hội thoại và xây dựng sổ tay lỗi sai...
            </span>
          </div>
        ) : !report ? (
          <div className="py-8 flex flex-col items-center gap-3 text-muted-foreground/60 text-xs italic text-center">
            Không đủ dữ liệu hội thoại để phân tích chi tiết. Vui lòng nói nhiều
            hơn ở cuộc gọi tiếp theo!
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Performance Dials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Điểm tổng quát',
                  val: report.overallScore,
                  color: 'text-primary border-primary/20 bg-primary/5',
                },
                {
                  label: 'Ngữ pháp',
                  val: report.grammarScore,
                  color:
                    'text-emerald-600 border-emerald-500/20 bg-emerald-500/5',
                },
                {
                  label: 'Phát âm (STT)',
                  val: report.pronunciationScore,
                  color: 'text-blue-600 border-blue-500/20 bg-blue-500/5',
                },
                {
                  label: 'Độ trôi chảy',
                  val: report.fluencyScore,
                  color: 'text-amber-600 border-amber-500/20 bg-amber-500/5',
                },
              ].map((dial, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 flex flex-col items-center gap-1.5 text-center ${dial.color}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {dial.label}
                  </span>
                  <span className="text-3xl font-extrabold font-mono tracking-tight">
                    {dial.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Encouraging summary */}
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 text-xs leading-relaxed text-foreground/90 font-medium">
              🏆{' '}
              <span className="font-bold text-foreground">
                Đánh giá từ Coach:
              </span>{' '}
              {report.summaryVi}
            </div>

            {/* Practice Monologue */}
            {report.practiceMonologue && (
              <div className="border border-border/80 rounded-2xl p-4.5 bg-primary/[0.01] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    📖 Bài nói tổng hợp của bạn (Practice Monologue):
                  </span>
                  <div className="flex items-center gap-1">
                    <TTSButton
                      text={report.practiceMonologue}
                      size="icon-xs"
                      variant="outline"
                    />
                    <CopyButton
                      text={report.practiceMonologue}
                      size="icon-xs"
                      variant="outline"
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 border border-border/40 rounded-xl p-3.5 text-xs text-foreground font-sans leading-relaxed select-text italic">
                  &ldquo;{report.practiceMonologue}&rdquo;
                </div>
                <span className="text-[10px] text-muted-foreground leading-normal font-medium">
                  💡 Mẹo: Đây là bài nói tổng hợp hoàn chỉnh từ tất cả ý tưởng
                  bạn chia sẻ trong phòng Live, được viết lại theo phong cách tự
                  nhiên, chuẩn bản xứ. Hãy đọc to đoạn văn này hàng ngày để tăng
                  phản xạ phát âm và từ vựng!
                </span>
              </div>
            )}

            {/* Grammar mistakes check */}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                ❌ Lỗi ngữ pháp & Từ vựng cần lưu ý:
              </span>
              {report.mistakes.length === 0 ? (
                <div className="p-4 border border-emerald-500/25 bg-emerald-500/[0.01] rounded-2xl text-xs text-emerald-600 font-medium flex items-center gap-2">
                  <Check className="size-4" />
                  Tuyệt vời! Không phát hiện lỗi sai ngữ pháp nghiêm trọng nào.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {report.mistakes.map((mistake, idx) => {
                    const key = `m_${idx}`;
                    const isSaved = !!savedItems[key];

                    return (
                      <div
                        key={idx}
                        className="border border-border/80 rounded-2xl p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-red-500 line-through">
                              {mistake.originalText}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              → {mistake.correctedText}
                            </span>
                          </div>
                          <p className="text-muted-foreground font-medium leading-relaxed">
                            💡 {mistake.explanationVi}
                          </p>
                        </div>

                        <div className="shrink-0 self-end sm:self-center select-none">
                          {isSaved ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 py-1 px-2 border border-emerald-500/20 bg-emerald-500/5 rounded">
                              Đã lưu Sổ tay
                              <Check className="size-3" />
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="xs"
                              onClick={() =>
                                onSaveToMemory(
                                  key,
                                  'mistake',
                                  mistake.originalText,
                                  mistake.correctedText,
                                  mistake.explanationVi
                                )
                              }
                              className="text-[10px] h-7 px-3 font-bold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 hover:border-primary cursor-pointer flex items-center gap-1"
                            >
                              <Brain className="size-3 text-primary group-hover:text-primary-foreground" />
                              Lưu sổ tay
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Better phrasings */}
            {report.alternatives && report.alternatives.length > 0 && (
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                  💡 Đề xuất cách diễn đạt tự nhiên hơn:
                </span>
                <div className="flex flex-col gap-3">
                  {report.alternatives.map((alt, idx) => {
                    const key = `a_${idx}`;
                    const isSaved = !!savedItems[key];

                    return (
                      <div
                        key={idx}
                        className="border border-border/80 rounded-2xl p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-muted-foreground">
                              Bạn nói: &ldquo;{alt.originalText}&rdquo;
                            </span>
                            <span className="font-bold text-primary">
                              Nên nói: &ldquo;{alt.betterAlternative}&rdquo;
                            </span>
                          </div>
                          <p className="text-muted-foreground font-medium leading-relaxed">
                            💼 {alt.explanationVi}
                          </p>
                        </div>

                        <div className="shrink-0 self-end sm:self-center select-none">
                          {isSaved ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 py-1 px-2 border border-emerald-500/20 bg-emerald-500/5 rounded">
                              Đã lưu Sổ tay
                              <Check className="size-3" />
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="xs"
                              onClick={() =>
                                onSaveToMemory(
                                  key,
                                  'alternative',
                                  alt.originalText,
                                  alt.betterAlternative,
                                  alt.explanationVi
                                )
                              }
                              className="text-[10px] h-7 px-3 font-bold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 hover:border-primary cursor-pointer flex items-center gap-1"
                            >
                              <Brain className="size-3 text-primary group-hover:text-primary-foreground" />
                              Lưu sổ tay
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
