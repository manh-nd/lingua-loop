'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Trash2,
  Edit2,
  X,
  Save,
  BookOpen,
  MessageSquare,
  FileText,
  Inbox,
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  EyeOff,
  RotateCcw,
  Play,
  Globe,
  Download,
  Upload,
} from 'lucide-react';
import { CoachShell } from '@/components/coach/CoachShell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getLocalMemoryItems,
  saveLocalMemoryItems,
  deleteLocalMemoryItem,
  updateLocalMemoryItem,
  addLocalMemoryItem,
  LocalMemoryItem,
} from '@/lib/memory/local-memory-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Category mapping helper
const categories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'tone', label: 'Tông giọng' },
  { value: 'word_choice', label: 'Dùng từ' },
  { value: 'naturalness', label: 'Độ tự nhiên' },
  { value: 'clarity', label: 'Mạch lạc' },
  { value: 'structure', label: 'Cấu trúc' },
];

const MOCK_ITEMS: Omit<LocalMemoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    memoryType: 'writing_mistake',
    sourceWorkflow: 'message',
    patternKey: 'checked_my_pr',
    wrongText: 'Please check my PR.',
    correctText:
      'Could you please take a look at this PR when you have a moment?',
    explanationVi:
      'Thay vì dùng từ quá bình dân như "check my PR", sử dụng "take a look at this PR" giúp lời nói tự nhiên và lịch sự hơn trong môi trường công sở.',
    culturalContextVi:
      'Trong văn hóa làm việc phương Tây, việc ra lệnh trực tiếp bằng "Please + verb" đôi khi nghe giống như mệnh lệnh của cấp trên. Dùng câu hỏi "Could you..." tạo sắc thái thảo luận bình đẳng và tôn trọng thời gian của đồng nghiệp.',
    category: 'tone',
    confidence: 0.95,
    source: 'observed',
    status: 'active',
    reviewCount: 2,
    correctStreak: 2,
    wrongStreak: 0,
    intervalDays: 4,
    easeFactor: 2.6,
    nextReviewAt: '2026-06-27T12:00:00.000Z',
  },
  {
    memoryType: 'writing_mistake',
    sourceWorkflow: 'message',
    patternKey: 'late_report',
    wrongText: 'I send report late because of bugs.',
    correctText:
      'Here is this week’s progress report. A few tasks are slightly delayed due to unexpected bugs.',
    explanationVi:
      'Diễn đạt giảm nhẹ "slightly delayed" (hơi chậm trễ) thay vì "late" thô thiển, kết hợp với cụm từ kỹ thuật chuẩn xác "unexpected bugs" giúp giữ tác phong chuyên nghiệp.',
    category: 'grammar',
    confidence: 0.9,
    source: 'observed',
    status: 'active',
    reviewCount: 0,
    correctStreak: 0,
    wrongStreak: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    nextReviewAt: '2026-06-27T12:00:00.000Z',
  },
  {
    memoryType: 'reusable_phrase',
    sourceWorkflow: 'explanation',
    patternKey: 'checkout_timeout',
    phrase:
      'When the user clicks the checkout button, the page shows an infinite loading state. This is caused by the /checkout API responding slowly (>10s), which triggers a gateway timeout.',
    situationVi: 'Mô tả chi tiết lỗi thanh toán bị chậm trên Jira ticket.',
    explanationVi:
      'Mẫu cấu trúc câu mô tả lỗi kỹ thuật chuẩn xác: Hành động của người dùng ("When the user clicks...") -> Hậu quả giao diện ("the page shows...") -> Nguyên nhân kỹ thuật cụ thể ("This is caused by...").',
    category: 'structure',
    confidence: 0.88,
    source: 'inferred',
    status: 'active',
    reviewCount: 1,
    correctStreak: 1,
    wrongStreak: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewAt: '2026-06-27T12:00:00.000Z',
  },
  {
    memoryType: 'reading_trap',
    sourceWorkflow: 'reading',
    patternKey: 'ask_api_doc',
    trapText: 'That might be challenging.',
    wrongInterpretationVi:
      'Việc này có vẻ thú vị và mang tính thử thách, hãy làm đi.',
    correctInterpretationVi:
      'Có thể họ đang nói việc này khó, không khả thi, hoặc họ đang từ chối khéo.',
    explanationVi:
      'Người bản xứ thường dùng cách nói giảm nói tránh để biểu đạt sự từ chối hoặc khó khăn mà không gây mất lòng đối phương.',
    culturalContextVi:
      'Giao tiếp Á Đông thường gián tiếp để giữ thể diện, nhưng văn hóa doanh nghiệp phương Tây dù trực diện cũng rất ưa chuộng các từ giảm nhẹ (mitigated speech) khi đưa ra phản hồi tiêu cực. "Challenging" thường có nghĩa là "No, we cannot do this easily".',
    category: 'naturalness',
    confidence: 0.92,
    source: 'observed',
    status: 'active',
    reviewCount: 0,
    correctStreak: 0,
    wrongStreak: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    nextReviewAt: '2026-06-27T12:00:00.000Z',
  },
];

