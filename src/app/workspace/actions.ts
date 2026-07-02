'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { correctionSessions, memoryCandidates, memoryItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { runWorkspaceCorrection } from '@/core/workspace/workspace.workflow';
import {
  WorkspaceInput,
  WorkspaceChange,
  WorkspaceCandidate,
} from '@/core/workspace/workspace.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

// Define strict interfaces for Memory Payloads and UI States
export interface MemoryItemPayload {
  wrongText?: string;
  correctText?: string;
  phrase?: string;
  situation?: string;
  explanation: string;
  category: string;
  culturalContext?: string;
  title?: string;
}

export interface UIMemoryCandidate {
  id: string;
  userId: string;
  type: 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern';
  status: 'pending' | 'saved' | 'ignored';
  sourceSessionId: string | null;
  title: string;
  explanation: string;
  sourceText: string | null;
  suggestedText: string | null;
  confidence: number | null;
  payload: MemoryItemPayload;
  createdAt: Date;
  updatedAt: Date;
  patternKey?: string;
}

export interface UIMemoryItem {
  id: string;
  userId: string;
  type: 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern';
  status: 'active' | 'archived';
  sourceCandidateId: string | null;
  sourceSessionId: string | null;
  title: string;
  explanation: string;
  sourceText: string | null;
  suggestedText: string | null;
  payload: MemoryItemPayload;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  correctStreak: number;
  wrongStreak: number;
  lastPracticedAt: Date | null;
  nextPracticeAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitCorrectionResult {
  sessionId: string;
  improvedText: string;
  changes: WorkspaceChange[];
  memoryCandidates: UIMemoryCandidate[];
}

export interface DashboardStats {
  streak: number;
  totalMistakes: number;
  dueCards: number;
}

export async function submitWorkspaceCorrection(
  input: WorkspaceInput
): Promise<SubmitCorrectionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Bạn cần đăng nhập để thực hiện sửa lỗi.');
  }

  const userId = session.user.id;

  // 1. Run Gemini correction
  let result;
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    result = await runWorkspaceCorrection(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }

  // 2. Save both CorrectionSession and MemoryCandidates in a single transaction
  try {
    const sessionId = crypto.randomUUID();
    const returnedCandidates: UIMemoryCandidate[] = [];

    await db.transaction(async (tx) => {
      // Create session
      await tx.insert(correctionSessions).values({
        id: sessionId,
        userId,
        originalText: input.text,
        improvedText: result.improvedText,
        changes: result.changes,
        preset: input.preset,
        context: {
          tone: input.tone,
          audience: input.audience,
          goal: input.goal,
          customInstructions: input.customInstructions,
        },
      });

      // Create candidates with explicit core columns
      if (result.memoryCandidates && result.memoryCandidates.length > 0) {
        for (const cand of result.memoryCandidates) {
          const candidateId = crypto.randomUUID();

          // Map properties to core columns
          const title = cand.title;
          const explanation = cand.payload.explanation;
          const sourceText =
            cand.payload.wrongText || cand.payload.phrase || null;
          const suggestedText = cand.payload.correctText || null;
          const confidence =
            cand.confidence !== undefined ? cand.confidence : null;

          await tx.insert(memoryCandidates).values({
            id: candidateId,
            userId,
            type: cand.type,
            status: 'pending',
            sourceSessionId: sessionId,
            title,
            explanation,
            sourceText,
            suggestedText,
            confidence,
            payload: cand.payload,
          });

          returnedCandidates.push({
            id: candidateId,
            userId,
            type: cand.type,
            status: 'pending',
            sourceSessionId: sessionId,
            title,
            explanation,
            sourceText,
            suggestedText,
            confidence,
            payload: cand.payload as unknown as MemoryItemPayload,
            createdAt: new Date(),
            updatedAt: new Date(),
            patternKey: cand.patternKey,
          });
        }
      }
    });

    return {
      sessionId,
      improvedText: result.improvedText,
      changes: result.changes,
      memoryCandidates: returnedCandidates,
    };
  } catch (dbError) {
    console.error('Failed to save correction to database:', dbError);
    throw new Error(
      'Không thể lưu kết quả sửa lỗi vào cơ sở dữ liệu. Vui lòng thử lại.'
    );
  }
}

