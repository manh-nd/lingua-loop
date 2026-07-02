import { z } from 'zod';

export const WorkspacePresetSchema = z.enum([
  'quick_message',
  'email',
  'pr_jira_comment',
  'documentation',
  'explanation_spec',
]);

export const WorkspaceInputSchema = z.object({
  text: z.string().trim().min(1),
  preset: WorkspacePresetSchema,
  tone: z.string().trim().optional(),
  audience: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  customInstructions: z.string().trim().optional(),
});

export type WorkspaceInput = z.infer<typeof WorkspaceInputSchema>;

export const WorkspaceChangeSchema = z.object({
  original: z.string().trim().min(1),
  improved: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  category: z.enum([
    'grammar',
    'tone',
    'word_choice',
    'naturalness',
    'clarity',
    'structure',
  ]),
});

export const WorkspaceCandidateSchema = z.object({
  type: z.enum(['mistake', 'reusable_phrase', 'vocabulary', 'tone_pattern']),
  patternKey: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
      'patternKey must be lowercase_snake_case'
    ),
  title: z.string().trim().min(1),
  confidence: z.number().min(0).max(1).optional(),
  payload: z.object({
    wrongText: z.string().trim().optional(),
    correctText: z.string().trim().optional(),
    phrase: z.string().trim().optional(),
    situation: z.string().trim().optional(),
    explanation: z.string().trim().min(1),
    category: z.string().trim().default('naturalness'),
    culturalContext: z.string().trim().optional(),
  }),
});

export const WorkspaceResultSchema = z.object({
  improvedText: z.string().trim().min(1),
  changes: z.array(WorkspaceChangeSchema).min(1).max(5),
  memoryCandidates: z.array(WorkspaceCandidateSchema).optional().default([]),
});

export type WorkspaceChange = z.infer<typeof WorkspaceChangeSchema>;
export type WorkspaceCandidate = z.infer<typeof WorkspaceCandidateSchema>;
export type WorkspaceResult = z.infer<typeof WorkspaceResultSchema>;
