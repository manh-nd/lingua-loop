import { z } from 'zod';

export const LiveMistakeSchema = z.object({
  originalText: z.string().trim().min(1),
  correctedText: z.string().trim().min(1),
  explanationVi: z.string().trim().min(1),
});

export type LiveMistake = z.infer<typeof LiveMistakeSchema>;

export const LiveAlternativeSchema = z.object({
  originalText: z.string().trim().min(1),
  betterAlternative: z.string().trim().min(1),
  explanationVi: z.string().trim().min(1),
});

export type LiveAlternative = z.infer<typeof LiveAlternativeSchema>;

export const LiveAnalysisResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  grammarScore: z.number().int().min(0).max(100),
  pronunciationScore: z.number().int().min(0).max(100),
  fluencyScore: z.number().int().min(0).max(100),
  summaryVi: z.string().trim().min(1),
  mistakes: z.array(LiveMistakeSchema).default([]),
  alternatives: z.array(LiveAlternativeSchema).default([]),
  practiceMonologue: z.string().trim().optional(),
});

export type LiveAnalysisResult = z.infer<typeof LiveAnalysisResultSchema>;

export const LiveAnalysisInputSchema = z.object({
  scenarioTitle: z.string().trim().min(1),
  transcript: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().min(1),
      })
    )
    .min(1),
});

export type LiveAnalysisInput = z.infer<typeof LiveAnalysisInputSchema>;
