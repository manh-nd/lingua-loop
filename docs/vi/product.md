# Định hướng sản phẩm Lingua Loop

Tài liệu này là bản tiếng Việt đi kèm để giải thích định hướng sản phẩm. Source of truth chính vẫn là [docs/product.md](../product.md).

## Lời hứa cốt lõi

Lingua Loop giúp người Việt đi làm cải thiện tiếng Anh công việc bằng cách học từ chính những lần được sửa trong ngữ cảnh thật.

Sản phẩm xoay quanh Active Correction Loop:

1. Người dùng viết, nói, hoặc đọc tiếng Anh công việc.
2. AI sửa hoặc giải thích theo ngữ cảnh.
3. AI chỉ ra những gì đã thay đổi và vì sao.
4. AI đề xuất các MemoryCandidate đáng lưu.
5. Người dùng Save, Edit, hoặc Ignore từng đề xuất.
6. MemoryItem đã lưu ảnh hưởng đến các lần sửa và luyện tập sau.
7. Người dùng luyện lại bằng bài tập viết hoặc nói chủ động.

## Các bề mặt sản phẩm chính

Correction Workspace và Live Coach là hai primary surfaces dài hạn.

Correction Workspace được ưu tiên trước vì nó xây nền tảng cho toàn bộ loop: CorrectionSession, MemoryCandidate, MemoryItem, history, và Practice theo hướng writing-first.

Live Coach vẫn là bề mặt chính cho speaking. Về dài hạn, Live Coach sẽ dùng MemoryItem của người dùng để tạo các buổi luyện nói cá nhân hóa hơn và tạo MemoryCandidate sau mỗi buổi nói.

Reading Coach là secondary surface. Nó giúp hiểu tiếng Anh của người khác và lưu vocabulary, reusable phrase, tone pattern đáng học. Nếu đó không phải draft của người dùng, Reading Coach không nên tạo Mistake candidate.

## Correction Workspace

Correction Workspace thay thế Message Coach và Explanation Coach như hai workflow riêng. Các workflow cũ trở thành preset:

- Quick Message
- Email
- PR/Jira Comment
- Documentation
- Explanation/Spec

Kết quả mặc định chỉ hiển thị một bản sửa chính. Nếu chưa hài lòng, người dùng refine bằng các lựa chọn như More concise, More polite, More direct, More natural, Simpler English, hoặc Custom instruction.

Kết quả gồm ba phần:

1. Improved Version: bản sửa chính, copy dùng ngay.
2. What Changed & Why: các điểm thay đổi quan trọng và lý do.
3. Suggested Memories: tối đa ba MemoryCandidate để Save, Edit, hoặc Ignore.

Mặc định là meaning-preserving correction: AI được sửa grammar, word choice, collocation, structure, clarity, tone, nhưng không tự thêm ý mới nếu người dùng không yêu cầu.

## Memory

Learning data phải lưu trong database. localStorage không còn là source of truth cho MemoryCandidate, MemoryItem, CorrectionSession, Live learning data, hoặc Practice data.

MemoryCandidate là đề xuất học tập của AI, có thể đang pending, saved, hoặc ignored.

MemoryItem là điểm học đã được người dùng chấp nhận lưu. Bốn loại MemoryItem cốt lõi:

- Mistake
- Reusable Phrase
- Vocabulary
- Tone Pattern

MemoryItem nên lưu ví dụ ngắn, cá nhân hóa từ correction thật, thay vì lưu cả email hay tài liệu dài nếu không cần thiết.

## Practice

Practice thay cho cách gọi Review cũ. Mặc định không phải flashcard hay trắc nghiệm. Hướng chính là active writing practice:

- Mistake: sửa câu có lỗi tương tự.
- Reusable Phrase: viết câu công việc dùng phrase đó.
- Vocabulary: dùng từ/cụm từ trong ngữ cảnh công việc.
- Tone Pattern: viết lại câu theo tone mục tiêu.

## App Structure

Routes mới:

- `/` Dashboard overview
- `/workspace` Correction Workspace
- `/live` Live Coach
- `/memory` Suggested và Saved memories
- `/practice` Writing-first active practice
- `/reading` Reading Coach
- `/settings` Account, defaults, và data controls

Desktop nên dùng sidebar app shell. Mobile dùng sheet/drawer navigation.

## Roadmap

Phase 1: Active Correction Foundation

- Dashboard app shell.
- Correction Workspace.
- DB-backed CorrectionSession.
- DB-backed MemoryCandidate.
- DB-backed MemoryItem.
- Correction History.
- Basic Memory-aware correction.
- Writing-first Practice.
- Minimal Settings.
- Sẵn sàng deploy để dùng cá nhân trên nhiều thiết bị.

Phase 2: Memory-Aware Live Coach

- Live sessions dùng MemoryItem liên quan.
- Post-call reports tạo MemoryCandidate.
- Speaking Practice cho MemoryItem đến hạn.

Phase 3: Rich Workspace and Reading Practice

- WYSIWYG/Notion-like editor.
- Better history/search.
- Reading Turn into Practice.

Phase 4: Intelligence and Personalization

- Embedding-based Memory retrieval.
- Personalized learning profile.
- Better scheduling.
- Analytics nếu thật sự giúp learning loop.
