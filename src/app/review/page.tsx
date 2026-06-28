'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Inbox,
  RotateCcw,
  Keyboard,
  HelpCircle,
  Eye,
  Globe,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { CoachShell } from '@/components/coach/CoachShell';
import {
  getLocalMemoryItems,
  updateLocalMemoryItem,
  LocalMemoryItem,
} from '@/lib/memory/local-memory-store';
import { cn, formatPatternKey } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { submitReviewGrade } from './actions';
import { ReviewGradeResult } from '@/core/review/review.schema';

const categories = [
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'tone', label: 'Tông giọng' },
  { value: 'word_choice', label: 'Dùng từ' },
  { value: 'naturalness', label: 'Độ tự nhiên' },
  { value: 'clarity', label: 'Mạch lạc' },
  { value: 'structure', label: 'Cấu trúc' },
];

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<LocalMemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<ReviewGradeResult | null>(
    null
  );

  // Spaced repetition metadata updates
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>(
    []
  );
  const [firstAttemptIds, setFirstAttemptIds] = useState<Set<string>>(
    new Set()
  );
  const [showHint, setShowHint] = useState(false);

  // Hydration safety
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const allItems = getLocalMemoryItems();
      const activeItems = allItems.filter((item) => item.status === 'active');

      const singleId = searchParams.get('id');
      if (singleId) {
        const matched = activeItems.filter((item) => item.id === singleId);
        setItems(matched);
      } else {
        // Standard session: only due items (nextReviewAt <= now)
        const now = new Date();
        const dueItems = activeItems.filter((item) => {
          if (!item.nextReviewAt) return true;
          return new Date(item.nextReviewAt) <= now;
        });

        if (dueItems.length === 0) {
          setItems([]);
        } else {
          // Shuffle due items to make it dynamic
          const shuffled = [...dueItems].sort(() => Math.random() - 0.5);
          setItems(shuffled);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Autofocus input when index changes
  useEffect(() => {
    if (isMounted && !isSubmitted && !isFinished && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentIndex, isSubmitted, isFinished, isMounted]);

  // SM-2 Spaced Repetition Algorithm calculations and storage updates
  const updateSRS = (
    item: LocalMemoryItem,
    score: number,
    isCorrect: boolean,
    nextChallengePrompt?: string
  ) => {
    let grade = 0;
    if (isCorrect) {
      if (score >= 90) grade = 5;
      else if (score >= 80) grade = 4;
      else grade = 3;
    } else {
      if (score >= 60) grade = 2;
      else if (score >= 40) grade = 1;
      else grade = 0;
    }

    let correctStreak = item.correctStreak ?? 0;
    let easeFactor = item.easeFactor ?? 2.5;
    let intervalDays = item.intervalDays ?? 0;

    if (grade >= 3) {
      correctStreak += 1;
      if (correctStreak === 1) {
        intervalDays = 1;
      } else if (correctStreak === 2) {
        intervalDays = 4;
      } else {
        intervalDays = Math.ceil(intervalDays * easeFactor);
      }
    } else {
      correctStreak = 0;
      intervalDays = 1;
    }

    // Ease factor adjustment: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    let newEaseFactor =
      easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    const newReviewCount = (item.reviewCount ?? 0) + 1;
    const isMastered = correctStreak >= 5 && intervalDays >= 30;

    updateLocalMemoryItem(item.id, {
      reviewCount: newReviewCount,
      correctStreak,
      wrongStreak: grade < 3 ? (item.wrongStreak ?? 0) + 1 : 0,
      intervalDays,
      easeFactor: parseFloat(newEaseFactor.toFixed(2)),
      nextReviewAt: nextReviewAt.toISOString(),
      lastReviewedAt: new Date().toISOString(),
      status: isMastered ? 'mastered' : 'active',
      reviewPromptText: nextChallengePrompt || item.reviewPromptText,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitted || isGrading || !userAnswer.trim()) return;

    const currentItem = items[currentIndex];
    setIsGrading(true);
    setError(null);

    try {
      const result = await submitReviewGrade(currentItem, userAnswer);
      setGradeResult(result);
      setIsCorrect(result.isCorrect);
      setIsSubmitted(true);

      const itemId = currentItem.id;
      // Only process SRS updates and tally results on the first attempt of the card in this session
      if (!firstAttemptIds.has(itemId)) {
        setResults((prev) => [
          ...prev,
          { id: itemId, correct: result.isCorrect },
        ]);
        setFirstAttemptIds((prev) => {
          const next = new Set(prev);
          next.add(itemId);
          return next;
        });
        updateSRS(
          currentItem,
          result.score,
          result.isCorrect,
          result.nextChallengePrompt
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi trong quá trình chấm điểm.'
      );
    } finally {
      setIsGrading(false);
    }
  };

  const handleOverride = () => {
    const currentItem = items[currentIndex];
    const newCorrect = !isCorrect;
    setIsCorrect(newCorrect);

    // 1. Update Spaced Spacing (SRS) in localStorage with new overridden correctness
    updateSRS(
      currentItem,
      newCorrect ? 100 : 0,
      newCorrect,
      gradeResult?.nextChallengePrompt
    );

    // 2. Update results state to reflect the override
    setResults((prev) => {
      const index = prev.map((r) => r.id).lastIndexOf(currentItem.id);
      if (index !== -1) {
        const nextResults = [...prev];
        nextResults[index] = { id: currentItem.id, correct: newCorrect };
        return nextResults;
      }
      return prev;
    });

    // 3. Dynamically update the upcoming review queue
    if (newCorrect) {
      // If changed to Correct, remove the re-queued duplicate from the upcoming queue
      setItems((prev) => {
        const upcomingIndex = prev.indexOf(currentItem, currentIndex + 1);
        if (upcomingIndex !== -1) {
          const nextItems = [...prev];
          nextItems.splice(upcomingIndex, 1);
          return nextItems;
        }
        return prev;
      });
    } else {
      // If changed to Wrong, append the card to the end of the queue for re-queuing
      setItems((prev) => [...prev, currentItem]);
    }
  };

  const handleContinue = () => {
    const currentItem = items[currentIndex];

    const nextItems = !isCorrect ? [...items, currentItem] : items;
    if (!isCorrect) {
      setItems(nextItems);
    }

    if (currentIndex + 1 < nextItems.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsSubmitted(false);
      setShowHint(false);
      setGradeResult(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    const allItems = getLocalMemoryItems();
    const activeItems = allItems.filter((item) => item.status === 'active');

    const singleId = searchParams.get('id');
    if (singleId) {
      const matched = activeItems.filter((item) => item.id === singleId);
      setItems(matched);
    } else {
      const now = new Date();
      const dueItems = activeItems.filter((item) => {
        if (!item.nextReviewAt) return true;
        return new Date(item.nextReviewAt) <= now;
      });
      const shuffled = [...dueItems].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    }

    setCurrentIndex(0);
    setUserAnswer('');
    setIsSubmitted(false);
    setShowHint(false);
    setGradeResult(null);
    setResults([]);
    setFirstAttemptIds(new Set());
    setIsFinished(false);
  };

  const handleStudyAhead = () => {
    const activeItems = getLocalMemoryItems().filter(
      (item) => item.status === 'active'
    );
    const shuffled = [...activeItems].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentIndex(0);
    setUserAnswer('');
    setIsSubmitted(false);
    setShowHint(false);
    setGradeResult(null);
    setResults([]);
    setFirstAttemptIds(new Set());
    setIsFinished(false);
  };

  const getInitialsHint = (phrase: string) => {
    return phrase
      .split(' ')
      .map((word) => {
        if (!word) return '';
        const first = word[0];
        const rest = word.slice(1).replace(/[a-zA-Z0-9]/g, '•');
        return first + rest;
      })
      .join(' ');
  };

  // Keyboard shortcut (Cmd/Ctrl + Enter) inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isSubmitted) {
        handleSubmit();
      } else {
        handleContinue();
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentItem = items[currentIndex];
  // Calculate distinct total first-attempt cards in the session (excluding duplicates added by re-queuing)
  const uniqueCardIds = new Set(items.map((i) => i.id));
  const distinctTotal = uniqueCardIds.size;
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <CoachShell
      headerTitle="ÔN TẬP BỘ NHỚ (REVIEW)"
      headerIcon={<Brain className="size-4 text-primary animate-pulse" />}
      sidebarTitle="Vòng lặp khắc phục lỗi sai"
      sidebarDescription="Thực hành chủ động viết lại lỗi sai hoặc giải thích bẫy đọc hiểu bằng AI. Vòng lặp re-queue đảm bảo bạn chỉ vượt qua khi gõ đúng."
      showReset={isSubmitted || isFinished || userAnswer.trim().length > 0}
      onReset={handleRestart}
      sidebarContent={
        <div className="flex flex-col gap-6">
          {items.length > 0 && !isFinished && (
            <Card className="border border-border/80 bg-white/20 dark:bg-black/10 shadow-none rounded-xl p-4.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Tiến độ phiên ôn tập
              </h2>
              <div className="flex flex-col gap-3">
                {/* Dynamic Progress Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentIndex / items.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-muted-foreground">
                    Đã hoàn thành {currentIndex} / {items.length} lượt thẻ
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Đạt: {correctCount}/{distinctTotal} thẻ
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Tips Card */}
          <div className="flex flex-col gap-2.5">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quy tắc ôn tập
            </h2>
            <div className="p-4 rounded-xl border border-border bg-background flex gap-3 text-xs leading-relaxed text-muted-foreground">
              <HelpCircle className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <p>
                  <strong>Semantic Grading:</strong> Trình chấm AI đánh giá sắc
                  thái ngữ cảnh và ý nghĩa thực tế, chấp nhận lỗi chính tả nhỏ.
                </p>
                <p>
                  <strong>Vòng lặp Re-queue:</strong> Nếu làm sai, thẻ sẽ tự
                  động đưa xuống cuối hàng để bạn gõ lại cho đúng trước khi kết
                  thúc phiên.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {items.length === 0 ? (
            /* Empty State */
            <div className="py-14 text-center max-w-sm mx-auto flex flex-col items-center gap-5">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Bạn đã hoàn thành mục tiêu!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Không còn thẻ nào đến hạn ôn tập hôm nay. Spaced Repetition
                  (SRS) giúp bạn tiết kiệm thời gian bằng cách học dãn cách.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 w-full mt-2 select-none">
                <Button
                  onClick={handleStudyAhead}
                  className="w-full text-xs font-semibold cursor-pointer py-4 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground shadow-xs"
                >
                  <Brain className="size-3.5 mr-2" />
                  Ôn tập trước hạn (Study Ahead)
                </Button>
                <div className="flex gap-2 w-full">
                  <Link href="/memory" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-2xs font-bold cursor-pointer border-border hover:bg-muted text-muted-foreground hover:text-foreground h-8.5 rounded-lg"
                    >
                      Xem Sổ tay lỗi
                    </Button>
                  </Link>
                  <Link href="/message" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-2xs font-bold cursor-pointer border-border hover:bg-muted text-muted-foreground hover:text-foreground h-8.5 rounded-lg"
                    >
                      Vào Slack Coach
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : isFinished ? (
            /* Finished State */
            <Card className="border border-border rounded-xl shadow-md overflow-hidden bg-white/[0.01]">
              <div className="p-6 text-center flex flex-col items-center gap-5">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Sparkles className="size-10 animate-pulse" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Hoàn thành lượt ôn tập!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    Chúc mừng bạn đã giải quyết thành công tất cả các thẻ trong
                    phiên này. Tiếp tục giữ vững tinh thần để xây dựng thói quen
                    viết chuyên nghiệp.
                  </p>
                </div>

                <div className="p-5.5 rounded-xl bg-muted/30 border border-border/50 w-full max-w-xs flex justify-around text-center my-1.5 font-sans">
                  <div>
                    <span className="text-2xl font-extrabold text-foreground block">
                      {distinctTotal}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Số thẻ ôn
                    </span>
                  </div>
                  <div className="w-px bg-border/60 self-stretch" />
                  <div>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      {correctCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Làm đúng ngay
                    </span>
                  </div>
                  <div className="w-px bg-border/60 self-stretch" />
                  <div>
                    <span className="text-2xl font-extrabold text-rose-500 block">
                      {distinctTotal - correctCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Phải ôn lại
                    </span>
                  </div>
                </div>

                <div className="flex gap-3.5 w-full max-w-sm mt-1.5 select-none">
                  <Button
                    type="button"
                    onClick={handleRestart}
                    className="flex-1 text-xs font-bold py-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer rounded-lg border-none"
                  >
                    <RotateCcw className="size-3.5 mr-2" />
                    Luyện tập lại
                  </Button>
                  <Link href="/memory" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-bold py-4 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground h-9"
                    >
                      Về Sổ tay lỗi
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            /* Review Card Game State */
            <div className="flex flex-col gap-5.5">
              {/* Dynamic Mistake Card depending on memoryType */}
              <Card className="border border-border bg-white/[0.01] rounded-2xl overflow-hidden shadow-2xs">
                {/* Header Tag */}
                <div className="py-2.5 px-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20 text-[10px] tracking-wide">
                      {currentItem.patternNameVi ||
                        formatPatternKey(currentItem.patternKey)}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border',
                        currentItem.memoryType === 'writing_mistake' &&
                          'bg-rose-500/10 text-rose-600 border-rose-500/20',
                        currentItem.memoryType === 'reusable_phrase' &&
                          'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                        currentItem.memoryType === 'reading_trap' &&
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}
                    >
                      {currentItem.memoryType === 'writing_mistake' &&
                        'Lỗi viết sai'}
                      {currentItem.memoryType === 'reusable_phrase' &&
                        'Cụm từ hữu ích'}
                      {currentItem.memoryType === 'reading_trap' &&
                        'Bẫy đọc hiểu'}
                    </span>
                  </div>
                  <span className="uppercase px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border font-medium h-5 inline-flex items-center justify-center">
                    {categories.find((c) => c.value === currentItem.category)
                      ?.label || currentItem.category}
                  </span>
                </div>

                <CardContent className="p-5 flex flex-col gap-4.5">
                  {/* WRITING MISTAKE LAYOUT */}
                  {currentItem.memoryType === 'writing_mistake' && (
                    <div className="flex flex-col gap-4">
                      <div className="p-3.5 bg-rose-500/[0.03] rounded-xl border border-rose-500/10 flex flex-col gap-1 text-[11px] font-mono">
                        <span className="text-[9px] text-red-700 dark:text-red-400 uppercase font-bold flex items-center gap-1 select-none">
                          <XCircle className="size-3 shrink-0" />
                          {currentItem.reviewPromptText
                            ? 'Biến thể thực hành:'
                            : 'Bản nháp cần cải thiện:'}
                        </span>
                        <span className="text-red-600 dark:text-red-400 select-all leading-relaxed break-words font-medium text-xs">
                          {currentItem.reviewPromptText ||
                            currentItem.wrongText}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 select-none">
                          💡
                        </span>
                        <span className="select-text">
                          <strong>Gợi ý cải thiện:</strong>{' '}
                          {currentItem.explanationVi}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* REUSABLE PHRASE LAYOUT */}
                  {currentItem.memoryType === 'reusable_phrase' && (
                    <div className="flex flex-col gap-4">
                      <div className="p-3.5 bg-emerald-500/[0.02] rounded-xl border border-emerald-500/10 flex flex-col gap-1">
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center gap-1 select-none">
                          <FileText className="size-3.5 shrink-0" />
                          {currentItem.reviewPromptText
                            ? 'Ngữ cảnh ôn tập mới:'
                            : 'Ý định diễn đạt tiếng Việt:'}
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-400 leading-relaxed font-semibold text-xs pt-1 select-text">
                          {currentItem.reviewPromptText ||
                            currentItem.situationVi}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 select-none">
                          💡
                        </span>
                        <span className="select-text">
                          <strong>Gợi ý sắc thái:</strong>{' '}
                          {currentItem.explanationVi}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* READING TRAP LAYOUT */}
                  {currentItem.memoryType === 'reading_trap' && (
                    <div className="flex flex-col gap-4">
                      <div className="p-3.5 bg-amber-500/[0.03] rounded-xl border border-amber-500/10 flex flex-col gap-1 font-mono">
                        <span className="text-[9px] text-amber-700 dark:text-amber-400 uppercase font-bold flex items-center gap-1 select-none">
                          <AlertTriangle className="size-3.5 shrink-0" />
                          {currentItem.reviewPromptText
                            ? 'Ngữ cảnh thực hành mới:'
                            : 'Từ/cụm từ tiếng Anh dễ nhầm lẫn:'}
                        </span>
                        <span className="text-amber-800 dark:text-amber-400 leading-relaxed font-bold text-sm pt-1 select-all">
                          {currentItem.reviewPromptText || currentItem.trapText}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 select-none">
                          💡
                        </span>
                        <span className="select-text">
                          <strong>Lưu ý:</strong> {currentItem.explanationVi}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Input Section */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline mb-1">
                    <label
                      htmlFor="user-correction"
                      className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      {currentItem.memoryType === 'writing_mistake' &&
                        'Viết câu tiếng Anh đã sửa đổi:'}
                      {currentItem.memoryType === 'reusable_phrase' &&
                        'Nhập cụm từ/câu tương ứng bằng tiếng Anh:'}
                      {currentItem.memoryType === 'reading_trap' &&
                        'Giải thích nghĩa/sắc thái thực tế của cụm từ này:'}
                    </label>
                    {currentItem.memoryType === 'reusable_phrase' &&
                      currentItem.phrase &&
                      !isSubmitted && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowHint(!showHint)}
                          className="text-[9.5px] h-6 px-2 hover:bg-muted text-primary font-bold tracking-normal rounded cursor-pointer select-none"
                        >
                          {showHint ? 'Ẩn gợi ý' : 'Gợi ý chữ cái đầu'}
                        </Button>
                      )}
                  </div>

                  {/* Initials Hint Banner */}
                  {showHint &&
                    currentItem.memoryType === 'reusable_phrase' &&
                    currentItem.phrase && (
                      <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/[0.01] font-mono text-[11.5px] text-primary/95 leading-relaxed tracking-wider mb-1 select-text">
                        <span className="font-bold text-[9px] uppercase tracking-normal text-muted-foreground mr-1.5 select-none">
                          Gợi ý:
                        </span>
                        {getInitialsHint(currentItem.phrase)}
                      </div>
                    )}

                  <Textarea
                    id="user-correction"
                    name="userCorrection"
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitted || isGrading}
                    rows={currentItem.memoryType === 'reading_trap' ? 2 : 3}
                    placeholder={
                      currentItem.memoryType === 'writing_mistake'
                        ? 'Type the corrected English sentence...'
                        : currentItem.memoryType === 'reusable_phrase'
                          ? 'Type the target phrase or matching sentence...'
                          : 'Giải thích hàm ý của cụm từ này trong văn hóa doanh nghiệp...'
                    }
                    className="text-xs p-3 focus-visible:ring-primary/40 leading-relaxed font-sans"
                    required
                  />
                  {!isSubmitted && !isGrading && (
                    <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1 leading-none mt-0.5 select-none">
                      <Keyboard className="size-3" />
                      Bấm{' '}
                      <kbd className="px-1 py-0.2 bg-muted border border-border/60 text-[8px] font-mono">
                        ⌘↵
                      </kbd>{' '}
                      hoặc{' '}
                      <kbd className="px-1 py-0.2 bg-muted border border-border/60 text-[8px] font-mono">
                        Ctrl+Enter
                      </kbd>{' '}
                      để kiểm tra nhanh.
                    </span>
                  )}
                </div>

                {/* AI Review Grader Result Feedback Panel */}
                {isSubmitted && gradeResult && (
                  <Card
                    className={cn(
                      'border rounded-2xl p-4.5 animate-in fade-in slide-in-from-top-1 duration-250 shadow-none border-l-4 font-sans',
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-500/[0.01] border-l-emerald-500'
                        : 'border-rose-500 bg-rose-500/[0.01] border-l-rose-500'
                    )}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Status Header */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 h-5 inline-flex justify-center select-none">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-700 dark:text-emerald-400">
                                Chính xác (Correct)
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="size-4.5 text-rose-600 animate-pulse" />
                              <span className="text-rose-700 dark:text-rose-400">
                                Cần ôn tập (Incorrect)
                              </span>
                            </>
                          )}
                        </span>
                        <div className="flex items-center gap-2 select-none">
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border',
                              isCorrect
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            )}
                          >
                            Điểm: {gradeResult.score}/100
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleOverride}
                            className="text-[9.5px] h-6 px-2 hover:bg-muted text-muted-foreground hover:text-foreground font-bold tracking-normal rounded cursor-pointer"
                          >
                            {isCorrect ? 'Tự chấm là Sai' : 'Tự chấm là Đúng'}
                          </Button>
                        </div>
                      </div>

                      {/* Feedback Text */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none">
                          Nhận xét của AI:
                        </span>
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium select-text">
                          {gradeResult.feedbackVi}
                        </p>
                      </div>

                      {/* Display userAnswer vs expected correctText */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs leading-relaxed mt-0.5 border-t border-border/30 pt-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none">
                            Câu trả lời của bạn:
                          </span>
                          <span
                            className={cn(
                              'font-mono font-medium py-1.5 px-2.5 rounded-lg bg-muted/40 text-[11px] break-words',
                              isCorrect
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {userAnswer}
                          </span>
                        </div>

                        {currentItem.memoryType === 'writing_mistake' &&
                          currentItem.correctText && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none">
                                Đáp án đúng tham khảo:
                              </span>
                              <span className="font-mono font-bold py-1.5 px-2.5 rounded-lg bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 text-[11px] select-all break-words leading-normal">
                                {currentItem.correctText}
                              </span>
                            </div>
                          )}

                        {currentItem.memoryType === 'reusable_phrase' &&
                          currentItem.phrase && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none">
                                Cụm từ mục tiêu:
                              </span>
                              <span className="font-mono font-bold py-1.5 px-2.5 rounded-lg bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 text-[11px] select-all break-words leading-normal">
                                {currentItem.phrase}
                              </span>
                            </div>
                          )}

                        {currentItem.memoryType === 'reading_trap' &&
                          currentItem.correctInterpretationVi && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none">
                                Giải thích chuẩn xác:
                              </span>
                              <span className="font-sans font-semibold py-1.5 px-2.5 rounded-lg bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 text-[11px] select-all break-words leading-normal">
                                {currentItem.correctInterpretationVi}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Suggested Correction */}
                      {gradeResult.suggestedCorrection && (
                        <div className="flex flex-col gap-1 border-t border-border/30 pt-3">
                          <span className="text-[9.5px] text-muted-foreground uppercase font-bold select-none flex items-center gap-1">
                            <Eye className="size-3" />
                            Cách viết đề xuất (Suggested Correction):
                          </span>
                          <span className="font-mono font-bold text-foreground py-1.5 px-2.5 rounded-lg bg-primary/[0.03] border border-primary/10 text-[11px] select-all break-words leading-normal">
                            {gradeResult.suggestedCorrection}
                          </span>
                        </div>
                      )}

                      {/* Business & Cultural Nuances */}
                      {gradeResult.culturalContextVi && (
                        <div className="text-indigo-600 dark:text-indigo-400 text-[10.5px] leading-relaxed bg-indigo-500/[0.02] border border-indigo-500/10 p-2.5 rounded-xl flex items-start gap-1.5 border-t border-border/25 pt-3">
                          <Globe className="size-3.5 shrink-0 mt-0.5 text-indigo-500 select-none" />
                          <span className="select-text">
                            <strong>Văn hóa & Ngữ cảnh:</strong>{' '}
                            {gradeResult.culturalContextVi}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Form Action Button */}
                <div className="flex justify-end gap-2 mt-1 select-none">
                  {error && (
                    <div className="text-xs text-red-500 flex items-center mr-auto font-medium">
                      {error}
                    </div>
                  )}

                  {!isSubmitted ? (
                    <Button
                      type="submit"
                      disabled={isGrading || !userAnswer.trim()}
                      className="text-xs font-bold px-4 py-4.5 bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer shadow-xs flex items-center justify-center min-w-24 h-9"
                    >
                      {isGrading ? (
                        <>
                          <span className="animate-spin mr-1.5 size-3 border-2 border-current border-t-transparent rounded-full" />
                          AI đang chấm…
                        </>
                      ) : (
                        'Nộp bài & Chấm AI'
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="text-xs font-bold px-4.5 py-4.5 bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer shadow-xs flex items-center gap-1.5 h-9"
                    >
                      {!isCorrect ? 'Thử lại (Re-queue)' : 'Tiếp tục'}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      }
    />
  );
}
