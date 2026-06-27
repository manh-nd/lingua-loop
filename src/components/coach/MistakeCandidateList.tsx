'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Brain,
  Check,
  Edit2,
  EyeOff,
  Save,
  Undo,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  addLocalMemoryItem,
  getLocalMemoryItems,
} from '@/lib/memory/local-memory-store';

export type MistakeCandidateItem = {
  patternKey: string;
  category: string;
  wrongText: string;
  correctText: string;
  explanationVi: string;
  confidence: number;
  source: 'observed' | 'inferred';
  shouldSave: boolean;
};

interface MistakeCandidateListProps {
  candidates: MistakeCandidateItem[];
  sourceWorkflow: 'message' | 'explanation';
  className?: string;
}

export function MistakeCandidateList({
  candidates,
  sourceWorkflow,
  className,
}: MistakeCandidateListProps) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-3.5', className)}>
      {candidates.map((candidate, idx) => (
        <MistakeCandidateCard
          key={idx}
          candidate={candidate}
          sourceWorkflow={sourceWorkflow}
        />
      ))}
    </div>
  );
}

interface MistakeCandidateCardProps {
  candidate: MistakeCandidateItem;
  sourceWorkflow: 'message' | 'explanation';
}

function MistakeCandidateCard({
  candidate,
  sourceWorkflow,
}: MistakeCandidateCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [wrongText, setWrongText] = useState(candidate.wrongText);
  const [correctText, setCorrectText] = useState(candidate.correctText);
  const [explanationVi, setExplanationVi] = useState(candidate.explanationVi);

  // Sync state with localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedItems = getLocalMemoryItems();
      const activeMatch = savedItems.find(
        (s) =>
          s.patternKey === candidate.patternKey &&
          s.wrongText === candidate.wrongText &&
          s.correctText === candidate.correctText &&
          s.status === 'active'
      );
      const ignoredMatch = savedItems.find(
        (s) =>
          s.patternKey === candidate.patternKey &&
          s.wrongText === candidate.wrongText &&
          s.correctText === candidate.correctText &&
          s.status === 'ignored'
      );

      if (activeMatch) {
        setIsSaved(true);
        // update text values to match the saved edited state
        setWrongText(activeMatch.wrongText);
        setCorrectText(activeMatch.correctText);
        setExplanationVi(activeMatch.explanationVi);
      } else if (ignoredMatch) {
        setIsIgnored(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [candidate]);

  const handleSave = () => {
    addLocalMemoryItem({
      sourceWorkflow,
      patternKey: candidate.patternKey,
      wrongText,
      correctText,
      explanationVi,
      category: candidate.category,
      confidence: candidate.confidence ?? 1.0,
      source: candidate.source ?? 'observed',
      status: 'active',
    });
    setIsSaved(true);
    setIsEditing(false);
  };

  const handleIgnore = () => {
    addLocalMemoryItem({
      sourceWorkflow,
      patternKey: candidate.patternKey,
      wrongText,
      correctText,
      explanationVi,
      category: candidate.category,
      confidence: candidate.confidence ?? 1.0,
      source: candidate.source ?? 'observed',
      status: 'ignored',
    });
    setIsIgnored(true);
    setIsEditing(false);
  };

  const handleUndoIgnore = () => {
    addLocalMemoryItem({
      sourceWorkflow,
      patternKey: candidate.patternKey,
      wrongText,
      correctText,
      explanationVi,
      category: candidate.category,
      confidence: candidate.confidence ?? 1.0,
      source: candidate.source ?? 'observed',
      status: 'active',
    });
    setIsSaved(true);
    setIsIgnored(false);
  };

  const handleCancelEdit = () => {
    // Reset to current candidate values
    setWrongText(candidate.wrongText);
    setCorrectText(candidate.correctText);
    setExplanationVi(candidate.explanationVi);
    setIsEditing(false);
  };

  if (isIgnored) {
    return (
      <div className="p-3.5 rounded-lg border border-dashed border-border/80 bg-muted/10 flex items-center justify-between gap-3 text-xs text-muted-foreground animate-in fade-in duration-200">
        <span className="flex items-center gap-1.5 font-medium">
          <EyeOff className="size-3.5" />
          Đã ẩn đề xuất lỗi sai này khỏi kết quả.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleUndoIgnore}
          className="text-primary hover:text-primary-foreground hover:bg-primary font-bold px-2.5 h-7 border border-primary/20 hover:border-primary shrink-0 transition-all active:scale-98 cursor-pointer"
        >
          <Undo className="size-3 mr-1" />
          Khôi phục & Lưu
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'border shadow-none overflow-hidden animate-in fade-in duration-200 py-0',
        isSaved
          ? 'border-emerald-500/30 bg-emerald-500/[0.01]'
          : 'border-border bg-muted/5'
      )}
    >
      {/* Header Banner */}
      <div
        className={cn(
          'py-2.5 px-4 border-b flex flex-row items-center justify-between gap-3 text-[10px]',
          isSaved
            ? 'bg-emerald-500/5 border-emerald-500/10'
            : 'bg-muted/20 border-border'
        )}
      >
        <div className="flex items-center gap-2">
          <code className="font-mono bg-muted dark:bg-black/25 px-1.5 py-0.5 rounded border border-border text-foreground font-bold uppercase tracking-wider">
            {candidate.patternKey}
          </code>
          <span className="uppercase px-1.5 rounded bg-muted/80 dark:bg-black/15 text-muted-foreground border border-border font-medium h-5 inline-flex items-center justify-center">
            Khung: {candidate.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isSaved ? (
            <span className="uppercase px-1.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold flex items-center gap-1 dark:bg-emerald-500/20 dark:text-emerald-400 h-5 inline-flex items-center justify-center">
              <Check className="size-3" />
              Đã lưu vào Sổ tay
            </span>
          ) : candidate.shouldSave ? (
            <span className="uppercase px-1.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold flex items-center gap-1 dark:bg-amber-500/20 dark:text-amber-400 h-5 inline-flex items-center justify-center animate-pulse">
              <BookOpen className="size-2.5" />
              Nên lưu sổ tay
            </span>
          ) : null}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col gap-3.5">
        {isEditing ? (
          /* Inline Editing Form */
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`candidate-wrong-${candidate.patternKey}`}
                  className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
                >
                  Lỗi sai (Incorrect):
                </label>
                <Input
                  id={`candidate-wrong-${candidate.patternKey}`}
                  name="wrongText"
                  value={wrongText}
                  onChange={(e) => setWrongText(e.target.value)}
                  className="h-8 text-xs font-mono border-red-500/20 focus-visible:ring-red-500/30"
                  placeholder="Nhập phần lỗi sai..."
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`candidate-correct-${candidate.patternKey}`}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
                >
                  Đúng (Correct):
                </label>
                <Input
                  id={`candidate-correct-${candidate.patternKey}`}
                  name="correctText"
                  value={correctText}
                  onChange={(e) => setCorrectText(e.target.value)}
                  className="h-8 text-xs font-mono border-emerald-500/20 focus-visible:ring-emerald-500/30"
                  placeholder="Nhập bản sửa đúng..."
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`candidate-explanation-${candidate.patternKey}`}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                Giải nghĩa tiếng Việt (Explanation):
              </label>
              <Textarea
                id={`candidate-explanation-${candidate.patternKey}`}
                name="explanationVi"
                value={explanationVi}
                onChange={(e) => setExplanationVi(e.target.value)}
                rows={2}
                className="text-xs focus-visible:ring-primary/30 p-2 min-h-16"
                placeholder="Nhập giải thích tiếng Việt..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleCancelEdit}
                className="text-[10px] h-7 px-2.5 cursor-pointer font-semibold border-border/80 text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5 mr-1" />
                Hủy
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={handleSave}
                className="text-[10px] h-7 px-2.5 cursor-pointer font-bold bg-emerald-600 hover:bg-emerald-600/90 text-white shadow-xs"
              >
                <Save className="size-3.5 mr-1" />
                Lưu vào Sổ tay
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-2.5 bg-red-500/[0.03] rounded-lg border border-red-500/10">
                <span className="text-[9px] text-red-700 dark:text-red-400 block uppercase font-bold mb-0.5 select-none">
                  Lỗi sai (Incorrect):
                </span>
                <span className="text-red-600 dark:text-red-400 line-through select-all leading-relaxed break-words">
                  {wrongText}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/[0.03] rounded-lg border border-emerald-500/10">
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold mb-0.5 select-none">
                  Đúng (Correct):
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold select-all leading-relaxed break-words">
                  {correctText}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 border-t border-border/40 pt-3 flex items-start gap-1.5">
              <span className="text-primary mt-0.5 select-none">💡</span>
              <span className="select-text">{explanationVi}</span>
            </p>

            {/* Actions Footer */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/30">
              <span className="text-[9.5px] text-muted-foreground italic">
                Nguồn:{' '}
                {sourceWorkflow === 'message'
                  ? 'Message Coach'
                  : 'Explanation Coach'}
              </span>

              {isSaved ? (
                <Link
                  href="/memory"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-600/80 transition-colors py-1 px-2 rounded-md hover:bg-emerald-500/[0.05]"
                >
                  Xem trong Sổ tay
                  <ExternalLink className="size-3" />
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] h-7.5 px-2.5 cursor-pointer font-bold border-border text-muted-foreground hover:bg-muted"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Sửa đổi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleIgnore}
                    className="text-[10px] h-7.5 px-2.5 cursor-pointer font-bold border-border text-muted-foreground hover:bg-muted hover:text-rose-500"
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    onClick={handleSave}
                    className="text-[10px] h-7.5 px-3 cursor-pointer font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-xs active:scale-98 transition-all"
                  >
                    <Brain className="size-3 mr-1" />
                    Lưu vào Sổ tay
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
