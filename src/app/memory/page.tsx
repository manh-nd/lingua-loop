'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from '@/lib/auth-client';
import { CoachShell } from '@/components/coach/CoachShell';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  fetchMemoryData,
  deleteMemoryItem,
  updateMemoryItem,
  updateCandidateStatus,
  UIMemoryCandidate,
  UIMemoryItem,
  MemoryItemPayload,
} from '../workspace/actions';
import { cn } from '@/lib/utils';

type TabType = 'saved' | 'suggested';

interface EditMemoryFields {
  title: string;
  explanation: string;
  sourceText: string;
  suggestedText: string;
  situation: string;
  category: string;
  culturalContext: string;
}

function MemoryPageContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // DB data states
  const [savedItems, setSavedItems] = useState<UIMemoryItem[]>([]);
  const [suggestedCandidates, setSuggestedCandidates] = useState<
    UIMemoryCandidate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<EditMemoryFields>({
    title: '',
    explanation: '',
    sourceText: '',
    suggestedText: '',
    situation: '',
    category: 'naturalness',
    culturalContext: '',
  });

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch data from database
  const loadData = async () => {
    if (!session) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMemoryData();
      setSavedItems(data.items || []);
      setSuggestedCandidates(data.candidates || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu sổ tay.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  // Handle Candidate Status update (Accept / Reject)
  const handleCandidateStatusChange = async (
    candidateId: string,
    status: 'saved' | 'ignored',
    customPayload?: MemoryItemPayload
  ) => {
    try {
      await updateCandidateStatus(candidateId, status, customPayload);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật gợi ý.');
    }
  };

  // Handle Saved Item delete
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi nhớ này khỏi Sổ tay?')) return;
    try {
      await deleteMemoryItem(itemId);
      setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa ghi nhớ.');
    }
  };

  // Handle Saved Item update
  const handleStartEditItem = (item: UIMemoryItem) => {
    setEditingId(item.id);
    setEditFields({
      title: item.title || '',
      explanation: item.explanation || '',
      sourceText: item.sourceText || '',
      suggestedText: item.suggestedText || '',
      situation: item.payload.situation || '',
      category: item.payload.category || 'naturalness',
      culturalContext: item.payload.culturalContext || '',
    });
  };

  const handleSaveEditItem = async (itemId: string) => {
    try {
      const originalItem = savedItems.find((i) => i.id === itemId);
      if (!originalItem) return;
      const updatedPayload: MemoryItemPayload = {
        ...originalItem.payload,
        title: editFields.title,
        explanation: editFields.explanation || '',
        wrongText:
          originalItem.type === 'mistake' ||
          originalItem.type === 'tone_pattern'
            ? editFields.sourceText
            : undefined,
        correctText:
          originalItem.type === 'mistake' ||
          originalItem.type === 'tone_pattern'
            ? editFields.suggestedText
            : undefined,
        phrase:
          originalItem.type === 'reusable_phrase' ||
          originalItem.type === 'vocabulary'
            ? editFields.sourceText
            : undefined,
        situation: editFields.situation,
        category: editFields.category ?? 'naturalness',
        culturalContext: editFields.culturalContext,
      };

      await updateMemoryItem(itemId, { payload: updatedPayload });

      setSavedItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                title: editFields.title,
                explanation: editFields.explanation,
                sourceText: editFields.sourceText,
                suggestedText: editFields.suggestedText,
                payload: updatedPayload,
              }
            : i
        )
      );
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật ghi nhớ.');
    }
  };

  // Filtering logic
  const filteredSaved = savedItems.filter((item) => {
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    const searchLower = searchQuery.toLowerCase();
    const textMatch =
      !searchQuery.trim() ||
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.explanation &&
        item.explanation.toLowerCase().includes(searchLower)) ||
      (item.sourceText &&
        item.sourceText.toLowerCase().includes(searchLower)) ||
      (item.suggestedText &&
        item.suggestedText.toLowerCase().includes(searchLower));

    return typeMatch && textMatch;
  });

  const filteredSuggested = suggestedCandidates.filter((cand) => {
    const typeMatch = selectedType === 'all' || cand.type === selectedType;
    const searchLower = searchQuery.toLowerCase();
    const textMatch =
      !searchQuery.trim() ||
      (cand.title && cand.title.toLowerCase().includes(searchLower)) ||
      (cand.explanation &&
        cand.explanation.toLowerCase().includes(searchLower)) ||
      (cand.sourceText &&
        cand.sourceText.toLowerCase().includes(searchLower)) ||
      (cand.suggestedText &&
        cand.suggestedText.toLowerCase().includes(searchLower));

    return typeMatch && textMatch;
  });

  return (
    <>
      <CoachShell
        headerTitle="Sổ tay ghi nhớ (Memory)"
        headerIcon={<Brain className="size-4 text-primary" />}
        sidebarTitle="Bộ nhớ học theo vòng lặp"
        sidebarDescription="Lưu trữ lỗi viết sai, cụm từ chuyên nghiệp và bẫy đọc hiểu ngữ cảnh để ôn tập thường xuyên."
        showReset={false}
        onReset={() => {}}
        sidebarContent={
          <div className="flex flex-col gap-5">
            {/* Stats Summary */}
            <Card className="border border-border/80 bg-white/20 dark:bg-black/10 rounded-xl p-4.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Thống kê bộ nhớ
              </h2>
              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="p-3.5 rounded-lg bg-background/50 border border-border/40">
                  <span className="text-2xl font-bold text-primary block leading-none mb-1">
                    {savedItems.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Đã tích lũy
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-background/50 border border-border/40">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block leading-none mb-1">
                    {suggestedCandidates.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Đang gợi ý
                  </span>
                </div>
              </div>
            </Card>

            {/* Type selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Loại bộ nhớ
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'mistake', label: 'Lỗi viết sai (Mistake)' },
                  { value: 'reusable_phrase', label: 'Cụm từ hay (Phrase)' },
                  { value: 'vocabulary', label: 'Từ vựng (Vocabulary)' },
                  { value: 'tone_pattern', label: 'Mẫu tông giọng (Tone)' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer',
                      selectedType === t.value
                        ? 'bg-primary/10 border-primary/50 text-foreground'
                        : 'bg-card/40 border-border/60 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        mainContent={
          <div className="flex flex-col gap-6">
            {/* Auth Gate Check */}
            {!session && !sessionLoading ? (
              <Card className="border border-border/60 bg-card/45 backdrop-blur-md rounded-2xl p-6 text-center">
                <div className="max-w-md mx-auto flex flex-col items-center gap-4 py-8">
                  <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                    <Brain className="size-8" />
                  </div>
                  <h3 className="text-base font-bold">Yêu cầu đăng nhập</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sổ tay ghi nhớ được đồng bộ hóa trực tuyến trên tài khoản
                    của bạn để ôn tập trên mọi thiết bị.
                  </p>
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    className="mt-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 cursor-pointer"
                  >
                    Đăng nhập tài khoản
                  </Button>
                </div>
              </Card>
            ) : isLoading ? (
              <div className="flex justify-center py-12">
                <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                  {/* Tabs */}
                  <div className="flex bg-muted/60 p-1 rounded-lg border border-border/40 w-fit shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('saved')}
                      className={cn(
                        'px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer',
                        activeTab === 'saved'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Đã lưu ({filteredSaved.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('suggested')}
                      className={cn(
                        'px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer',
                        activeTab === 'suggested'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Đang gợi ý ({filteredSuggested.length})
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm lỗi sai, cụm từ, giải nghĩa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs focus-visible:ring-primary/40 bg-background/50 border-border/80"
                    />
                  </div>
                </div>

                {/* Error panel */}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700">
                    <AlertCircle className="size-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Main List */}
                <div className="flex flex-col gap-4">
                  {activeTab === 'saved' ? (
                    filteredSaved.length > 0 ? (
                      filteredSaved.map((item) => {
                        const isEditing = editingId === item.id;
                        return (
                          <Card
                            key={item.id}
                            className="bg-card/45 border-border/60 hover:border-primary/20 transition-all rounded-xl overflow-hidden shadow-2xs"
                          >
                            <CardContent className="p-4.5 flex flex-col gap-3">
                              {/* Header details */}
                              <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                                    {item.type}
                                  </span>
                                  <span>
                                    {new Date(
                                      item.createdAt
                                    ).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleStartEditItem(item)}
                                    className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
                                  >
                                    <Edit2 className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="h-6 w-6 p-0 hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Form vs Read view */}
                              {isEditing ? (
                                <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                                  {/* Dynamic fields based on type */}
                                  {(item.type === 'mistake' ||
                                    item.type === 'tone_pattern') && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Bản chưa chuẩn
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.sourceText}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              sourceText: e.target.value,
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
                                          value={editFields.suggestedText}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              suggestedText: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {(item.type === 'reusable_phrase' ||
                                    item.type === 'vocabulary') && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Từ / cụm từ
                                        </span>
                                        <Input
                                          type="text"
                                          value={editFields.sourceText}
                                          onChange={(e) =>
                                            setEditFields({
                                              ...editFields,
                                              sourceText: e.target.value,
                                            })
                                          }
                                          className="text-xs bg-background h-8"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-3xs uppercase font-bold text-muted-foreground">
                                          Bối cảnh
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

                                  <div className="flex flex-col gap-1">
                                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                                      Tiêu đề ghi nhớ
                                    </span>
                                    <Input
                                      type="text"
                                      value={editFields.title}
                                      onChange={(e) =>
                                        setEditFields({
                                          ...editFields,
                                          title: e.target.value,
                                        })
                                      }
                                      className="text-xs bg-background h-8"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                                      Giải nghĩa huấn luyện
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
                                      onClick={() => setEditingId(null)}
                                      className="h-8 text-3xs font-bold hover:bg-muted cursor-pointer"
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      size="xs"
                                      onClick={() =>
                                        handleSaveEditItem(item.id)
                                      }
                                      className="h-8 text-3xs font-bold bg-primary text-primary-foreground cursor-pointer"
                                    >
                                      Lưu thay đổi
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {/* Rendering details */}
                                  <h4 className="text-xs font-bold text-foreground/95">
                                    {item.title}
                                  </h4>

                                  {(item.type === 'mistake' ||
                                    item.type === 'tone_pattern') &&
                                    item.sourceText &&
                                    item.suggestedText && (
                                      <div className="flex items-center gap-1.5 font-mono text-[11px] bg-muted/30 p-2 rounded-lg border border-border/10">
                                        <span className="line-through text-rose-500/80">
                                          {item.sourceText}
                                        </span>
                                        <span>➔</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                                          {item.suggestedText}
                                        </span>
                                      </div>
                                    )}

                                  {(item.type === 'reusable_phrase' ||
                                    item.type === 'vocabulary') &&
                                    item.sourceText && (
                                      <div className="bg-muted/30 p-2 rounded-lg border border-border/10 flex flex-col gap-0.5">
                                        <span className="font-semibold text-xs text-primary font-mono">
                                          {item.sourceText}
                                        </span>
                                        {item.payload.situation && (
                                          <span className="text-[10px] text-muted-foreground">
                                            Bối cảnh: {item.payload.situation}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                  <p className="text-[11px] text-foreground/80 leading-relaxed pl-1">
                                    {item.explanation}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/5">
                        Chưa có ghi nhớ nào được lưu.
                      </div>
                    )
                  ) : filteredSuggested.length > 0 ? (
                    filteredSuggested.map((cand) => (
                      <Card
                        key={cand.id}
                        className="bg-card/45 border-border/60 hover:border-primary/20 transition-all rounded-xl overflow-hidden shadow-2xs"
                      >
                        <CardContent className="p-4.5 flex flex-col gap-3">
                          {/* Header details */}
                          <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                                {cand.type}
                              </span>
                              <span>
                                {new Date(cand.createdAt).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {/* Render contents */}
                            <h4 className="text-xs font-bold text-foreground/95">
                              {cand.title}
                            </h4>

                            {(cand.type === 'mistake' ||
                              cand.type === 'tone_pattern') &&
                              cand.sourceText &&
                              cand.suggestedText && (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-muted/30 p-2 rounded-lg border border-border/10">
                                  <span className="line-through text-rose-500/80">
                                    {cand.sourceText}
                                  </span>
                                  <span>➔</span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                                    {cand.suggestedText}
                                  </span>
                                </div>
                              )}

                            {(cand.type === 'reusable_phrase' ||
                              cand.type === 'vocabulary') &&
                              cand.sourceText && (
                                <div className="bg-muted/30 p-2 rounded-lg border border-border/10 flex flex-col gap-0.5">
                                  <span className="font-semibold text-xs text-primary font-mono">
                                    {cand.sourceText}
                                  </span>
                                  {cand.payload.situation && (
                                    <span className="text-[10px] text-muted-foreground">
                                      Bối cảnh: {cand.payload.situation}
                                    </span>
                                  )}
                                </div>
                              )}

                            <p className="text-[11px] text-foreground/80 leading-relaxed pl-1">
                              {cand.explanation}
                            </p>
                          </div>

                          {/* Quick action buttons */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-border/20">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                handleCandidateStatusChange(cand.id, 'ignored')
                              }
                              className="h-7 px-2.5 text-3xs text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              Bỏ qua
                            </Button>
                            <Button
                              size="xs"
                              onClick={() =>
                                handleCandidateStatusChange(cand.id, 'saved')
                              }
                              className="h-7 px-3 text-3xs bg-primary text-primary-foreground font-bold cursor-pointer"
                            >
                              Thêm vào Sổ tay
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/5">
                      Không có gợi ý chờ duyệt.
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

export default function MemoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <MemoryPageContent />
    </Suspense>
  );
}
