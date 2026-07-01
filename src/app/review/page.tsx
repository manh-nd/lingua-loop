'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  CheckCircle2,
  Inbox,
  Volume2,
  Sparkles,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { CoachShell } from '@/components/coach/CoachShell';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { AuthModal } from '@/components/auth/AuthModal';

interface LearningItem {
  id: string;
  type: string;
  originalText: string;
  correctedText: string;
  explanationVi: string | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
}

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
  const { data: session, isPending: sessionLoading } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cards, setCards] = useState<LearningItem[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const fetchDueCards = async () => {
    setLoadingCards(true);
    try {
      const res = await fetch('/api/review/due');
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
      }
    } catch (err) {
      console.error('Failed to load due cards:', err);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDueCards();
    }
  }, [session]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: currentCard.id,
          rating,
        }),
      });

      if (res.ok) {
        setReviewedCount((prev) => prev + 1);
        setIsFlipped(false);

        // Standard delay for smooth 3D unflip rotation before changing content
        setTimeout(() => {
          if (currentIndex + 1 < cards.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setIsFinished(true);
          }
        }, 150);
      }
    } catch (err) {
      console.error('Failed to submit card review:', err);
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
        headerTitle="ÔN TẬP BỘ NHỚ"
        headerIcon={<Brain className="size-4 text-primary animate-pulse" />}
        sidebarTitle="Đăng nhập để bắt đầu"
        sidebarDescription="Lưu giữ lỗi ngữ pháp và từ vựng thông dụng từ các buổi hội thoại trực tiếp để ôn tập khoa học."
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
                Hệ thống ôn tập ngắt quãng (Spaced Repetition) yêu cầu tài khoản
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
      headerTitle="ÔN TẬP BỘ NHỚ (REVIEW)"
      headerIcon={<Brain className="size-4 text-primary animate-pulse" />}
      sidebarTitle="Spaced Repetition"
      sidebarDescription="Hệ thống thẻ ôn tập ngắt quãng (SM-2) tự động lưu trữ các câu bạn nói chưa chuẩn để kiểm tra định kỳ."
      showReset={cards.length > 0 && !isFinished}
      onReset={fetchDueCards}
      sidebarContent={
        <div className="flex flex-col gap-4">
          {cards.length > 0 && !isFinished && (
            <Card className="border border-border/85 bg-white/20 dark:bg-black/10 shadow-none rounded-xl p-4.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Tiến trình phiên
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
                <span>Hoàn thành: {reviewedCount}</span>
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
                Đang tải thẻ ôn tập...
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
                  Không còn thẻ ôn tập nào đến hạn hôm nay. Hãy gọi điện trực
                  tiếp để tích lũy thêm từ vựng mới nhé.
                </p>
              </div>
              <Button
                onClick={fetchDueCards}
                variant="outline"
                className="w-full"
              >
                Tải lại trang review
              </Button>
            </div>
          ) : isFinished ? (
            <div className="py-12 text-center max-w-sm mx-auto flex flex-col items-center gap-5">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
                <Sparkles className="size-10 animate-bounce" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Hoàn thành phiên ôn tập!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bạn đã xem và chấm điểm xong tất cả các thẻ due trong hôm nay.
                  Hẹn gặp lại bạn ở chu kỳ tiếp theo!
                </p>
              </div>
              <Button onClick={fetchDueCards} className="w-full">
                Luyện tập tiếp
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* 3D Flip Card */}
              <div
                className="perspective-1000 w-full h-[280px] cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={cn(
                    'relative w-full h-full duration-500 transform-style-3d border rounded-2xl shadow-lg bg-card text-card-foreground',
                    isFlipped && 'rotate-y-180'
                  )}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between backface-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
                      {cards[currentIndex].type === 'grammar'
                        ? 'Lỗi Ngữ Pháp'
                        : 'Từ Vựng / Phát Âm'}
                    </span>
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground text-xs mb-2">
                        {cards[currentIndex].type === 'grammar'
                          ? 'Bản nháp của bạn:'
                          : 'Khái niệm / Ý tiếng Việt:'}
                      </p>
                      <p className="text-lg font-medium leading-relaxed select-text px-4">
                        {cards[currentIndex].originalText}
                      </p>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground animate-pulse">
                      Bấm vào thẻ để xem câu đúng
                    </p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between backface-hidden rotate-y-180 bg-slate-50 dark:bg-zinc-900 border rounded-2xl">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Câu Chuẩn Native-like
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(cards[currentIndex].correctedText);
                        }}
                      >
                        <Volume2 className="size-4" />
                      </Button>
                    </div>

                    <div className="text-center py-4 flex-1 flex flex-col justify-center gap-3">
                      <p className="text-base font-semibold leading-relaxed text-emerald-600 dark:text-emerald-400 select-text px-2">
                        {cards[currentIndex].correctedText}
                      </p>
                      {cards[currentIndex].explanationVi && (
                        <p className="text-xs text-muted-foreground leading-normal px-2 select-text max-h-[80px] overflow-y-auto">
                          {cards[currentIndex].explanationVi}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground">
                      Bấm vào thẻ để lật lại
                    </p>
                  </div>
                </div>
              </div>

              {/* SM-2 Assessment Buttons */}
              <div className="flex flex-col gap-3">
                {!isFlipped ? (
                  <Button
                    onClick={() => setIsFlipped(true)}
                    className="w-full h-11 text-xs font-semibold rounded-xl"
                  >
                    Xem đáp án (Lật thẻ)
                  </Button>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(1);
                      }}
                      className="h-11 text-2xs font-bold rounded-xl flex flex-col justify-center items-center gap-0.5"
                    >
                      <span>Again</span>
                      <span className="text-[8px] font-normal opacity-80">
                        Chưa thuộc
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(2);
                      }}
                      className="h-11 text-2xs font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/10 rounded-xl flex flex-col justify-center items-center gap-0.5"
                    >
                      <span>Hard</span>
                      <span className="text-[8px] font-normal opacity-85">
                        Tạm ổn
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(3);
                      }}
                      className="h-11 text-2xs font-bold border-blue-500/30 text-blue-600 hover:bg-blue-500/10 rounded-xl flex flex-col justify-center items-center gap-0.5"
                    >
                      <span>Good</span>
                      <span className="text-[8px] font-normal opacity-85">
                        Nhớ tốt
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(4);
                      }}
                      className="h-11 text-2xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 rounded-xl flex flex-col justify-center items-center gap-0.5"
                    >
                      <span>Easy</span>
                      <span className="text-[8px] font-normal opacity-85">
                        Thuộc lòng
                      </span>
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