export default function MemoryPage() {
  const showMockMemoryData = process.env.NODE_ENV !== 'production';
  const [items, setItems] = useState<LocalMemoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'ignored'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Controlled Alert Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  const triggerConfirm = (title: string, desc: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmDescription(desc);
    setOnConfirm(() => action);
    setConfirmOpen(true);
  };

  // Editing values state
  const [wrongText, setWrongText] = useState('');
  const [correctText, setCorrectText] = useState('');
  const [explanationVi, setExplanationVi] = useState('');
  const [phrase, setPhrase] = useState('');
  const [situationVi, setSituationVi] = useState('');
  const [trapText, setTrapText] = useState('');
  const [wrongInterpretationVi, setWrongInterpretationVi] = useState('');
  const [correctInterpretationVi, setCorrectInterpretationVi] = useState('');
  const [culturalContextVi, setCulturalContextVi] = useState('');

  // Hydration safety
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setItems(getLocalMemoryItems());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const refreshItems = () => {
    setItems(getLocalMemoryItems());
  };

  const handleExportJSON = () => {
    const allItems = getLocalMemoryItems();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(allItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `lingua-loop-memory-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          alert(
            'Định dạng file không hợp lệ (Phải là một mảng JSON các thẻ lỗi).'
          );
          return;
        }

        // Validate each item has at least an id and memoryType
        const isValid = imported.every(
          (item) =>
            item && typeof item === 'object' && item.id && item.memoryType
        );
        if (!isValid) {
          alert('Dữ liệu lỗi sai không hợp lệ.');
          return;
        }

        if (
          confirm(
            `Bạn có chắc chắn muốn nhập ${imported.length} thẻ lỗi sai này? Các thẻ trùng ID sẽ bị ghi đè.`
          )
        ) {
          const current = getLocalMemoryItems();
          const mergedMap = new Map();
          current.forEach((item) => mergedMap.set(item.id, item));
          imported.forEach((item) => mergedMap.set(item.id, item));

          const mergedList = Array.from(mergedMap.values());
          localStorage.setItem(
            'lingua-loop-memory',
            JSON.stringify(mergedList)
          );
          refreshItems();
          alert('Nhập dữ liệu thành công!');
        }
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi đọc file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEditStart = (item: LocalMemoryItem) => {
    setEditingId(item.id);
    setWrongText(item.wrongText || '');
    setCorrectText(item.correctText || '');
    setExplanationVi(item.explanationVi || '');
    setPhrase(item.phrase || '');
    setSituationVi(item.situationVi || '');
    setTrapText(item.trapText || '');
    setWrongInterpretationVi(item.wrongInterpretationVi || '');
    setCorrectInterpretationVi(item.correctInterpretationVi || '');
    setCulturalContextVi(item.culturalContextVi || '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = (item: LocalMemoryItem) => {
    const id = item.id;
    if (item.memoryType === 'writing_mistake') {
      if (!wrongText.trim() || !correctText.trim() || !explanationVi.trim())
        return;
      updateLocalMemoryItem(id, {
        wrongText: wrongText.trim(),
        correctText: correctText.trim(),
        explanationVi: explanationVi.trim(),
        culturalContextVi: culturalContextVi.trim() || undefined,
      });
    } else if (item.memoryType === 'reusable_phrase') {
      if (!phrase.trim() || !situationVi.trim() || !explanationVi.trim())
        return;
      updateLocalMemoryItem(id, {
        phrase: phrase.trim(),
        situationVi: situationVi.trim(),
        explanationVi: explanationVi.trim(),
        culturalContextVi: culturalContextVi.trim() || undefined,
      });
    } else if (item.memoryType === 'reading_trap') {
      if (
        !trapText.trim() ||
        !wrongInterpretationVi.trim() ||
        !correctInterpretationVi.trim() ||
        !explanationVi.trim()
      )
        return;
      updateLocalMemoryItem(id, {
        trapText: trapText.trim(),
        wrongInterpretationVi: wrongInterpretationVi.trim(),
        correctInterpretationVi: correctInterpretationVi.trim(),
        explanationVi: explanationVi.trim(),
        culturalContextVi: culturalContextVi.trim() || undefined,
      });
    }
    setEditingId(null);
    refreshItems();
  };

  const handleDelete = (id: string) => {
    triggerConfirm(
      'Xóa lỗi sai này?',
      'Bạn có chắc chắn muốn xóa lỗi sai này khỏi Sổ tay? Hành động này không thể hoàn tác.',
      () => {
        deleteLocalMemoryItem(id);
        refreshItems();
      }
    );
  };

  const handleToggleArchive = (item: LocalMemoryItem) => {
    const newStatus = item.status === 'active' ? 'ignored' : 'active';
    updateLocalMemoryItem(item.id, { status: newStatus });
    refreshItems();
  };

  const handleResetAll = () => {
    triggerConfirm(
      'Xóa toàn bộ Sổ tay?',
      'Hành động này sẽ xóa vĩnh viễn tất cả các lỗi sai đã lưu trong Sổ tay của bạn. Bạn có chắc chắn muốn tiếp tục?',
      () => {
        saveLocalMemoryItems([]);
        refreshItems();
      }
    );
  };

  const handleGenerateMockData = () => {
    MOCK_ITEMS.forEach((mock) => {
      addLocalMemoryItem(mock);
    });
    refreshItems();
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const statusMatch = item.status === activeTab;
    const categoryMatch =
      selectedCategory === 'all' || item.category === selectedCategory;
    const typeMatch =
      selectedType === 'all' || item.memoryType === selectedType;

    const searchMatch =
      !searchQuery.trim() ||
      (item.wrongText &&
        item.wrongText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.correctText &&
        item.correctText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.phrase &&
        item.phrase.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.trapText &&
        item.trapText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.explanationVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.culturalContextVi &&
        item.culturalContextVi
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      item.patternKey.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && categoryMatch && typeMatch && searchMatch;
  });

  // Calculate statistics for sidebar
  const activeCount = items.filter((item) => item.status === 'active').length;
  const ignoredCount = items.filter((item) => item.status === 'ignored').length;

  // Due counts for SRS
  const nowStr = new Date().toISOString();
  const dueCount = items.filter(
    (item) =>
      item.status === 'active' &&
      (!item.nextReviewAt || item.nextReviewAt <= nowStr)
  ).length;

  const categoryStats = categories.reduce<Record<string, number>>(
    (acc, cat) => {
      if (cat.value === 'all') return acc;
      acc[cat.value] = items.filter(
        (item) => item.status === 'active' && item.category === cat.value
      ).length;
      return acc;
    },
    {}
  );

  const getCategoryCount = (catValue: string) => {
    if (catValue === 'all') {
      return items.filter(
        (item) =>
          item.status === activeTab &&
          (selectedType === 'all' || item.memoryType === selectedType)
      ).length;
    }
    return items.filter(
      (item) =>
        item.status === activeTab &&
        item.category === catValue &&
        (selectedType === 'all' || item.memoryType === selectedType)
    ).length;
  };

  const getMemoryTypeCount = (typeValue: string) => {
    if (typeValue === 'all') {
      return items.filter((item) => item.status === activeTab).length;
    }
    return items.filter(
      (item) => item.status === activeTab && item.memoryType === typeValue
    ).length;
  };

  // Badges styling
  const memoryTypeLabels: Record<string, { label: string; className: string }> =
    {
      writing_mistake: {
        label: 'Lỗi viết sai',
        className:
          'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400',
      },
      reusable_phrase: {
        label: 'Cụm từ hay',
        className:
          'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
      },
      reading_trap: {
        label: 'Bẫy đọc hiểu',
        className:
          'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
      },
    };

  const workflowLabels: Record<
    string,
    { label: string; icon: React.ReactNode }
  > = {
    message: {
      label: 'Email & Message Coach',
      icon: <MessageSquare className="size-3" />,
    },
    explanation: {
      label: 'Document Coach',
      icon: <FileText className="size-3" />,
    },
    reading: { label: 'Reading Coach', icon: <BookOpen className="size-3" /> },
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <CoachShell
        headerTitle="SỔ TAY LỖI SAI (MEMORY)"
        headerIcon={<Brain className="size-4 text-primary" />}
        sidebarTitle="Bộ nhớ học theo vòng lặp"
        sidebarDescription="Nơi lưu trữ lỗi viết sai, cụm từ chuyên nghiệp và bẫy đọc hiểu ngữ cảnh. Ôn tập thường xuyên để không lặp lại lỗi cũ."
        showReset={items.length > 0}
        onReset={handleResetAll}
        badge="MVP v1"
        sidebarContent={
          <div className="flex flex-col gap-6">
            {/* Mock data creation button for testing */}
            {showMockMemoryData && items.length === 0 && (
              <Button
                type="button"
                onClick={handleGenerateMockData}
                className="w-full text-xs font-bold py-4 bg-indigo-600 hover:bg-indigo-600/90 text-white shadow-md cursor-pointer rounded-lg border-none"
              >
                <Sparkles className="size-3.5 mr-2 animate-pulse" />
                Dev: Tạo dữ liệu mẫu
              </Button>
            )}

            {/* Stats Summary Card */}
            <Card className="border border-border/80 bg-white/20 dark:bg-black/10 shadow-none rounded-xl p-4.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Thống kê bộ nhớ
              </h2>
              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="p-3.5 rounded-lg bg-background/50 border border-border/40">
                  <span className="text-2xl font-bold text-primary block leading-none mb-1">
                    {activeCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Đang ôn tập
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-background/50 border border-border/40">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block leading-none mb-1">
                    {dueCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Đến hạn ôn
                  </span>
                </div>
              </div>

              {/* Category breakdown */}
              {activeCount > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                    Phân bố lỗi sai
                  </span>
                  {categories.map(
                    (cat) =>
                      cat.value !== 'all' &&
                      (categoryStats[cat.value] || 0) > 0 && (
                        <div
                          key={cat.value}
                          className="flex justify-between items-center text-xs text-foreground/90 font-medium"
                        >
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-primary/60" />
                            {cat.label}
                          </span>
                          <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                            {categoryStats[cat.value]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              )}
            </Card>

            {/* Export / Import Data */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportJSON}
                className="flex-1 text-[10px] font-bold h-8.5 rounded-lg border-border hover:bg-muted text-muted-foreground flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="size-3.5" />
                Xuất JSON
              </Button>
              <div className="flex-1 relative">
                <input
                  type="file"
                  id="import-json-file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('import-json-file')?.click()
                  }
                  className="w-full text-[10px] font-bold h-8.5 rounded-lg border-border hover:bg-muted text-muted-foreground flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  Nhập JSON
                </Button>
              </div>
            </div>

            {activeCount > 0 && (
              <Link href="/review" className="w-full">
                <Button className="w-full text-xs font-bold py-3 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm rounded-lg border-none flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden">
                  <Play className="size-3.5 fill-current animate-pulse" />
                  Ôn tập lỗi đến hạn ({dueCount})
                </Button>
              </Link>
            )}

            {/* Quick links to Coach Workflows */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quay lại Coach Workflows
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/message"
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground/90 transition-all active:scale-99"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-primary" />
                    Email & Message Coach
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/explanation"
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground/90 transition-all active:scale-99"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    Document Coach
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/reading"
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground/90 transition-all active:scale-99"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    Reading Coach
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        }
        mainContent={
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Active / Archived Tab Toggles & Category Filters */}
            <div className="flex flex-col gap-4 border-b border-border/40 pb-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Status tabs */}
                <div className="flex bg-muted/60 p-1 rounded-lg border border-border/40 w-fit shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('active');
                      setEditingId(null);
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer select-none',
                      activeTab === 'active'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Đang ôn tập ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('ignored');
                      setEditingId(null);
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer select-none',
                      activeTab === 'ignored'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Đã bỏ qua ({ignoredCount})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <label htmlFor="search-input" className="sr-only">
                    Tìm kiếm trong sổ tay...
                  </label>
                  <Input
                    id="search-input"
                    name="search"
                    type="text"
                    placeholder="Tìm kiếm lỗi sai, cụm từ, văn hóa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs focus-visible:ring-primary/40 bg-background/50 border-border/80"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Memory Type filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border/10 pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 select-none">
                  Loại bộ nhớ:
                </span>
                <div className="flex gap-1.5">
                  {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'writing_mistake', label: 'Lỗi viết sai' },
                    { value: 'reusable_phrase', label: 'Cụm từ hay' },
                    { value: 'reading_trap', label: 'Bẫy đọc hiểu' },
                  ].map((t) => {
                    const count = getMemoryTypeCount(t.value);
                    if (
                      count === 0 &&
                      t.value !== 'all' &&
                      selectedType !== t.value
                    )
                      return null;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          setSelectedType(t.value);
                          setEditingId(null);
                        }}
                        className={cn(
                          'px-2.5 py-0.5 rounded text-3xs font-bold border transition-all cursor-pointer whitespace-nowrap',
                          selectedType === t.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                        )}
                      >
                        {t.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category filter */}
              <div className="flex items-start sm:items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 select-none pt-1 sm:pt-0">
                  Lọc Khung:
                </span>
                <div className="flex gap-1.5">
                  {categories.map((cat) => {
                    const count = getCategoryCount(cat.value);
                    if (
                      count === 0 &&
                      cat.value !== 'all' &&
                      selectedCategory !== cat.value
                    )
                      return null;

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.value);
                          setEditingId(null);
                        }}
                        className={cn(
                          'px-3 py-1 rounded-full text-2xs font-bold border transition-all cursor-pointer whitespace-nowrap select-none flex items-center gap-1.5',
                          selectedCategory === cat.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                        )}
                      >
                        {cat.label}
                        <span
                          className={cn(
                            'text-[9px] px-1 rounded-full',
                            selectedCategory === cat.value
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List of saved memory items */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      'border shadow-none overflow-hidden transition-all duration-300 py-0 rounded-xl',
                      item.status === 'ignored'
                        ? 'opacity-80 border-border/70 bg-muted/5'
                        : 'border-border bg-white/[0.01]'
                    )}
                  >
                    {/* Banner Header */}
                    <div className="py-2.5 px-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between gap-3 text-[10px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="font-mono bg-muted dark:bg-black/20 px-1.5 py-0.5 rounded border border-border text-foreground font-bold uppercase tracking-wider">
                          {item.patternKey}
                        </code>
                        <span
                          className={cn(
                            'uppercase px-1.5 rounded border font-bold text-[9px] h-5 inline-flex items-center justify-center',
                            memoryTypeLabels[item.memoryType]?.className
                          )}
                        >
                          {memoryTypeLabels[item.memoryType]?.label}
                        </span>
                        <span className="uppercase px-1.5 rounded bg-muted/80 text-muted-foreground border border-border font-medium h-5 inline-flex items-center justify-center">
                          {categories.find((c) => c.value === item.category)
                            ?.label || item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-muted-foreground/80 font-mono">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4 flex flex-col gap-3.5">
                      {editingId === item.id ? (
                        /* Inline Edit Form per Memory Type */
                        <div className="flex flex-col gap-3">
                          {item.memoryType === 'writing_mistake' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor={`edit-wrong-${item.id}`}
                                  className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
                                >
                                  Lỗi sai (Incorrect):
                                </label>
                                <Input
                                  id={`edit-wrong-${item.id}`}
                                  name="wrongText"
                                  value={wrongText}
                                  onChange={(e) => setWrongText(e.target.value)}
                                  className="h-8 text-xs font-mono border-red-500/20 focus-visible:ring-red-500/30"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor={`edit-correct-${item.id}`}
                                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
                                >
                                  Đúng (Correct):
                                </label>
                                <Input
                                  id={`edit-correct-${item.id}`}
                                  name="correctText"
                                  value={correctText}
                                  onChange={(e) =>
                                    setCorrectText(e.target.value)
                                  }
                                  className="h-8 text-xs font-mono border-emerald-500/20 focus-visible:ring-emerald-500/30"
                                />
                              </div>
                            </div>
                          )}

                          {item.memoryType === 'reusable_phrase' && (
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor={`edit-phrase-${item.id}`}
                                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
                                >
                                  Mẫu câu đề xuất (Phrase):
                                </label>
                                <Input
                                  id={`edit-phrase-${item.id}`}
                                  name="phrase"
                                  value={phrase}
                                  onChange={(e) => setPhrase(e.target.value)}
                                  className="h-8 text-xs font-mono border-emerald-500/20 focus-visible:ring-emerald-500/30"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor={`edit-situation-${item.id}`}
                                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                                >
                                  Tình huống ứng dụng:
                                </label>
                                <Input
                                  id={`edit-situation-${item.id}`}
                                  name="situationVi"
                                  value={situationVi}
                                  onChange={(e) =>
                                    setSituationVi(e.target.value)
                                  }
                                  className="h-8 text-xs focus-visible:ring-primary/30"
                                />
                              </div>
                            </div>
                          )}

                          {item.memoryType === 'reading_trap' && (
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor={`edit-trap-${item.id}`}
                                  className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
                                >
                                  Cụm từ dễ hiểu nhầm (Trap):
                                </label>
                                <Input
                                  id={`edit-trap-${item.id}`}
                                  name="trapText"
                                  value={trapText}
                                  onChange={(e) => setTrapText(e.target.value)}
                                  className="h-8 text-xs font-mono border-red-500/20 focus-visible:ring-red-500/30"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label
                                    htmlFor={`edit-wrong-interpretation-${item.id}`}
                                    className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider"
                                  >
                                    Hiểu sai nghĩa:
                                  </label>
                                  <Input
                                    id={`edit-wrong-interpretation-${item.id}`}
                                    name="wrongInterpretationVi"
                                    value={wrongInterpretationVi}
                                    onChange={(e) =>
                                      setWrongInterpretationVi(e.target.value)
                                    }
                                    className="h-8 text-xs focus-visible:ring-red-500/20"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label
                                    htmlFor={`edit-correct-interpretation-${item.id}`}
                                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
                                  >
                                    Hiểu đúng ngữ cảnh:
                                  </label>
                                  <Input
                                    id={`edit-correct-interpretation-${item.id}`}
                                    name="correctInterpretationVi"
                                    value={correctInterpretationVi}
                                    onChange={(e) =>
                                      setCorrectInterpretationVi(e.target.value)
                                    }
                                    className="h-8 text-xs focus-visible:ring-emerald-500/20"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <label
                                htmlFor={`edit-explanation-${item.id}`}
                                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                              >
                                Giải nghĩa tiếng Việt (Explanation):
                              </label>
                              <Textarea
                                id={`edit-explanation-${item.id}`}
                                name="explanationVi"
                                value={explanationVi}
                                onChange={(e) =>
                                  setExplanationVi(e.target.value)
                                }
                                rows={2}
                                className="text-xs focus-visible:ring-primary/30 p-2 min-h-16"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label
                                htmlFor={`edit-cultural-${item.id}`}
                                className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider"
                              >
                                Ngữ cảnh văn hóa / Giao tiếp Đông-Tây (Cultural
                                Context):
                              </label>
                              <Textarea
                                id={`edit-cultural-${item.id}`}
                                name="culturalContextVi"
                                value={culturalContextVi}
                                onChange={(e) =>
                                  setCulturalContextVi(e.target.value)
                                }
                                rows={2}
                                className="text-xs focus-visible:ring-indigo-500/30 p-2 min-h-16"
                                placeholder="Giải thích sắc thái văn hóa hoặc ngữ cảnh giao tiếp (không bắt buộc)..."
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={handleEditCancel}
                              className="text-[10px] h-7.5 px-2.5 font-semibold border-border text-muted-foreground hover:bg-muted cursor-pointer"
                            >
                              <X className="size-3.5 mr-1" />
                              Hủy
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => handleEditSave(item)}
                              className="text-[10px] h-7.5 px-2.5 font-bold bg-emerald-600 hover:bg-emerald-600/90 text-white cursor-pointer"
                            >
                              <Save className="size-3.5 mr-1" />
                              Lưu lại
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode per Memory Type */
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                            {item.memoryType === 'writing_mistake' && (
                              <>
                                <div className="p-3 bg-red-500/[0.03] rounded-lg border border-red-500/10 flex flex-col gap-1">
                                  <span className="text-[9px] text-red-700 dark:text-red-400 uppercase font-bold flex items-center gap-1 select-none">
                                    <XCircle className="size-3" />
                                    Lỗi sai (Incorrect):
                                  </span>
                                  <span className="text-red-600 dark:text-red-400 line-through select-all leading-relaxed break-words font-medium">
                                    {item.wrongText}
                                  </span>
                                </div>
                                <div className="p-3 bg-emerald-500/[0.03] rounded-lg border border-emerald-500/10 flex flex-col gap-1">
                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center gap-1 select-none">
                                    <CheckCircle2 className="size-3" />
                                    Đúng (Correct):
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold select-all leading-relaxed break-words">
                                    {item.correctText}
                                  </span>
                                </div>
                              </>
                            )}

                            {item.memoryType === 'reusable_phrase' && (
                              <>
                                <div className="p-3 bg-emerald-500/[0.03] rounded-lg border border-emerald-500/10 flex flex-col gap-1 sm:col-span-2">
                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center gap-1 select-none">
                                    <CheckCircle2 className="size-3" />
                                    Cụm từ hữu ích (Recommended Phrase):
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold select-all leading-relaxed break-words">
                                    {item.phrase}
                                  </span>
                                </div>
                                {item.situationVi && (
                                  <div className="p-2.5 bg-muted/40 rounded-lg border border-border/60 flex flex-col gap-1 sm:col-span-2 text-[10px] font-sans">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold select-none">
                                      Tình huống ứng dụng:
                                    </span>
                                    <span className="text-foreground leading-relaxed">
                                      {item.situationVi}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            {item.memoryType === 'reading_trap' && (
                              <>
                                <div className="p-3 bg-red-500/[0.03] rounded-lg border border-red-500/10 flex flex-col gap-1 sm:col-span-2">
                                  <span className="text-[9px] text-red-700 dark:text-red-400 uppercase font-bold flex items-center gap-1 select-none">
                                    <XCircle className="size-3" />
                                    Bẫy dịch nghĩa gốc (Trap Text):
                                  </span>
                                  <span className="text-red-600 dark:text-red-400 font-bold select-all leading-relaxed break-words">
                                    {item.trapText}
                                  </span>
                                </div>
                                <div className="p-2.5 bg-red-500/[0.03] rounded-lg border border-red-500/10 flex flex-col gap-1 font-sans">
                                  <span className="text-[9px] text-red-700 dark:text-red-400 uppercase font-bold select-none">
                                    Dễ bị hiểu lầm là:
                                  </span>
                                  <span className="text-red-600 dark:text-red-400 font-medium">
                                    {item.wrongInterpretationVi}
                                  </span>
                                </div>
                                <div className="p-2.5 bg-emerald-500/[0.03] rounded-lg border border-emerald-500/10 flex flex-col gap-1 font-sans">
                                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-bold select-none">
                                    Hiểu đúng ngữ cảnh là:
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {item.correctInterpretationVi}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Explanation block */}
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 border-t border-border/30 pt-3 flex items-start gap-1.5">
                            <span className="text-primary mt-0.5 select-none">
                              💡
                            </span>
                            <span className="select-text">
                              {item.explanationVi}
                            </span>
                          </p>

                          {/* Cultural Context Insight */}
                          {item.culturalContextVi && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed mt-2 border-t border-border/30 pt-2.5 flex items-start gap-1.5 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.05] p-2.5 rounded-lg border border-indigo-500/10">
                              <Globe className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                              <span className="select-text">
                                <strong className="font-semibold block text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 select-none mb-0.5">
                                  Giải thích văn hóa & Ngữ cảnh:
                                </strong>
                                {item.culturalContextVi}
                              </span>
                            </p>
                          )}

                          {/* SRS Status row */}
                          {item.status === 'active' && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] text-muted-foreground font-mono bg-muted/20 dark:bg-black/15 p-2 rounded-lg items-center border border-border/30 mt-1">
                              <span>
                                Mức thuộc:{' '}
                                <strong className="text-foreground">
                                  {item.correctStreak}🔥
                                </strong>
                              </span>
                              <span>
                                Đã ôn:{' '}
                                <strong className="text-foreground">
                                  {item.reviewCount} lần
                                </strong>
                              </span>
                              <span>
                                Chu kỳ:{' '}
                                <strong className="text-foreground">
                                  {item.intervalDays} ngày
                                </strong>
                              </span>
                              <span>
                                Lần ôn tới:{' '}
                                <strong className="text-foreground">
                                  {item.nextReviewAt &&
                                  new Date(item.nextReviewAt) <= new Date()
                                    ? 'Đang đến hạn ⚠️'
                                    : item.nextReviewAt
                                      ? new Date(
                                          item.nextReviewAt
                                        ).toLocaleDateString('vi-VN')
                                      : 'Chưa lập lịch'}
                                </strong>
                              </span>
                            </div>
                          )}

                          {/* Actions Footer */}
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/30">
                            {/* Workflow Badge */}
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/60 text-[9.5px] text-muted-foreground font-semibold">
                              {workflowLabels[item.sourceWorkflow]?.icon}
                              {workflowLabels[item.sourceWorkflow]?.label ||
                                item.sourceWorkflow}
                            </span>

                            <div className="flex gap-2">
                              {item.status === 'active' && (
                                <Link href={`/review?id=${item.id}`}>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    className="text-[10px] h-7.5 px-2.5 font-bold border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
                                  >
                                    <Play className="size-3 mr-1" />
                                    Luyện ngay
                                  </Button>
                                </Link>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => handleEditStart(item)}
                                className="text-[10px] h-7.5 px-2.5 font-bold border-border text-muted-foreground hover:bg-muted cursor-pointer"
                              >
                                <Edit2 className="size-3 mr-1" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => handleToggleArchive(item)}
                                className="text-[10px] h-7.5 px-2.5 font-bold border-border text-muted-foreground hover:bg-muted cursor-pointer"
                              >
                                {item.status === 'active' ? (
                                  <>
                                    <EyeOff className="size-3 mr-1" />
                                    Bỏ qua
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="size-3 mr-1" />
                                    Khôi phục
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => handleDelete(item.id)}
                                className="text-[10px] h-7.5 px-2.5 font-bold border-border text-muted-foreground hover:bg-muted hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                              >
                                <Trash2 className="size-3 mr-1" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-14 text-center max-w-sm mx-auto flex flex-col items-center gap-4.5">
                <div className="p-4 rounded-full bg-muted/65 text-muted-foreground">
                  <Inbox className="size-8" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-foreground">
                    {activeTab === 'ignored'
                      ? 'Không có lỗi bỏ qua'
                      : 'Sổ tay trống'}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {searchQuery.trim()
                      ? 'Không tìm thấy lỗi sai nào khớp với từ khóa tìm kiếm của bạn.'
                      : activeTab === 'ignored'
                        ? 'Bạn chưa bỏ qua lỗi sai nào.'
                        : selectedCategory === 'all' && selectedType === 'all'
                          ? 'Bạn chưa lưu lỗi sai nào vào Sổ tay. Các lỗi sai đề xuất sẽ xuất hiện sau khi bạn dùng Coach workflows.'
                          : 'Không tìm thấy lỗi sai nào khớp với bộ lọc đang chọn.'}
                  </p>
                </div>

                {/* Prepopulate Mock Data or Navigate buttons */}
                {selectedCategory === 'all' &&
                selectedType === 'all' &&
                !searchQuery.trim() ? (
                  <div className="flex flex-col gap-3.5 w-full mt-2">
                    {showMockMemoryData && (
                      <>
                        <Button
                          type="button"
                          onClick={handleGenerateMockData}
                          className="w-full text-xs font-bold py-4 bg-indigo-600 hover:bg-indigo-600/90 text-white shadow-md cursor-pointer rounded-lg border-none"
                        >
                          <Sparkles className="size-3.5 mr-2 animate-pulse" />
                          Dev: Tạo dữ liệu mẫu
                        </Button>
                        <div className="h-px bg-border/40 my-1 w-full" />
                      </>
                    )}

                    <Link href="/message" className="w-full">
                      <Button className="w-full text-xs font-semibold cursor-pointer py-4 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground shadow-xs">
                        Mở Email & Message Coach
                        <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                    <div className="flex gap-2 w-full">
                      <Link href="/explanation" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full text-2xs font-semibold cursor-pointer border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground h-8"
                        >
                          Document Coach
                        </Button>
                      </Link>
                      <Link href="/reading" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full text-2xs font-semibold cursor-pointer border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground h-8"
                        >
                          Reading Coach
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                    }}
                    className="text-xs font-semibold border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer mt-1 h-8"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </div>
        }
      />

      {/* Shared Confirmation Alert Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirm();
                setConfirmOpen(false);
              }}
            >
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
