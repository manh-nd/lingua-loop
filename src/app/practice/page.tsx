'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  CheckCircle2,
  Inbox,
  Volume2,
  Sparkles,
  Lock,
  RotateCcw,
  Check,
  Copy,
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CoachShell } from '@/components/coach/CoachShell';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  fetchDueMemoryItems,
  generatePracticeChallenge,
  submitPracticeAnswer,
  UIMemoryItem,
} from './actions';
import {
  PracticeChallenge,
  PracticeGrading,
} from '@/core/practice/practice.workflow';

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cards, setCards] = useState<UIMemoryItem[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Challenge Generation State
  const [currentChallenge, setCurrentChallenge] =
    useState<PracticeChallenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // User input & Grading states
  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<PracticeGrading | null>(
    null
  );
  const [showOriginalItem, setShowOriginalItem] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCards = async () => {
    setLoadingCards(true);
    setError(null);
    try {
      const dueCards = await fetchDueMemoryItems();
      setCards(dueCards);
      setCurrentIndex(0);
      setIsFinished(false);
      setReviewedCount(0);
      setCorrectCount(0);
      setCurrentChallenge(null);
      setGradingResult(null);
      setUserAnswer('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải thẻ ôn tập.');
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCards();
    }
  }, [session]);

  const activeCard = cards[currentIndex];

  // Load challenge whenever active index changes or card changes
  useEffect(() => {
    if (!activeCard) return;

    const loadChallenge = async () => {
      setLoadingChallenge(true);
      setCurrentChallenge(null);
      setGradingResult(null);
      setUserAnswer('');
      setShowOriginalItem(false);
      setError(null);
      try {
        const challenge = await generatePracticeChallenge(activeCard.id);
        setCurrentChallenge(challenge);
      } catch (err: any) {
        setError(err.message || 'Lỗi tạo thử thách luyện tập.');
      } finally {
        setLoadingChallenge(false);
      }
    };

    loadChallenge();
  }, [currentIndex, activeCard]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const checkAnswer = async () => {
    if (!activeCard || !currentChallenge || !userAnswer.trim() || isGrading)
      return;

    setIsGrading(true);
    setError(null);
    try {
      const grading = await submitPracticeAnswer(
        activeCard.id,
        currentChallenge.instruction,
        userAnswer
      );
      setGradingResult(grading);
      setReviewedCount((prev) => prev + 1);
      if (grading.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi câu trả lời.');
    } finally {
      setIsGrading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Guest State - Prompt Auth
  if (!session?.user) {
    return (
      <CoachShell
        headerTitle="LUYỆN TẬP CHỦ ĐỘNG"
        headerIcon={<Brain className="size-4 text-primary animate-pulse" />}
        sidebarTitle="Đăng nhập để luyện tập"
        sidebarDescription="Ôn tập ghi nhớ bằng cách viết lại câu hoặc đặt câu trong ngữ cảnh văn phòng cụ thể. AI sẽ đánh giá câu trả lời của bạn."
        showReset={false}
        onReset={() => {}}
        sidebarContent={null}
        mainContent={
          <div className="py-14 text-center max-w-sm mx-auto flex flex-col items-center gap-6">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Lock className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Yêu cầu đăng nhập
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống luyện tập viết (Spaced Repetition) yêu cầu tài khoản
                đăng nhập để lưu tiến trình học tập cá nhân hóa của bạn.
              </p>
            </div>
            <Button onClick={() => setIsAuthOpen(true)} className="w-full">
              Đăng nhập / Đăng ký ngay
            </Button>
            <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
          </div>
        }
      />
    );
  }

  return (
    <CoachShell
      headerTitle="LUYỆN TẬP VIẾT CHỦ ĐỘNG (PRACTICE)"
      headerIcon={<Brain className="size-4 text-primary animate-pulse" />}
      sidebarTitle="Spaced Repetition"
      sidebarDescription="Hệ thống tự động sinh câu hỏi thực hành dựa trên các ghi nhớ đã lưu trong Sổ tay của bạn. Trả lời đúng để giãn thời gian ôn tập tiếp theo."
      showReset={cards.length > 0 && !isFinished}
      onReset={fetchCards}
      sidebarContent={
        <div className="flex flex-col gap-4">
          {cards.length > 0 && !isFinished && (
            <Card className="border border-border/85 bg-card/20 shadow-none rounded-xl p-4.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Tiến trình luyện tập
              </h2>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="bg-primary h-1.5 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / cards.length) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Thẻ số {currentIndex + 1} / {cards.length}
                </span>
                <span>
                  Chính xác: {correctCount}/{reviewedCount}
                </span>
              </div>
            </Card>
          )}
        </div>
      }
      mainContent={
        <div className="w-full max-w-lg mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-300">
          {loadingCards ? (
            <div className="py-20 text-center">
              <span className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full inline-block" />
              <p className="text-xs text-muted-foreground mt-2">
                Đang tải danh sách thẻ ôn tập...
              </p>
            </div>
          ) : cards.length === 0 ? (
            <div className="py-14 text-center max-w-sm mx-auto flex flex-col items-center gap-5">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Tuyệt vời! Bạn đã hoàn thành!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Không còn bài thực hành viết nào đến hạn hôm nay. Hãy học thêm
                  từ vựng hoặc chỉnh sửa câu viết để tích lũy thêm bộ nhớ nhé!
                </p>
              </div>
              <Button onClick={fetchCards} variant="outline" className="w-full">
                Tải lại bài ôn tập
              </Button>
            </div>
          ) : isFinished ? (
            <div className="py-12 text-center max-w-sm mx-auto flex flex-col items-center gap-5">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
                <Sparkles className="size-10 animate-bounce" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Hoàn thành phiên luyện tập!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bạn đã thực hành viết xong tất cả các thẻ đến hạn. Tỷ lệ chính
                  xác phiên này:{' '}
                  {Math.round((correctCount / cards.length) * 100)}%. Hẹn gặp
                  lại bạn ở chu kỳ tiếp theo!
                </p>
              </div>
              <Button onClick={fetchCards} className="w-full">
                Luyện tập tiếp
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Challenge Box */}
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm relative overflow-hidden">
                <CardContent className="p-5.5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded select-none">
                      {activeCard.type === 'mistake'
                        ? 'Sửa lỗi câu nháp'
                        : activeCard.type === 'reusable_phrase'
                          ? 'Sử dụng cụm từ'
                          : activeCard.type === 'vocabulary'
                            ? 'Sử dụng từ vựng'
                            : 'Phong cách & Tông giọng'}
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      Chu kỳ ôn tập: {activeCard.interval} ngày
                    </span>
                  </div>

                  {loadingChallenge ? (
                    <div className="py-8 flex flex-col gap-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  ) : currentChallenge ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-foreground leading-relaxed select-text">
                        {currentChallenge.instruction}
                      </p>
                      {currentChallenge.context && (
                        <div className="p-3 bg-muted/30 border border-border/40 rounded-xl text-xs text-muted-foreground leading-relaxed select-text">
                          <span className="font-extrabold uppercase text-[9px] block text-muted-foreground/80 mb-1 select-none">
                            Ngữ cảnh
                          </span>
                          {currentChallenge.context}
                        </div>
                      )}
                      {currentChallenge.suggestedFormat && (
                        <p className="text-2xs text-muted-foreground">
                          💡 Gợi ý: {currentChallenge.suggestedFormat}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-rose-500">
                      <AlertCircle className="size-6 mx-auto mb-1" />
                      Không thể tải thử thách luyện tập
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Collapsible Original Memory Item Info */}
              <div className="border border-border/60 bg-muted/10 rounded-xl overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowOriginalItem(!showOriginalItem)}
                  className="w-full px-4 py-2.5 flex justify-between items-center text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer font-semibold"
                >
                  <span>Xem thông tin Sổ tay gốc ({activeCard.title})</span>
                  {showOriginalItem ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                {showOriginalItem && (
                  <div className="px-4 pb-3.5 pt-1.5 border-t border-border/30 flex flex-col gap-2 text-foreground/80">
                    <p className="leading-relaxed select-text">
                      <strong className="text-muted-foreground font-bold">
                        Giải thích:
                      </strong>{' '}
                      {activeCard.explanation}
                    </p>
                    {activeCard.sourceText && (
                      <p className="font-mono text-3xs select-text">
                        <strong className="text-muted-foreground font-bold font-sans">
                          Bản nháp gốc:
                        </strong>{' '}
                        <span className="line-through text-rose-500/90">
                          {activeCard.sourceText}
                        </span>
                      </p>
                    )}
                    {activeCard.suggestedText && (
                      <p className="font-mono text-3xs select-text">
                        <strong className="text-muted-foreground font-bold font-sans">
                          Đề xuất gốc:
                        </strong>{' '}
                        <span className="text-emerald-600 dark:text-emerald-500 font-semibold">
                          {activeCard.suggestedText}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
                  <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold font-sans">Lỗi xử lý</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* User Answer Typing Input */}
              <div className="flex flex-col gap-3">
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập câu tiếng Anh hoàn chỉnh của bạn..."
                  rows={3}
                  disabled={!!gradingResult || isGrading}
                  className="rounded-xl border border-border/80 bg-card resize-none p-3.5 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-85"
                />

                {!gradingResult ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={
                      !userAnswer.trim() || isGrading || loadingChallenge
                    }
                    className="w-full h-11 text-xs font-semibold rounded-xl"
                  >
                    {isGrading ? (
                      <>
                        <span className="animate-spin size-3.5 border-2 border-background border-t-transparent rounded-full mr-2 inline-block" />
                        AI đang chấm điểm...
                      </>
                    ) : (
                      'Kiểm tra câu trả lời'
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                    {/* Grading Feedback Container */}
                    <div
                      className={cn(
                        'border p-4.5 rounded-xl text-xs flex flex-col gap-3',
                        gradingResult.isCorrect
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-foreground'
                          : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 text-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {gradingResult.isCorrect ? (
                            <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="size-4.5 text-rose-600 dark:text-rose-400" />
                          )}
                          <span
                            className={cn(
                              'font-extrabold uppercase text-[10px] tracking-wider',
                              gradingResult.isCorrect
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            )}
                          >
                            {gradingResult.isCorrect
                              ? 'Chính xác!'
                              : 'Chưa chính xác'}
                          </span>
                        </div>
                        <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-muted/65 select-none">
                          Điểm số: {gradingResult.score}/100
                        </span>
                      </div>

                      <p className="leading-relaxed pl-0.5 select-text font-medium text-[11px]">
                        {gradingResult.feedback}
                      </p>
                    </div>

                    {/* Premium Native-like Sample Answer */}
                    <Card className="border border-primary/20 bg-primary/5 rounded-xl shadow-none">
                      <CardContent className="p-4 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary select-none">
                            Gợi ý câu chuẩn từ AI (Sample Answer)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                handleSpeak(gradingResult.sampleAnswer)
                              }
                              className="size-6 p-0 border border-border/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center rounded-md"
                            >
                              <Volume2 className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                handleCopy(gradingResult.sampleAnswer)
                              }
                              className="h-6 px-1.5 border border-border/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 rounded-md"
                            >
                              {copied ? (
                                <>
                                  <Check className="size-3 text-emerald-600" />
                                  <span className="text-[9px] text-emerald-600 font-bold">
                                    Copied!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3" />
                                  <span className="text-[9px] font-bold">
                                    Copy
                                  </span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground font-semibold leading-relaxed select-text">
                          {gradingResult.sampleAnswer}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Next Button */}
                    <Button
                      onClick={nextCard}
                      className="w-full h-11 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-2"
                    >
                      Tiếp tục ôn tập
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
