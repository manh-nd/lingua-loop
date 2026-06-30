'use client';

import React from 'react';
import { LiveMode, LiveTopic, LiveScenario } from '@/core/live/live-modes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Phone, Info } from 'lucide-react';

interface LivePreCallCardProps {
  mode: LiveMode;
  topic?: LiveTopic | null;
  scenario?: LiveScenario | null;
  onStartCall: () => void;
}

export function LivePreCallCard({
  mode,
  topic,
  scenario,
  onStartCall,
}: LivePreCallCardProps) {
  const isGuided = mode.category === 'guided';

  const getGuidedInstructions = (modeId: string) => {
    switch (modeId) {
      case 'shadowing':
        return [
          'AI sẽ nói mẫu một câu tiếng Anh ngắn hoặc vừa.',
          'Hãy lắng nghe kỹ phát âm, tốc độ và ngữ điệu của AI.',
          'Nói lại chính xác từng từ ngay sau khi AI dứt câu.',
          'AI sẽ đối chiếu trực tiếp và nhắc bạn đọc lại nếu chưa đúng.',
        ];
      case 'vocab_building':
        return [
          'AI sẽ giới thiệu một từ hoặc cụm từ mới theo chủ đề.',
          'AI giải thích nghĩa tiếng Việt và đưa ra câu ví dụ.',
          'Nhiệm vụ của bạn là đặt một câu hoàn chỉnh dùng từ đó.',
          'AI sẽ phân tích câu của bạn và sửa lỗi ngữ pháp/cách dùng từ.',
        ];
      case 'read_aloud':
        return [
          'AI sẽ hiển thị một đoạn văn ngắn (3-5 câu) trên màn hình phụ đề.',
          'AI sẽ đọc mẫu trước một lượt để hướng dẫn bạn.',
          'Sau đó bạn đọc to lại toàn bộ đoạn văn đó.',
          'AI sẽ phát hiện các lỗi phát âm và khuyên dùng ngữ điệu phù hợp.',
        ];
      case 'podcast_story':
        return [
          'AI sẽ kể một câu chuyện hoặc chia sẻ quan điểm (1-2 phút) liên quan đến chủ đề.',
          'Nhiệm vụ của bạn chỉ là tập trung lắng nghe để hiểu nội dung câu chuyện.',
          'Cuối mỗi đoạn, AI sẽ hỏi bạn một câu hỏi ngắn để kiểm tra mức độ hiểu bài.',
          'Hãy tương tác và trả lời AI bằng tiếng Anh để mở khóa đoạn tiếp theo.',
        ];
      default:
        return [];
    }
  };

  const getTitle = () => {
    if (isGuided) {
      return `${mode.title} - Chủ đề: ${topic?.title || 'Tự do'}`;
    }
    return scenario?.title || mode.title;
  };

  const getDescription = () => {
    if (isGuided) {
      return topic?.descriptionVi || mode.descriptionVi;
    }
    return scenario?.descriptionVi || mode.descriptionVi;
  };

  return (
    <Card className="border border-border/80 shadow-none rounded-2xl overflow-hidden bg-card animate-in fade-in duration-200">
      <CardContent className="p-6 flex flex-col gap-5.5">
        <div>
          <h3 className="text-[17px] font-bold text-foreground">
            {getTitle()}
          </h3>
          <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed">
            {getDescription()}
          </p>
        </div>

        {/* Phrases for Roleplay OR Instructions for Guided Mode */}
        {!isGuided && scenario && scenario.phrases.length > 0 ? (
          <div className="bg-primary/[0.02] border border-primary/10 rounded-xl p-4.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-3">
              <BookOpen className="size-3.5" />
              Mẫu câu khuyên dùng trong kịch bản này:
            </span>
            <div className="flex flex-col gap-2.5">
              {scenario.phrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-foreground/80 font-medium"
                >
                  <div className="flex items-center justify-center size-4 bg-primary/10 text-primary text-[9px] font-bold rounded-full shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-normal text-muted-foreground/90 select-all">
                    {phrase}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          isGuided && (
            <div className="bg-primary/[0.02] border border-primary/10 rounded-xl p-4.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-3">
                <Info className="size-3.5" />
                Hướng dẫn luyện tập chế độ này:
              </span>
              <div className="flex flex-col gap-2.5">
                {getGuidedInstructions(mode.id).map((instruction, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-foreground/80 font-medium"
                  >
                    <div className="flex items-center justify-center size-4 bg-primary/10 text-primary text-[9px] font-bold rounded-full shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-normal text-muted-foreground/90">
                      {instruction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Start call button */}
        <div className="flex justify-center py-4">
          <Button
            onClick={onStartCall}
            className="h-12 px-8 text-xs font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-103"
          >
            <Phone className="size-4.5 fill-current" />
            Bắt đầu cuộc gọi Live Coach
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
