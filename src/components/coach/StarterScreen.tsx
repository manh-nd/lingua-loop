'use client';

import {
  messageSamples,
  explanationSamples,
  MessageSample,
  ExplanationSample,
} from '@/lib/samples';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkle, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarterScreenProps {
  type: 'message' | 'explanation';
  onSelectSample: (sample: MessageSample | ExplanationSample) => void;
  className?: string;
}

export function StarterScreen({
  type,
  onSelectSample,
  className,
}: StarterScreenProps) {
  const samples = type === 'message' ? messageSamples : explanationSamples;

  return (
    <div
      className={cn(
        'w-full flex flex-col justify-center py-6 px-4 md:px-6 animate-in fade-in zoom-in-95 duration-300',
        className
      )}
    >
      <div className="flex flex-col items-center text-center max-w-lg mx-auto mb-8">
        <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-bounce duration-3000">
          <Sparkle className="size-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-2">
          {type === 'message'
            ? 'Bắt đầu tối ưu hóa tin nhắn'
            : 'Sắp xếp & Chuẩn hóa tài liệu'}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {type === 'message'
            ? 'Hãy nhập ý định của bạn ở form bên trái, hoặc chọn nhanh một tình huống mẫu công sở bên dưới để trải nghiệm ngay.'
            : 'Chọn một mẫu văn bản thô bên dưới hoặc tự viết nội dung chi tiết để AI phân tích cấu trúc, cải thiện từ vựng.'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5 justify-center">
          {type === 'message' ? (
            <>
              <MessageSquare className="size-3.5 text-primary" />
              Gợi ý tin nhắn nhanh công sở
            </>
          ) : (
            <>
              <FileText className="size-3.5 text-primary" />
              Mẫu tài liệu & Giải thích kỹ thuật
            </>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {samples.map((sample) => (
            <Card
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group border border-border/80 hover:border-primary/40 hover:bg-primary/[0.01] hover:shadow-xs active:scale-98 cursor-pointer transition-all duration-200"
            >
              <CardContent className="p-4 flex flex-col h-full justify-between gap-3 select-none">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {sample.label}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold bg-secondary text-secondary-foreground border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      {type === 'message'
                        ? (sample as MessageSample).tone
                        : (sample as ExplanationSample).purpose
                            .replace('_explanation', '')
                            .replace('explain_', '')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    &ldquo;{sample.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity self-end mt-1">
                  Thử ngay{' '}
                  <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
