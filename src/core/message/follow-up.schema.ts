import { z } from 'zod';

export const FollowUpChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().trim().min(1),
});

export type FollowUpChatMessage = z.infer<typeof FollowUpChatMessageSchema>;

export const FollowUpInputSchema = z.object({
  originalInput: z.string().trim().min(1),
  recommendedDraft: z.string().trim().min(1),
  userQuestion: z.string().trim().min(1),
  history: z.array(FollowUpChatMessageSchema).default([]),
});

export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;

export const FollowUpResultSchema = z.object({
  answerVi: z.string().trim().min(1),
});

export type FollowUpResult = z.infer<typeof FollowUpResultSchema>;
