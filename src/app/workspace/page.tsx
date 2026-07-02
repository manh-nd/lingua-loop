'use client';

import {
  useState,
  useEffect,
  useTransition,
  Suspense,
  ComponentType,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { CoachShell } from '@/components/coach/CoachShell';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Copy,
  Check,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  MessageSquare,
  FileText,
  Mail,
  GitCommit,
  BookOpen,
} from 'lucide-react';
import {
  submitWorkspaceCorrection,
  updateCandidateStatus,
  SubmitCorrectionResult,
  UIMemoryCandidate,
  MemoryItemPayload,
} from './actions';
import { cn } from '@/lib/utils';

type PresetType =
  | 'quick_message'
  | 'email'
  | 'pr_jira_comment'
  | 'documentation'
  | 'explanation_spec';

const PRESETS: {
  value: PresetType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    value: 'quick_message',
    label: 'Quick Message',
    icon: MessageSquare,
    description: 'slack, teams, chat ngắn gọn, tự nhiên',
  },
  {
    value: 'email',
    label: 'Email',
    icon: Mail,
    description: 'lịch sự, đầy đủ bối cảnh, chuyên nghiệp',
  },
  {
    value: 'pr_jira_comment',
    label: 'PR & Jira Comment',
    icon: GitCommit,
    description: 'ngắn gọn, kỹ thuật chính xác, trực diện',
  },
  {
    value: 'documentation',
    label: 'Documentation',
    icon: BookOpen,
    description: 'khách quan, nhất quán thuật ngữ, rõ ràng',
  },
  {
    value: 'explanation_spec',
    label: 'Explanation / Spec',
    icon: FileText,
    description: 'giải thích hệ thống, logic, giảm mơ hồ',
  },
];

const TONE_OPTIONS = ['professional', 'friendly', 'polite', 'direct', 'casual'];
const GOAL_OPTIONS = [
  'Fix mistakes',
  'Improve clarity',
  'Make concise',
  'Upgrade vocabulary',
];

function WorkspacePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionLoading } = useSession();

  // Preset state initialized from query params or default
  const [preset, setPreset] = useState<PresetType>('quick_message');
  const [text, setText] = useState('');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('Fix mistakes');
  const [customInstructions, setCustomInstructions] = useState('');

  // Core execution states
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitCorrectionResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Suggested memories management states
  const [candidates, setCandidates] = useState<UIMemoryCandidate[]>([]);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(
    null
  );
  const [editFields, setEditFields] = useState<MemoryItemPayload>({
    explanation: '',
    category: 'naturalness',
  });

  // Auth Modal trigger
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync search parameters to preset state
  useEffect(() => {
    const presetParam = searchParams.get('preset') as PresetType;
    if (presetParam && PRESETS.some((p) => p.value === presetParam)) {
      setPreset(presetParam);
    }
  }, [searchParams]);

  // Handle Preset selection
  const handlePresetSelect = (value: PresetType) => {
    setPreset(value);
    // Sync to url to maintain state on bookmark/refresh
    const params = new URLSearchParams(window.location.search);
    params.set('preset', value);
    router.replace(`/workspace?${params.toString()}`);
  };

  // Submit form to Gemini and PostgreSQL
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!session) {
      setAuthModalOpen(true);
      return;
    }

    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await submitWorkspaceCorrection({
          text,
          preset,
          tone,
          audience: audience || undefined,
          goal,
          customInstructions: customInstructions || undefined,
        });

        setResult(res);
        setCandidates(res.memoryCandidates || []);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi xử lý sửa câu.');
      }
    });
  };

  // Copy improved text to clipboard
  const handleCopy = async () => {
    if (!result?.improvedText) return;
    try {
      await navigator.clipboard.writeText(result.improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Memory Candidates Actions
  const handleIgnoreCandidate = async (candidateId: string) => {
    try {
      await updateCandidateStatus(candidateId, 'ignored');
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bỏ qua gợi ý.');
    }
  };

  const handleSaveCandidate = async (
    candidateId: string,
    customPayload?: MemoryItemPayload
  ) => {
    try {
      await updateCandidateStatus(candidateId, 'saved', customPayload);
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: 'saved' } : c))
      );
      // Automatically clear after a short delay
      setTimeout(() => {
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu gợi ý.');
    }
  };

  const handleStartEdit = (candidate: UIMemoryCandidate) => {
    setEditingCandidateId(candidate.id);
    setEditFields({
      wrongText: candidate.payload.wrongText || '',
      correctText: candidate.payload.correctText || '',
      phrase: candidate.payload.phrase || '',
      situation: candidate.payload.situation || '',
      explanation: candidate.payload.explanation || '',
      category: candidate.payload.category || 'naturalness',
      culturalContext: candidate.payload.culturalContext || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingCandidateId(null);
  };

  const handleSaveEdit = (candidateId: string) => {
    const updatedCandidates = candidates.map((c) => {
      if (c.id === candidateId) {
        return {
          ...c,
          payload: {
            ...c.payload,
            ...editFields,
          },
        };
      }
      return c;
    });

    setCandidates(updatedCandidates);
    setEditingCandidateId(null);

    // Save to database
    handleSaveCandidate(candidateId, {
      ...editFields,
    });
  };

  return (
    <>
      <CoachShell
        headerTitle="Correction Workspace"
        headerIcon={<Sparkles className="size-4 text-primary" />}
        sidebarTitle="Thiết lập sửa lỗi"
        sidebarDescription="Tối ưu hóa câu viết tiếng Anh bằng AI theo các mục tiêu chuyên nghiệp của bạn."
        showReset={!!text || !!result}
        onReset={() => {
          setText('');
          setResult(null);
          setError(null);
        }}
        sidebarContent={
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Presets List */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Presets loại văn bản
              </label>
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = preset === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handlePresetSelect(p.value)}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                        isSelected
                          ? 'bg-primary/10 border-primary/50 text-foreground'
                          : 'bg-card/40 border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4 mt-0.5 shrink-0',
                          isSelected ? 'text-primary' : ''
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{p.label}</span>
                        <span className="text-[10px] opacity-80">
                          {p.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Tông giọng (Tone)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border text-3xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                      tone === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/40 border-border/60 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Mục tiêu sửa lỗi (Goal)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={cn(
                      'px-2 py-1.5 rounded-lg border text-3xs font-bold transition-all cursor-pointer',
                      goal === g
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/40 border-border/60 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Đối tượng đọc (Audience)
              </label>
              <Input
                type="text"
                placeholder="Ví dụ: Team leader, Foreign client, Peers..."
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="text-xs h-9 bg-card/20 border-border/80 focus-visible:ring-primary/40"
              />
            </div>

            {/* Custom Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Yêu cầu bổ sung (Custom instructions)
              </label>
              <Textarea
                placeholder="Ví dụ: Giữ nguyên thuật ngữ kĩ thuật 'checkpoint', viết ngắn gọn dưới 30 từ..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="text-xs min-h-[60px] bg-card/20 border-border/80 focus-visible:ring-primary/40"
              />
            </div>
          </form>
        }
        mainContent={
          <div className="flex flex-col gap-6">
            {/* Input area card */}
            <Card className="border border-border/60 bg-card/45 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Nhập nội dung cần cải thiện
                  </span>
                  {session && (
                    <span className="text-3xs text-muted-foreground">
                      Đăng nhập dưới tên:{' '}
                      <strong className="text-foreground">
                        {session.user.name}
                      </strong>
                    </span>
                  )}
                </div>
                <Textarea
                  placeholder="Nhập ý định tiếng Việt hoặc đoạn nháp tiếng Anh cần nâng cấp..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isPending}
                  className="min-h-[140px] text-xs leading-relaxed focus-visible:ring-primary/30 border-none bg-muted/20 p-0 focus-visible:ring-0 resize-y"
                />

                {/* Auth Gate Indicator and Action Buttons */}
                {!session && !sessionLoading ? (
                  <div className="flex flex-col gap-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        Đăng nhập để lưu lịch sử sửa lỗi và tích lũy bộ nhớ ôn
                        tập.
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold h-10 cursor-pointer"
                    >
                      Đăng nhập để sửa lỗi
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end pt-3 border-t border-border/30">
                    <Button
                      type="submit"
                      disabled={isPending || !text.trim()}
                      onClick={handleSubmit}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? 'Đang phân tích...' : 'Sửa lỗi cùng AI'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error view */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">Lỗi xử lý</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Result container */}
            {result && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Visual Comparison / Improved Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Text */}
                  <Card className="border border-border/50 bg-muted/10 rounded-2xl shadow-none">
                    <CardContent className="p-4.5 flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Bản gốc của bạn
                      </span>
                      <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                        {text}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Improved Version */}
                  <Card className="border border-primary/20 bg-primary/5 rounded-2xl relative shadow-md shadow-primary/2">
                    <CardContent className="p-4.5 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                          Đề xuất cải thiện
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={handleCopy}
                          className="h-7 px-2 border border-border/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
                        >
                          {copied ? (
                            <>
                              <Check className="size-3 text-emerald-600" />
                              <span className="text-3xs text-emerald-600 font-bold">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span className="text-3xs font-bold">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-foreground font-bold leading-relaxed whitespace-pre-wrap">
                        {result.improvedText}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* What Changed & Why Section */}
                {result.changes && result.changes.length > 0 && (
                  <Card className="border border-border/60 bg-card/45 backdrop-blur-md rounded-2xl shadow-sm">
                    <CardContent className="p-5 flex flex-col gap-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Tại sao nên cải thiện? (What Changed & Why)
                      </span>
                      <div className="flex flex-col gap-4">
                        {result.changes.map((change, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/20 border border-border/20 text-xs"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                {change.category}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                                <span className="line-through text-rose-500/80">
                                  {change.original}
                                </span>
                                <span>➔</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                                  {change.improved}
                                </span>
                              </div>
                            </div>
                            <p className="text-foreground/90 leading-relaxed pl-1 text-[11px] font-medium">
                              {change.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Memory Suggestions Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-border/20 pb-2.5">
                    <Brain className="size-4 text-primary" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Gợi ý lưu vào sổ tay lỗi sai (Suggested Memories)
                    </span>
                  </div>

                  {candidates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3.5">
                      {candidates.map((cand) => {
                        const isSaved = cand.status === 'saved';
                        const isEditing = editingCandidateId === cand.id;

                        return (
                          <Card
                            key={cand.id}
                            className={cn(
                              'border transition-all duration-300 rounded-xl overflow-hidden',
                              isSaved
                                ? 'bg-emerald-500/5 border-emerald-500/25 opacity-75'
                                : 'bg-card/45 border-border/60 hover:border-primary/30'
                            )}
                          >
                            <CardContent className="p-4.5 flex flex-col gap-3">
                              {/* Header details */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded text-3xs font-bold uppercase border',
                                      cand.type === 'mistake'
                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                        : cand.type === 'reusable_phrase'
                                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                          : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                    )}
                                  >
                                    {cand.type === 'mistake'
                                      ? 'Lỗi viết sai'
                                      : cand.type === 'reusable_phrase'
                                        ? 'Cụm từ hay'
                                        : cand.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    #{cand.patternKey}
                                  </span>
                                </div>

                                {/* Confirmation State */}
                                {isSaved && (
                                  <div className="flex items-center gap-1 text-3xs font-bold text-emerald-600">
                                    <CheckCircle className="size-3.5" />
                                    <span>Đã lưu vào bộ nhớ ôn tập!</span>
                                  </div>
                                )}
                              </div>

                              {/* Interactive Edit Form vs Detail View */}
                              {isEditing ? (
                                <div className="flex flex-col gap-3.5 p-3 rounded-lg bg-muted/30 border border-border/20">
                                  {/* Editing text values */}
                                  {(cand.type === 'mistake' ||
                                    cand.type === 'tone_pattern') && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Bản chưa chuẩn
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.wrongText}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              wrongText: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Bản sửa chuẩn
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.correctText}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              correctText: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {(cand.type === 'reusable_phrase' ||
                                    cand.type === 'vocabulary') && (
                                    <div className="flex flex-col gap-2">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Từ / Cụm từ hay
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.phrase}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              phrase: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Bối cảnh khuyên dùng (tiếng Việt)
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.situation}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              situation: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Explanation Editing */}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                                      Giải nghĩa huấn luyện (tiếng Việt)
                                    </span>
                                    <Textarea
                                      value={editFields.explanation}
                                      onChange={(e) =>
                                        setEditFields({
                                          ...editFields,
                                          explanation: e.target.value,
                                        })
                                      }
                                      className="text-xs bg-background min-h-[50px] resize-y py-1.5"
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={handleCancelEdit}
                                      className="h-8 text-3xs font-bold hover:bg-muted cursor-pointer"
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      size="xs"
                                      onClick={() => handleSaveEdit(cand.id)}
                                      className="h-8 text-3xs font-bold bg-primary text-primary-foreground cursor-pointer"
                                    >
                                      Lưu chỉnh sửa & Thêm
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col gap-1">
                                    <h4 className="text-xs font-bold text-foreground/95">
                                      {cand.title}
                                    </h4>

                                    {/* Main text content */}
                                    {cand.type === 'mistake' && (
                                      <div className="flex items-center gap-1.5 font-mono text-[11px] bg-muted/30 p-2 rounded-lg border border-border/10 my-1">
                                        <span className="line-through text-rose-500/80">
                                          {cand.payload.wrongText}
                                        </span>
                                        <span className="text-muted-foreground">
                                          ➔
                                        </span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                                          {cand.payload.correctText}
                                        </span>
                                      </div>
                                    )}

                                    {cand.type === 'reusable_phrase' && (
                                      <div className="bg-muted/30 p-2 rounded-lg border border-border/10 my-1 flex flex-col gap-0.5">
                                        <span className="font-semibold text-xs text-primary font-mono">
                                          {cand.payload.phrase}
                                        </span>
                                        {cand.payload.situation && (
                                          <span className="text-[10px] text-muted-foreground">
                                            Bối cảnh: {cand.payload.situation}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    <p className="text-[11px] text-foreground/80 leading-relaxed">
                                      {cand.payload.explanation}
                                    </p>
                                  </div>

                                  {/* Actions buttons */}
                                  {!isSaved && (
                                    <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() =>
                                          handleIgnoreCandidate(cand.id)
                                        }
                                        className="h-7 px-2.5 text-3xs text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        Bỏ qua
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => handleStartEdit(cand)}
                                        className="h-7 px-2.5 text-3xs border-border/80 cursor-pointer flex items-center gap-1"
                                      >
                                        <Edit2 className="size-2.5" />
                                        Sửa đổi
                                      </Button>
                                      <Button
                                        size="xs"
                                        onClick={() =>
                                          handleSaveCandidate(cand.id)
                                        }
                                        className="h-7 px-3 text-3xs bg-primary text-primary-foreground font-bold cursor-pointer"
                                      >
                                        Thêm vào Sổ tay
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4.5 rounded-xl border border-border/40 text-center text-xs text-muted-foreground bg-muted/10">
                      Không có gợi ý lỗi sai hoặc từ vựng mới nào cho câu sửa
                      này.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <WorkspacePageContent />
    </Suspense>
  );
}
