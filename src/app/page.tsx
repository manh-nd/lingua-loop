import Link from 'next/link';
import type { Metadata } from 'next';
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
  ChatText,
  FileText,
  ArrowRight,
  BookOpen,
  Brain,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Lingua Loop - Workplace English Coach',
  description:
    'An English learning and writing assistant for Vietnamese professionals.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 border border-primary/20">
            <Sparkle className="size-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-base tracking-tight">
            LINGUA LOOP
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border text-[10px] font-medium">
            v0.1.0-alpha
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-12 justify-center">
        <section className="max-w-2xl flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Vietnamese Professional Coach
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Workplace English, refined.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Biến nháp tiếng Anh công sở thô hoặc ý định tiếng Việt thành các
            thông điệp chuẩn xác, tự nhiên. Ghi nhớ các lỗi diễn đạt để không
            lặp lại.
          </p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Message Coach */}
          <Card className="flex flex-col h-full border border-border bg-card">
            <CardHeader className="flex flex-col gap-2">
              <div className="p-3 rounded bg-primary/5 w-fit border border-border/50">
                <ChatText className="size-6 text-primary" />
              </div>
              <CardTitle>Message Coach</CardTitle>
              <CardDescription>
                Turn workplace intentions into natural English messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tối ưu hóa cho các hội thoại ngắn trên Slack, Microsoft Teams,
                hoặc Email với tone giọng phù hợp nhất.
              </p>
              <ul className="flex flex-col gap-2 text-xs font-mono text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Hỗ trợ dịch trực tiếp từ nháp tiếng Việt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    Đề xuất nhiều tone giọng (Formal, Friendly, Concise)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Giải thích chi tiết lỗi sai và từ vựng</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                id="btn-message-coach"
                render={<Link href="/message" />}
                nativeButton={false}
                className="w-full"
              >
                Mở Message Coach
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Explanation Coach */}
          <Card className="flex flex-col h-full border border-border bg-card">
            <CardHeader className="flex flex-col gap-2">
              <div className="p-3 rounded bg-primary/5 w-fit border border-border/50">
                <FileText className="size-6 text-primary" />
              </div>
              <CardTitle>Explanation Coach</CardTitle>
              <CardDescription>
                Polish longer workplace writing for clarity and structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tối ưu hóa cho Pull Requests, tài liệu kỹ thuật (Design Docs),
                hoặc mô tả lỗi/yêu cầu trên Jira.
              </p>
              <ul className="flex flex-col gap-2 text-xs font-mono text-foreground/80">
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
            <CardFooter>
              <Button
                id="btn-explanation-coach"
                render={<Link href="/explanation" />}
                nativeButton={false}
                className="w-full"
              >
                Mở Explanation Coach
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Future Learning Loop Timeline / Roadmap */}
        <section className="flex flex-col gap-6 w-full pt-6 border-t border-border/20">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
              Learning Loop Roadmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Các tính năng đang phát triển để tối ưu hóa lộ trình ghi nhớ tiếng
              Anh lâu dài.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border/60 bg-muted/10 p-4 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-bold font-heading">
                  Reading Coach
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Hiểu ngữ cảnh, dịch sát nghĩa thành ngữ, từ lóng tiếng Anh và
                phân tích hàm ý/tông giọng của người nói.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-primary/70 font-semibold mt-auto">
                MVP v1
              </span>
            </div>

            <div className="border border-border/60 bg-muted/10 p-4 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-bold font-heading">
                  Memory Candidates
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Tự động phát hiện lỗi sai tái diễn, gợi ý đưa vào bộ nhớ cá nhân
                thay vì ghi nhớ thủ công rời rạc.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-primary/70 font-semibold mt-auto">
                MVP v1
              </span>
            </div>

            <div className="border border-border/60 bg-muted/10 p-4 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TrendUp className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-bold font-heading">
                  Spaced Review
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Nhắc nhở ôn tập thông minh dựa trên chính các lỗi sai cá nhân đã
                phạm trong quá trình làm việc hàng ngày.
              </p>
              <span className="text-[9px] uppercase tracking-wider text-primary/70 font-semibold mt-auto">
                LATER
              </span>
            </div>
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
