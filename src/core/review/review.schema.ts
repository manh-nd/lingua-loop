import { z } from 'zod';

export const ReviewGradeResultSchema = z.object({
  isCorrect: z
    .boolean()
    .describe(
      'true nếu câu trả lời của người dùng diễn đạt đúng ý nghĩa chính và chấp nhận được trong văn cảnh công sở, ngay cả khi có lỗi chính tả nhỏ không quan trọng; false nếu hiểu sai ý hoặc sai ngữ pháp/sắc thái nghiêm trọng.'
    ),

  score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Điểm số chấm theo thang điểm 100 dựa trên độ chính xác và tự nhiên.'
    ),

  feedbackVi: z
    .string()
    .trim()
    .min(1)
    .describe(
      'Lời giải thích bằng tiếng Việt về những điểm tốt, lỗi sai hoặc những chỗ cần cải thiện trong câu trả lời.'
    ),

  suggestedCorrection: z
    .string()
    .trim()
    .optional()
    .describe(
      'Đề xuất cách viết tiếng Anh chuẩn xác, tự nhiên nhất cho người dùng tham khảo.'
    ),

  culturalContextVi: z
    .string()
    .trim()
    .optional()
    .describe(
      'Giải thích thêm về ngữ cảnh văn hóa, sắc thái hoặc phong cách giao tiếp doanh nghiệp (Đông-Tây) liên quan để người dùng nâng cao tư duy.'
    ),

  nextChallengePrompt: z
    .string()
    .trim()
    .optional()
    .describe(
      'Một câu tiếng Anh mới hoặc tình huống mới tương tự câu cũ để thử thách người dùng trong lần ôn tập tiếp theo (giúp tránh việc học vẹt). Ví dụ nếu câu cũ là "Please check my PR", câu mới có thể là "Please review my report". Bắt buộc đối với writing_mistake và reusable_phrase.'
    ),
});

export type ReviewGradeResult = z.infer<typeof ReviewGradeResultSchema>;
