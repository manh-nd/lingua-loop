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

export const messageSamples: MessageSample[] = [
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
];

export const explanationSamples: ExplanationSample[] = [
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
];
