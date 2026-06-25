import 'dotenv/config';
import { createGeminiAiClient, sleep } from '@/core/ai/gemini-ai-client';
import { runExplanationCoach } from '@/core/explanation/explanation.workflow';
import { ExplanationCoachInput } from '@/core/explanation/explanation.schema';

const cases: ExplanationCoachInput[] = [
  {
    mode: 'write_from_vietnamese',
    purpose: 'explain_issue',
    tone: 'professional',
    length: 'medium',
    text: `Issue này xảy ra khi user mở màn hình detail sau khi data vừa được sync lại. Backend đôi khi trả về null cho field "owner", nhưng UI hiện tại đang assume field này luôn có value để render tên owner. Vì vậy app bị crash thay vì hiển thị fallback text. Tôi đã kiểm tra log thì thấy lỗi xảy ra ở component DetailHeader.`,
  },
  {
    mode: 'improve_english_draft',
    purpose: 'pr_description',
    tone: 'professional',
    length: 'medium',
    text: `This PR fix the crash in detail page. The problem happen when API return null owner after data sync. UI always expect owner has value and render owner.name directly. I add fallback value and null check in DetailHeader component. Now page will not crash and show "Unknown owner" instead.`,
  },
  {
    mode: 'write_from_vietnamese',
    purpose: 'explain_solution',
    tone: 'professional',
    length: 'detailed',
    text: `Giải pháp của tôi là không thay đổi contract của API ở giai đoạn này vì có thể ảnh hưởng tới các client khác. Thay vào đó, tôi xử lý null ở phía UI bằng cách thêm guard trước khi render owner name. Nếu owner bị null thì UI sẽ hiển thị fallback là "Unknown owner". Cách này nhỏ hơn, ít rủi ro hơn, và phù hợp với scope của bug fix hiện tại.`,
  },
  {
    mode: 'improve_english_draft',
    purpose: 'decision_explanation',
    tone: 'professional',
    length: 'medium',
    text: `I think we should not add worker now because this use case is not complex enough. If we add worker, we need Redis, retry logic, monitoring and more deployment config. For MVP, server action is enough and easier to debug. We can add worker later when generation is slow or need background processing.`,
  },
  {
    mode: 'write_from_vietnamese',
    purpose: 'requirement_description',
    tone: 'professional',
    length: 'detailed',
    text: `Khi user paste một đoạn tiếng Anh vào app, hệ thống cần phân tích nội dung và trả về phần giải thích bằng tiếng Việt. Kết quả cần bao gồm ý nghĩa tự nhiên, các cụm từ quan trọng, những chỗ dễ hiểu sai nếu dịch word-by-word, và một số câu hỏi luyện tập. Ở giai đoạn MVP, user chưa cần đăng nhập và dữ liệu có thể lưu local trước. Tuy nhiên thiết kế không nên khóa cứng vào local-only vì sau này có thể thêm memory và review theo user.`,
  },
  {
    mode: 'improve_english_draft',
    purpose: 'technical_explanation',
    tone: 'professional',
    length: 'detailed',
    text: `The message coach and explanation coach should not use same prompt because their purpose is different. Message coach optimize for short reply and natural tone. Explanation coach need longer structure, clear reasoning and sometimes bullet points. If we use one workflow for both, prompt will become too broad and output may be unstable. So I split them into two workflows but keep same AI client and mistake memory format.`,
  },
  {
    mode: 'write_from_vietnamese',
    purpose: 'decision_explanation',
    tone: 'direct',
    length: 'medium',
    text: `Tôi đề xuất chưa dùng Tiptap ở MVP. Hiện tại use case chính chỉ là nhập text, nhận kết quả, copy lại và lưu lỗi học tập. Nếu thêm rich editor quá sớm thì sẽ tăng độ phức tạp UI, state management và testing. Chúng ta có thể bắt đầu với textarea đơn giản, sau đó chỉ thêm editor khi thật sự cần inline editing hoặc accept/reject suggestions.`,
  },
  {
    mode: 'improve_english_draft',
    purpose: 'explain_issue',
    tone: 'professional',
    length: 'medium',
    text: `Currently the review page move to next card immediately after user submit answer. Because of that user cannot see feedback and don't know why answer is wrong. This make spaced repetition less useful. Expected behavior is after submit, app should show feedback first, then user click continue to move next card.`,
  },
  {
    mode: 'write_from_vietnamese',
    purpose: 'technical_explanation',
    tone: 'professional',
    length: 'detailed',
    text: `Hiện tại document view đang nằm trong Common UI và được serve thông qua backend proxy. Cách này vẫn hoạt động nhưng càng về lâu dài càng khó mở rộng vì document không còn là một phần nhỏ của UI nữa. Chúng ta muốn tách document view thành một standalone document service để có thể quản lý version, hỗ trợ nhiều format như PDF, Markdown và HTML, đồng thời có thể phát triển admin portal sau này. Tuy nhiên MVP không nên làm quá rộng. Giai đoạn đầu chỉ cần customer-facing portal để xem tài liệu hiện tại, dùng Keycloak để kiểm tra tenant và role, sau đó mới mở rộng sang admin portal và version management.`,
  },
];

async function main() {
  const aiClient = createGeminiAiClient();

  for (const input of cases) {
    console.log('\n==============================');
    console.log('INPUT:');
    console.log(input.text);

    try {
      const result = await runExplanationCoach(input, { aiClient });

      console.log('\nIMPROVED:');
      console.log(result.improvedText);

      console.log('\nSHORT VERSION:');
      console.log(result.shortVersion);

      if (result.detailedVersion) {
        console.log('\nDETAILED VERSION:');
        console.log(result.detailedVersion);
      }

      console.log('\nSTRUCTURE FEEDBACK:');
      console.dir(result.structureFeedback, { depth: null });

      console.log('\nCORRECTIONS:');
      console.dir(result.corrections, { depth: null });

      console.log('\nPHRASES:');
      console.dir(result.reusablePhrases, { depth: null });

      console.log('\nMISTAKES:');
      console.dir(result.mistakeCandidates, { depth: null });
    } catch (error) {
      console.error('\nFAILED CASE:');
      console.error(input.text);
      console.error(error);
    }

    await sleep(1_000);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
