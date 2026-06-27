export type MessageSample = {
  id: string;
  label: string;
  mode: 'write_from_vietnamese' | 'improve_english_draft';
  text: string;
  tone: 'friendly' | 'polite' | 'direct' | 'professional' | 'casual';
};

export type ExplanationSample = {
  id: string;
  label: string;
  mode: 'write_from_vietnamese' | 'improve_english_draft';
  text: string;
  tone: 'friendly' | 'polite' | 'direct' | 'professional' | 'casual';
  purpose:
    | 'explain_issue'
    | 'explain_solution'
    | 'pr_description'
    | 'technical_explanation'
    | 'requirement_description'
    | 'decision_explanation'
    | 'general_explanation';
  length?: 'short' | 'medium' | 'detailed';
};
export type ReadingSample = {
  id: string;
  label: string;
  text: string;
  context?: string;
};

export const messageSamples: MessageSample[] = [
  // Vietnamese Drafts
  {
    id: 'pr-review',
    label: 'Nhờ review PR',
    mode: 'write_from_vietnamese',
    text: 'Nhờ đồng nghiệp review giúp cái PR này nhé, mình đã sửa hết các comment hôm qua rồi.',
    tone: 'friendly',
  },
  {
    id: 'issue-status',
    label: 'Hỏi issue fix chưa',
    mode: 'write_from_vietnamese',
    text: 'Hỏi xem cái bug crash app khi đăng nhập hôm qua đã được sửa xong chưa.',
    tone: 'polite',
  },
  {
    id: 'follow-up',
    label: 'Nhắc follow up nhẹ',
    mode: 'write_from_vietnamese',
    text: 'Nhắc khéo bên đối tác gửi lại tài liệu API mà họ hẹn gửi từ đầu tuần.',
    tone: 'friendly',
  },
  {
    id: 'confirm-req',
    label: 'Xin confirm requirement',
    mode: 'write_from_vietnamese',
    text: 'Xin xác nhận lại với khách hàng về tiến trình thay đổi UI của trang thanh toán.',
    tone: 'professional',
  },

  // English Drafts
  {
    id: 'en-late-task',
    label: 'Báo cáo task trễ',
    mode: 'improve_english_draft',
    text: 'Sorry, I cannot finish the task today. Because code have many bug and server is down. I will do it tomorrow.',
    tone: 'polite',
  },
  {
    id: 'en-pr-review',
    label: 'Nhờ review PR',
    mode: 'improve_english_draft',
    text: 'Hey please check my PR, I fixed the code like you say yesterday. Tell me if it is ok.',
    tone: 'friendly',
  },
  {
    id: 'en-api-followup',
    label: 'Nhắc gửi tài liệu API',
    mode: 'improve_english_draft',
    text: 'You promised to send API doc on Monday but now Friday and I have nothing. Please send it fast.',
    tone: 'professional',
  },
  {
    id: 'en-clarification',
    label: 'Làm rõ requirement UI',
    mode: 'improve_english_draft',
    text: 'I do not understand the new UI design. You want me to change the color of checkout button or background?',
    tone: 'professional',
  },
];

export const explanationSamples: ExplanationSample[] = [
  // Vietnamese Drafts
  {
    id: 'bug-description',
    label: 'Mô tả bug',
    mode: 'write_from_vietnamese',
    text: 'Khi nhấn nút checkout thì màn hình loading vô tận. API /checkout phản hồi chậm hơn 10s dẫn đến timeout.',
    tone: 'professional',
    purpose: 'explain_issue',
    length: 'medium',
  },
  {
    id: 'pr-description',
    label: 'Viết PR description',
    mode: 'write_from_vietnamese',
    text: 'PR này bổ sung tính năng tự động xoay vòng API key khi gặp lỗi rate limit. Đã thêm unit tests cho key pool.',
    tone: 'professional',
    purpose: 'pr_description',
    length: 'medium',
  },
  {
    id: 'tech-decision',
    label: 'Giải thích decision',
    mode: 'write_from_vietnamese',
    text: 'Quyết định dùng lưu trữ tạm thời trong bộ nhớ (InMemory) vì lượng truy cập giai đoạn MVP thấp, chưa cần setup Redis.',
    tone: 'professional',
    purpose: 'decision_explanation',
    length: 'medium',
  },
  {
    id: 'requirement-doc',
    label: 'Mô tả requirement',
    mode: 'write_from_vietnamese',
    text: 'Yêu cầu: Thiết kế màn hình ôn tập lỗi sai (Spaced Review) hiển thị các Mistake Candidates đã lưu theo thuật toán ghi nhớ.',
    tone: 'professional',
    purpose: 'requirement_description',
    length: 'detailed',
  },

  // English Drafts
  {
    id: 'en-bug-desc',
    label: 'Mô tả bug',
    mode: 'improve_english_draft',
    text: 'When user click checkout, it show loading long time and then error timeout. Maybe API /checkout slow.',
    tone: 'professional',
    purpose: 'explain_issue',
    length: 'medium',
  },
  {
    id: 'en-pr-desc',
    label: 'Viết PR description',
    mode: 'improve_english_draft',
    text: 'This PR adds key rotation. When rate limit hit, it swap key automatically. I also write tests for it.',
    tone: 'professional',
    purpose: 'pr_description',
    length: 'medium',
  },
  {
    id: 'en-redis-choice',
    label: 'Giải thích decision',
    mode: 'improve_english_draft',
    text: 'We use Redis for session caching because it is fast and supports TTL. We do not use database because it is slow.',
    tone: 'professional',
    purpose: 'decision_explanation',
    length: 'medium',
  },
  {
    id: 'en-ui-req',
    label: 'Mô tả requirement',
    mode: 'improve_english_draft',
    text: 'The review screen must show mistake cards. It must use spaced repetition algorithm so user can remember mistakes.',
    tone: 'professional',
    purpose: 'requirement_description',
    length: 'detailed',
  },
];

export const readingSamples: ReadingSample[] = [
  {
    id: 'slack-pr-typo',
    label: 'Slack PR (Có lỗi)',
    text: 'hey team, can you check my PR? i fixed the bug we discuss yesterday about login crash. let me know if it ok.',
    context: 'Slack message từ một developer trên team',
  },
  {
    id: 'email-deploy',
    label: 'Email thông báo bảo trì',
    text: 'Dear team, please note that we are scheduled to deploy the payment gateway upgrade this Friday at 10 PM UTC. There might be a brief service interruption lasting up to 15 minutes. Please notify your clients accordingly if they raise any concerns regarding transaction failures during this window.',
    context: 'Email thông báo từ team DevOps',
  },
  {
    id: 'github-comment',
    label: 'GitHub review comment',
    text: "This implementation looks promising, but I am concerned about the database query inside the loop on line 143. If the active user list grows, this will cause a severe N+1 query problem and bottleneck performance. Could you refactor this to batch the query or fetch everything in a single SELECT? Let's discuss this before merging.",
    context: 'Comment từ đồng nghiệp khi review Pull Request',
  },
  {
    id: 'jira-spec',
    label: 'Mô tả task (Jira spec)',
    text: 'We need to support auto-saving of drafts in the editor. The requirements are: 1. Save every 30 seconds if there are unsaved changes. 2. Show a small "Draft saved" indicator in the bottom status bar. 3. If saving fails, show an offline warning and retry after connection is restored.',
    context: 'Nội dung mô tả yêu cầu tính năng trên Jira',
  },
];
