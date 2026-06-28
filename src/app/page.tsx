'use client';

import { useState, useEffect } from 'react';
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
import {
  MessageSquare,
  FileText,
  ArrowRight,
  BookOpen,
  Brain,
  Sparkle,
  TrendingUp,
  FileCheck,
  Activity,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type DemoTab = 'pr-review' | 'late-task' | 'follow-up';

type DemoData = {
  label: string;
  vietnamese: string;
  english: string;
  highlights: React.ReactNode;
  explanation: string;
};

const demoTabsData: Record<DemoTab, DemoData> = {
  'pr-review': {
    label: 'Nhờ review PR',
    vietnamese:
      'Nhờ đồng nghiệp review giúp cái PR này nhé, mình đã sửa hết các comment hôm qua rồi.',
    english:
      'Could you please take a look at this PR? I have addressed all the comments from yesterday. Thanks!',
    highlights: (
      <>
        Could you please{' '}
        <span className="text-primary font-semibold underline decoration-primary/40 bg-primary/5 px-1 py-0.5 rounded">
          take a look at this PR
        </span>
        ? I have{' '}
        <span className="text-pink-500 font-semibold underline decoration-pink-500/40 bg-pink-500/5 px-1 py-0.5 rounded">
          addressed all the comments
        </span>{' '}
        from yesterday. Thanks!
      </>
    ),
    explanation:
      'Thay vì dùng từ quá bình dân như "check my PR", sử dụng "take a look at this PR" và "addressed all the comments" giúp lời nói tự nhiên và lịch sự hơn trong môi trường công sở.',
  },
  'late-task': {
    label: 'Báo cáo task trễ',
    vietnamese:
      'Chào anh, em gửi báo cáo tiến độ tuần này. Có một số task bị chậm do phát sinh lỗi.',
    english:
      'Hi team, here is this week’s progress report. A few tasks are slightly delayed due to unexpected bugs.',
    highlights: (
      <>
        Hi team, here is{' '}
        <span className="text-primary font-semibold underline decoration-primary/40 bg-primary/5 px-1 py-0.5 rounded">
          this week’s progress report
        </span>
        . A few tasks are{' '}
        <span className="text-pink-500 font-semibold underline decoration-pink-500/40 bg-pink-500/5 px-1 py-0.5 rounded">
          slightly delayed
        </span>{' '}
        due to{' '}
        <span className="text-amber-500 font-semibold underline decoration-amber-500/40 bg-amber-500/5 px-1 py-0.5 rounded">
          unexpected bugs
        </span>
        .
      </>
    ),
    explanation:
      'Diễn đạt giảm nhẹ "slightly delayed" (hơi chậm trễ) thay vì "late" thô thiển, kết hợp với cụm từ kỹ thuật chuẩn xác "unexpected bugs" giúp giữ tác phong chuyên nghiệp.',
  },
  'follow-up': {
    label: 'Gửi đối tác',
    vietnamese:
      'Nhắc khéo bên đối tác gửi lại tài liệu API mà họ hẹn gửi từ đầu tuần.',
    english:
      'Just following up on the API documentation you mentioned earlier this week. Could you please send it over when you have a moment?',
    highlights: (
      <>
        Just{' '}
        <span className="text-primary font-semibold underline decoration-primary/40 bg-primary/5 px-1 py-0.5 rounded">
          following up on the API documentation
        </span>{' '}
        you mentioned earlier this week. Could you please{' '}
        <span className="text-pink-500 font-semibold underline decoration-pink-500/40 bg-pink-500/5 px-1 py-0.5 rounded">
          send it over
        </span>{' '}
        when you have{' '}
        <span className="text-amber-500 font-semibold underline decoration-amber-500/40 bg-amber-500/5 px-1 py-0.5 rounded">
          a moment
        </span>
        ?
      </>
    ),
    explanation:
      'Sử dụng cấu trúc giảm nhẹ "Just following up on..." giúp lời nhắc nhở đối tác nhẹ nhàng, không mang tính hối thúc nặng nề nhưng vẫn rõ ràng.',
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<DemoTab>('pr-review');
  const [streamedInput, setStreamedInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Stream text effect on tab change
  useEffect(() => {
    const rawText = demoTabsData[activeTab].vietnamese;
    let interval: NodeJS.Timeout;

    const timer = setTimeout(() => {
      let currentText = '';
      let index = 0;
      setStreamedInput('');
      setIsStreaming(true);

      interval = setInterval(() => {
        if (index < rawText.length) {
          currentText += rawText[index];
          setStreamedInput(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 15);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:32px_32px] -z-20 pointer-events-none" />
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Skip to content
      </a>

      {/* Ambient background glow effects */}
      <div className="absolute top-[-15%] left-[-15%] size-[600px] bg-gradient-to-tr from-primary/10 via-pink-500/5 to-transparent rounded-full blur-3xl -z-10 animate-float-1" />
      <div className="absolute bottom-[-15%] right-[-15%] size-[600px] bg-gradient-to-br from-amber-500/5 via-indigo-500/10 to-transparent rounded-full blur-3xl -z-10 animate-float-2" />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 border border-primary/20">
            <Sparkle className="size-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-base tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            LINGUA LOOP
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
            v0.1.0-alpha
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Content */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-14 justify-center"
      >
        <section className="max-w-2xl flex flex-col gap-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary w-fit animate-pulse">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
            </span>
            Học tiếng Anh theo vòng lặp, không quên lỗi cũ
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-none">
            Workplace English,{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-pink-500 bg-clip-text text-transparent">
              refined.
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
            Học tiếng Anh công sở theo vòng lặp: Biến nháp thô thành thông điệp
            tự nhiên, ghi nhớ lỗi diễn đạt để không bao giờ lặp lại lỗi cũ.
          </p>
        </section>

        {/* Visual Signature: Live Before/After Message Transformer Slider */}
        <section className="w-full flex flex-col gap-4 p-5 rounded-2xl border border-border/60 bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkle className="size-3.5 text-primary animate-pulse" />
                Live Demo: Message Transformation
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Chọn tình huống bên phải để chạy mô phỏng dịch thông minh.
              </p>
            </div>
            {/* Demo Tabs Selection */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(demoTabsData) as DemoTab[]).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    activeTab === tabKey
                      ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  {demoTabsData[tabKey].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            {/* Left Panel: Vietnamese Draft */}
            <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-background/50 border border-border/40 min-h-36 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5 mb-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                  Nháp thô tiếng Việt (Your Draft)
                </span>
                <div className="flex gap-1.5">
                  <span className="size-1.5 rounded-full bg-red-400/50" />
                  <span className="size-1.5 rounded-full bg-yellow-400/50" />
                  <span className="size-1.5 rounded-full bg-emerald-400/50" />
                </div>
              </div>
              <p className="text-xs font-medium leading-relaxed text-foreground select-none">
                {streamedInput}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-primary animate-pulse" />
                )}
              </p>
            </div>

            {/* Right Panel: Coached Result */}
            <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-gradient-to-br from-primary/[0.03] to-indigo-500/[0.01] border border-primary/25 shadow-sm relative overflow-hidden min-h-36">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-indigo-500" />
              <div className="flex items-center justify-between border-b border-primary/10 pb-1.5 mb-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-primary flex items-center gap-1">
                  <FileCheck className="size-3 text-primary" />
                  Gợi ý khuyên dùng (Coached)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                    Polite
                  </span>
                  <div className="flex gap-1.5">
                    <span className="size-1.5 rounded-full bg-red-400/50" />
                    <span className="size-1.5 rounded-full bg-yellow-400/50" />
                    <span className="size-1.5 rounded-full bg-emerald-400/50" />
                  </div>
                </div>
              </div>
              {/* Inset text container */}
              <div className="text-xs select-none leading-relaxed text-foreground p-3.5 bg-white/70 dark:bg-black/50 border border-border/40 rounded-lg shadow-inner flex-1 flex flex-col justify-center">
                <p className="font-sans font-medium text-pretty leading-relaxed text-sm">
                  {demoTabsData[activeTab].highlights}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 text-[11px] text-muted-foreground flex gap-2 border border-primary/10 items-start">
            <span className="text-primary font-bold shrink-0 whitespace-nowrap">
              💡 Phân tích từ Coach:
            </span>
            <p className="leading-relaxed">
              {demoTabsData[activeTab].explanation}
            </p>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Message Coach */}
          <Card className="flex flex-col h-full border border-border/60 bg-white/40 dark:bg-black/30 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-350 rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pb-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit border border-primary/20">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold">
                Email & Message Coach
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/80">
                Turn workplace intentions into natural English messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tối ưu hóa cho các hội thoại ngắn trên Slack, Microsoft Teams,
                hoặc Email với tone giọng phù hợp nhất.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Hỗ trợ viết trực tiếp từ ý định tiếng Việt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    Đề xuất nhiều tone giọng (Friendly, Polite, Direct)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Giải thích chi tiết lỗi sai và cụm từ hay</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                id="btn-message-coach"
                render={<Link href="/message" />}
                nativeButton={false}
                className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] py-4.5 rounded-lg cursor-pointer"
              >
                Mở Email & Message Coach
                <ArrowRight data-icon="inline-end" className="size-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Explanation Coach */}
          <Card className="flex flex-col h-full border border-border/60 bg-white/40 dark:bg-black/30 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-350 rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pb-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit border border-primary/20">
                <FileText className="size-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold">
                Document Coach
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/80">
                Polish longer workplace writing for clarity and structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tối ưu hóa cho Pull Requests, tài liệu kỹ thuật (Design Docs),
                hoặc mô tả lỗi/yêu cầu trên Jira.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Cân bằng tính kỹ thuật và tính dễ hiểu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    Bảo toàn cấu trúc lập luận và thuật ngữ chuyên môn
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    Đề xuất cấu trúc văn bản chuẩn mực và chuyên nghiệp
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                id="btn-explanation-coach"
                render={<Link href="/explanation" />}
                nativeButton={false}
                className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] py-4.5 rounded-lg cursor-pointer"
              >
                Mở Document Coach
                <ArrowRight data-icon="inline-end" className="size-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Future Learning Loop Timeline: Frosted Bento Cards */}
        <section className="flex flex-col gap-6 w-full pt-8 border-t border-border/20">
          <div className="flex flex-col gap-1.5 text-left">
            <h2 className="text-sm font-bold tracking-wider uppercase text-primary">
              Core Learning Loop Features
            </h2>
            <p className="text-xs text-muted-foreground text-pretty">
              Các tính năng cốt lõi giúp hoàn thiện vòng lặp học tập khép kín,
              từ lưu giữ đến ôn tập và sửa lỗi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Bento Card 1: Reading Coach */}
            <Link
              href="/reading"
              className="border border-border/50 bg-white/20 dark:bg-black/15 backdrop-blur-md p-5 rounded-xl flex flex-col gap-3.5 hover:border-primary/40 hover:bg-white/30 dark:hover:bg-black/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-2 border-b border-border/30 pb-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    Reading Coach
                  </h3>
                </div>
                <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground flex-1">
                Hiểu ngữ cảnh, dịch sát nghĩa thành ngữ, từ lóng tiếng Anh và
                phân tích hàm ý/tông giọng của người nói.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold mt-auto px-2 py-0.5 rounded-full bg-emerald-500/10 w-fit border border-emerald-500/20 flex items-center gap-1">
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MỞ NGAY (READY)
              </span>
            </Link>

            {/* Bento Card 2: Live Speak Coach */}
            <Link
              href="/live"
              className="border border-border/50 bg-white/20 dark:bg-black/15 backdrop-blur-md p-5 rounded-xl flex flex-col gap-3.5 hover:border-primary/40 hover:bg-white/30 dark:hover:bg-black/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-2 border-b border-border/30 pb-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  <h3 className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    Live Speak Coach
                  </h3>
                </div>
                <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground flex-1">
                Luyện nói phản xạ thời gian thực với AI qua kịch bản công sở,
                đàm phán và phỏng vấn thử.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold mt-auto px-2 py-0.5 rounded-full bg-emerald-500/10 w-fit border border-emerald-500/20 flex items-center gap-1">
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MỞ NGAY (READY)
              </span>
            </Link>

            {/* Bento Card 3: Memory Candidates */}
            <Link
              href="/memory"
              className="border border-border/50 bg-white/20 dark:bg-black/15 backdrop-blur-md p-5 rounded-xl flex flex-col gap-3.5 hover:border-primary/40 hover:bg-white/30 dark:hover:bg-black/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-2 border-b border-border/30 pb-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  <h3 className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    Sổ tay lỗi sai (Memory)
                  </h3>
                </div>
                <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground flex-1">
                Lưu trữ và quản lý các lỗi sai từ Email & Message Coach và
                Document Coach để ôn tập theo vòng lặp, không bao giờ lặp lại
                lỗi cũ.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold mt-auto px-2 py-0.5 rounded-full bg-emerald-500/10 w-fit border border-emerald-500/20 flex items-center gap-1">
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MỞ NGAY (READY)
              </span>
            </Link>

            {/* Bento Card 4: Spaced Review */}
            <Link
              href="/review"
              className="border border-border/50 bg-white/20 dark:bg-black/15 backdrop-blur-md p-5 rounded-xl flex flex-col gap-3.5 hover:border-primary/40 hover:bg-white/30 dark:hover:bg-black/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-2 border-b border-border/30 pb-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h3 className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    Spaced Review
                  </h3>
                </div>
                <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground flex-1">
                Nhắc nhở ôn tập thông minh dựa trên vòng lặp Spaced Repetition
                từ chính các lỗi sai bạn đã phạm phải trong công việc hàng ngày,
                đảm bảo không quên lỗi cũ.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold mt-auto px-2 py-0.5 rounded-full bg-emerald-500/10 w-fit border border-emerald-500/20 flex items-center gap-1">
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MỞ NGAY (READY)
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-8 border-t border-border/20 text-center text-[10px] text-muted-foreground">
        <p>
          © 2026 Lingua Loop. English learning and writing assistant tailored
          for Vietnamese professionals.
        </p>
      </footer>
    </div>
  );
}
