import { z } from 'zod';
import { MistakeCandidateSchema } from '../explanation/mistake-candidate.schema';

export const MessageToneSchema = z.enum([
  'friendly',
  'polite',
  'direct',
  'professional',
  'casual',
]);

export const MessageModeSchema = z.enum([
  'write_from_vietnamese',
  'improve_english_draft',
]);

export const MessageCoachInputSchema = z.object({
  mode: MessageModeSchema,
  text: z.string().trim().min(1),
  context: z.string().trim().optional(),
  tone: MessageToneSchema.default('professional'),
});

export type MessageCoachInput = z.infer<typeof MessageCoachInputSchema>;

export const MessageCoachResultSchema = z.object({
  recommendedMessage: z
    .string()
    .trim()
    .min(1)
    .describe(
      'The best natural English message the user can send immediately. Prefer workplace-natural phrasing over literal grammar correction.'
    ),

  alternatives: z
    .array(
      z.object({
        label: z.enum([
          'more_polite',
          'more_direct',
          'more_friendly',
          'more_professional',
        ]),
        text: z.string().trim().min(1),
        whenToUseVi: z.string().trim().min(1),
      })
    )
    .max(3),

  explanationVi: z.string().trim().min(1),

  corrections: z
    .array(
      z.object({
        original: z.string().trim().min(1),
        improved: z.string().trim().min(1),
        reasonVi: z.string().trim().min(1),
        category: z.enum([
          'grammar',
          'tone',
          'word_choice',
          'naturalness',
          'clarity',
        ]),
      })
    )
    .max(5),

  reusablePhrases: z
    .array(
      z.object({
        phrase: z.string().trim().min(1),
        meaningVi: z.string().trim().min(1),
        situationVi: z.string().trim().min(1),
      })
    )
    .max(5),

  mistakeCandidates: z.array(MistakeCandidateSchema),
});

export type MessageCoachResult = z.infer<typeof MessageCoachResultSchema>;