export async function updateCandidateStatus(
  candidateId: string,
  status: 'saved' | 'ignored',
  editedPayload?: Partial<MemoryItemPayload>
): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  try {
    if (status === 'ignored') {
      await db
        .update(memoryCandidates)
        .set({ status: 'ignored', updatedAt: new Date() })
        .where(
          and(
            eq(memoryCandidates.id, candidateId),
            eq(memoryCandidates.userId, userId)
          )
        );
      return { success: true };
    }

    // Wrap status='saved' and MemoryItem creation in an atomic transaction
    await db.transaction(async (tx) => {
      const [cand] = await tx
        .select()
        .from(memoryCandidates)
        .where(
          and(
            eq(memoryCandidates.id, candidateId),
            eq(memoryCandidates.userId, userId)
          )
        )
        .limit(1);

      if (!cand) {
        throw new Error(
          'Gợi ý không tồn tại hoặc không thuộc quyền sở hữu của bạn.'
        );
      }

      // Update candidate status
      await tx
        .update(memoryCandidates)
        .set({ status: 'saved', updatedAt: new Date() })
        .where(eq(memoryCandidates.id, candidateId));

      // Sync payload and core columns if edits are provided
      const finalPayload = (
        editedPayload
          ? { ...(cand.payload as Record<string, any>), ...editedPayload }
          : cand.payload
      ) as MemoryItemPayload;

      const title = editedPayload?.title || cand.title;
      const explanation = editedPayload?.explanation || cand.explanation;
      const sourceText =
        editedPayload?.wrongText || editedPayload?.phrase || cand.sourceText;
      const suggestedText = editedPayload?.correctText || cand.suggestedText;

      // Insert new memory item with explicit core columns
      await tx.insert(memoryItems).values({
        id: crypto.randomUUID(),
        userId,
        type: cand.type,
        status: 'active',
        sourceCandidateId: cand.id,
        sourceSessionId: cand.sourceSessionId,
        title,
        explanation,
        sourceText,
        suggestedText,
        payload: finalPayload,
        interval: 1,
        easeFactor: 2.5,
        reviewCount: 0,
        correctStreak: 0,
        wrongStreak: 0,
        nextPracticeAt: new Date(),
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update candidate status:', error);
    throw new Error(error.message || 'Lỗi khi cập nhật trạng thái gợi ý.');
  }
}

export async function deleteMemoryItem(
  itemId: string
): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await db
      .delete(memoryItems)
      .where(
        and(eq(memoryItems.id, itemId), eq(memoryItems.userId, session.user.id))
      );
    return { success: true };
  } catch (error) {
    console.error('Failed to delete memory item:', error);
    throw new Error('Lỗi khi xóa ghi nhớ.');
  }
}

export async function updateMemoryItem(
  itemId: string,
  updates: { payload: MemoryItemPayload; status?: 'active' | 'archived' }
): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    // Synchronize core columns when the payload is modified
    const payload = updates.payload;
    const title = payload.title || '';
    const explanation = payload.explanation || '';
    const sourceText = payload.wrongText || payload.phrase || null;
    const suggestedText = payload.correctText || null;

    const updateObj: any = {
      payload,
      title,
      explanation,
      sourceText,
      suggestedText,
      updatedAt: new Date(),
    };
    if (updates.status) {
      updateObj.status = updates.status;
    }

    await db
      .update(memoryItems)
      .set(updateObj)
      .where(
        and(eq(memoryItems.id, itemId), eq(memoryItems.userId, session.user.id))
      );
    return { success: true };
  } catch (error) {
    console.error('Failed to update memory item:', error);
    throw new Error('Lỗi khi cập nhật ghi nhớ.');
  }
}

export async function fetchMemoryData(): Promise<{
  items: UIMemoryItem[];
  candidates: UIMemoryCandidate[];
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Bạn cần đăng nhập để xem sổ tay.');
  }

  const userId = session.user.id;

  try {
    const items = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.userId, userId))
      .orderBy(memoryItems.createdAt);

    const candidates = await db
      .select()
      .from(memoryCandidates)
      .where(
        and(
          eq(memoryCandidates.userId, userId),
          eq(memoryCandidates.status, 'pending')
        )
      )
      .orderBy(memoryCandidates.createdAt);

    return {
      items: items as unknown as UIMemoryItem[],
      candidates: candidates as unknown as UIMemoryCandidate[],
    };
  } catch (error) {
    console.error('Failed to fetch memory data:', error);
    throw new Error('Không thể tải dữ liệu từ cơ sở dữ liệu.');
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { streak: 0, totalMistakes: 0, dueCards: 0 };
  }

  const userId = session.user.id;

  try {
    const activeItems = await db
      .select()
      .from(memoryItems)
      .where(
        and(eq(memoryItems.userId, userId), eq(memoryItems.status, 'active'))
      );

    const now = new Date();
    const dueItems = activeItems.filter((item) => {
      return !item.nextPracticeAt || item.nextPracticeAt <= now;
    });

    return {
      streak: 5, // Mock streak count for dashboard
      totalMistakes: activeItems.length,
      dueCards: dueItems.length,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { streak: 0, totalMistakes: 0, dueCards: 0 };
  }
}
