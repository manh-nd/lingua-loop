import { z } from 'zod';

export const ReadingCoachInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Nội dung nhập không được để trống.')
    .max(3000, 'Nội dung nhập không được vượt quá 3000 ký tự.'),
  context: z.string().trim().optional(),
});

export type ReadingCoachInput = z.infer<typeof ReadingCoachInputSchema>;

export const ReadingCoachResultSchema = z.object({
  naturalTranslation: z
    .string()
    .trim()
    .min(1)
    .describe(
      'Bản dịch tiếng Việt tự nhiên và trôi chảy của toàn bộ nội dung.'
    ),

  summaryVi: z
    .string()
    .trim()
    .min(1)
    .describe('Tóm tắt ngắn gọn ý chính hoặc yêu cầu cốt lõi.'),

  toneAnalysis: z.object({
    toneVi: z
      .string()
      .trim()
      .min(1)
      .describe(
        'Tông giọng tổng quan (ví dụ: thân thiện, lịch sự, trực tiếp, khẩn cấp...).'
      ),
    impliedMeaningVi: z
      .string()
      .trim()
      .min(1)
      .describe('Hàm ý ngầm, sắc thái thái độ hoặc mục đích thực tế.'),
  }),

  keyPhrases: z
    .array(
      z.object({
        phrase: z.string().trim().min(1),
        meaningVi: z.string().trim().min(1),
        usageVi: z.string().trim().min(1),
      })
    )
    .max(8)
    .describe('Các cụm từ khóa quan trọng và cách dùng của chúng.'),

  misunderstandingsVi: z
    .array(
      z.object({
        trapVi: z
          .string()
          .trim()
          .min(1)
          .describe('Từ/cụm từ dễ bị dịch sai hoặc hiểu lầm word-by-word.'),
        explanationVi: z
          .string()
          .trim()
          .min(1)
          .describe('Giải thích lý do tại sao dễ hiểu lầm và nghĩa đúng.'),
      })
    )
    .max(5)
    .describe('Các bẫy dịch nghĩa hoặc điểm dễ gây hiểu lầm cho người Việt.'),

  sourceIssues: z
    .array(
      z.object({
        originalText: z
          .string()
          .trim()
          .min(1)
          .describe('Phần văn bản bị lỗi hoặc diễn đạt chưa tốt trong nguồn.'),
        issueVi: z
          .string()
          .trim()
          .min(1)
          .describe('Mô tả chi tiết lỗi sai hoặc sự mơ hồ bằng tiếng Việt.'),
        category: z
          .enum(['typo', 'grammar', 'awkward_wording', 'ambiguity'])
          .describe('Phân loại lỗi của nguồn.'),
        suggestedFix: z
          .string()
          .trim()
          .min(1)
          .describe('Đề xuất sửa lại cho đúng hoặc tự nhiên hơn.'),
      })
    )
    .max(5)
    .describe('Các lỗi chính tả, ngữ pháp, diễn đạt vụng hoặc mơ hồ từ nguồn.'),

  replySuggestions: z
    .array(
      z.object({
        text: z.string().trim().min(1).describe('Nội dung phản hồi gợi ý.'),
        contextVi: z
          .string()
          .trim()
          .min(1)
          .describe('Ngữ cảnh hoặc tình huống nên dùng phản hồi này.'),
      })
    )
    .max(3)
    .optional()
    .describe('Gợi ý phản hồi bằng tiếng Anh (nếu cần thiết).'),

  readingMemoryCandidates: z
    .array(
      z.object({
        patternKey: z
          .string()
          .trim()
          .regex(
            /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
            'patternKey must be lowercase_snake_case'
          ),
        patternNameVi: z
          .string()
          .trim()
          .min(1)
          .describe('Tên tự nhiên tiếng Việt cho mẫu/bẫy đọc hiểu'),
        memoryType: z.enum(['reading_trap', 'reusable_phrase']),
        category: z.string().trim().default('naturalness'),
        explanationVi: z.string().trim().min(1),
        culturalContextVi: z.string().trim().optional(),
        shouldSave: z.boolean().default(false),

        // For reusable_phrase
        phrase: z.string().trim().optional(),
        situationVi: z.string().trim().optional(),

        // For reading_trap
        trapText: z.string().trim().optional(),
        wrongInterpretationVi: z.string().trim().optional(),
        correctInterpretationVi: z.string().trim().optional(),
      })
    )
    .max(5)
    .default([])
    .describe(
      'Các đề xuất lưu bẫy đọc hiểu hoặc cụm từ hay từ bài đọc vào Sổ tay.'
    ),
});

export type ReadingCoachResult = z.infer<typeof ReadingCoachResultSchema>;
