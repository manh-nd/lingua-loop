import { z } from 'zod';

export const ExplanationCoachInputSchema = z.object({
  mode: z.enum(['write_from_vietnamese', 'improve_english_draft']),

  text: z.string().trim().min(1),

  context: z.string().trim().optional(),

  purpose: z
    .enum([
      'explain_issue',
      'explain_solution',
      'pr_description',
      'technical_explanation',
      'requirement_description',
      'decision_explanation',
      'general_explanation',
    ])
    .default('general_explanation'),

  tone: z
    .enum(['friendly', 'polite', 'direct', 'professional', 'casual'])
    .default('professional'),

  length: z.enum(['short', 'medium', 'detailed']).default('medium'),
});

export type ExplanationCoachInput = z.infer<typeof ExplanationCoachInputSchema>;

export const ExplanationCoachResultSchema = z.object({
  improvedText: z
    .string()
    .trim()
    .min(1)
    .describe(
      'The best improved English explanation or description the user can use immediately.'
    ),

  shortVersion: z
    .string()
    .trim()
    .min(1)
    .describe('A shorter version of the improved explanation.'),

  detailedVersion: z
    .string()
    .trim()
    .optional()
    .describe(
      'A more detailed version when useful. Omit if the explanation should stay short.'
    ),

  structureFeedback: z
    .array(
      z.object({
        issueVi: z
          .string()
          .trim()
          .min(1)
          .describe('What is unclear or weak in the original structure.'),
        suggestionVi: z
          .string()
          .trim()
          .min(1)
          .describe('How to improve the structure or flow.'),
      })
    )
    .max(5),

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
          'structure',
        ]),
      })
    )
    .max(8),

  reusablePhrases: z
    .array(
      z.object({
        phrase: z.string().trim().min(1),
        meaningVi: z.string().trim().min(1),
        situationVi: z.string().trim().min(1),
      })
    )
    .max(8),

  mistakeCandidates: z
    .array(
      z.object({
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
        category: z.enum([
          'grammar',
          'tone',
          'word_choice',
          'naturalness',
          'clarity',
          'structure',
        ]),
        confidence: z.number().min(0).max(1),
        source: z.enum(['observed', 'inferred']),
        shouldSave: z.boolean(),
      })
    )
    .max(3),
});

export type ExplanationCoachResult = z.infer<
  typeof ExplanationCoachResultSchema
>;
