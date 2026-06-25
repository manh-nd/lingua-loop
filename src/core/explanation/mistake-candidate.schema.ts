import { z } from 'zod';

export const MistakeCategorySchema = z.enum([
  'grammar',
  'tone',
  'word_choice',
  'naturalness',
  'clarity',
  'structure',
]);

export const MistakeCandidateSchema = z.object({
  patternKey: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
      'patternKey must be lowercase_snake_case'
    ),
  wrongText: z.string().trim().min(1),
  correctText: z.string().trim().min(1),
  explanationVi: z.string().trim().min(1),
  category: MistakeCategorySchema,
  confidence: z.number().min(0).max(1),
  source: z.enum(['observed', 'inferred']),
  shouldSave: z.boolean(),
});

export type MistakeCandidate = z.infer<typeof MistakeCandidateSchema>;
