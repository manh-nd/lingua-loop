import { z } from 'zod';

export const MemoryTypeSchema = z.enum([
  'writing_mistake',
  'reading_trap',
  'reusable_phrase',
]);

export type MemoryType = z.infer<typeof MemoryTypeSchema>;

export const SourceWorkflowSchema = z.enum([
  'message',
  'explanation',
  'reading',
]);

export type SourceWorkflow = z.infer<typeof SourceWorkflowSchema>;

export const MemoryStatusSchema = z.enum(['active', 'ignored', 'mastered']);

export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;

export const LocalMemoryItemSchema = z.object({
  id: z.string(),
  memoryType: MemoryTypeSchema,
  sourceWorkflow: SourceWorkflowSchema,
  status: MemoryStatusSchema.default('active'),
  patternKey: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
      'patternKey must be lowercase_snake_case'
    ),
  patternNameVi: z.string().trim().optional(),
  category: z.string().trim().default('naturalness'),
  explanationVi: z.string().trim().min(1),
  culturalContextVi: z.string().trim().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Specific to 'writing_mistake'
  wrongText: z.string().trim().optional(),
  correctText: z.string().trim().optional(),

  // Specific to 'reusable_phrase'
  phrase: z.string().trim().optional(),
  situationVi: z.string().trim().optional(),

  // Specific to 'reading_trap'
  trapText: z.string().trim().optional(),
  wrongInterpretationVi: z.string().trim().optional(),
  correctInterpretationVi: z.string().trim().optional(),
  reviewPromptText: z.string().trim().optional(),

  // Candidate metadata (optional on memory items)
  confidence: z.number().min(0).max(1).optional(),
  source: z.enum(['observed', 'inferred']).optional(),

  // SRS Metadata
  reviewCount: z.number().nonnegative().default(0),
  correctStreak: z.number().nonnegative().default(0),
  wrongStreak: z.number().nonnegative().default(0),
  lastReviewedAt: z.string().optional(),
  nextReviewAt: z.string(),
  intervalDays: z.number().nonnegative().default(0),
  easeFactor: z.number().positive().default(2.5),
});

export type LocalMemoryItem = z.infer<typeof LocalMemoryItemSchema>;
