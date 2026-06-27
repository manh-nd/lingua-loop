import { runReadingCoach } from '@/core/reading/reading.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { ReadingCoachInput } from '@/core/reading/reading.schema';
import dotenv from 'dotenv';

dotenv.config();

const aiClient = createGeminiAiClient();

const cases: ReadingCoachInput[] = [
  {
    text: 'hey team, can you check my PR? i fixed the bug we discuss yesterday about login crash. let me know if it ok.',
    context:
      'Slack message from a developer on the team (has typos/awkward phrasing: "discuss", "it ok")',
  },
  {
    text: 'Dear team, please note that we are scheduled to deploy the payment gateway upgrade this Friday at 10 PM UTC. There might be a brief service interruption lasting up to 15 minutes. Please notify your clients accordingly if they raise any concerns regarding transaction failures during this window. Thanks for your cooperation.',
    context:
      'Email announcement from DevOps/Infrastructure team (formal, urgent)',
  },
  {
    text: "This implementation looks promising, but I am concerned about the database query inside the loop on line 143. If the active user list grows, this will cause a severe N+1 query problem and bottleneck performance. Could you refactor this to batch the query or fetch everything in a single SELECT? Let's discuss this before merging.",
    context: 'GitHub Pull Request review comment (constructive blocker)',
  },
  {
    text: 'We need to support auto-saving of drafts in the editor. The requirements are: 1. Save every 30 seconds if there are unsaved changes. 2. Show a small "Draft saved" indicator in the bottom status bar. 3. If saving fails, show an offline warning and retry after connection is restored. This is high priority for the Q3 release.',
    context:
      'Jira issue description / requirement spec (structured, non-response text)',
  },
];

async function main() {
  console.log('Running Reading Coach Evaluation...\n');
  for (const item of cases) {
    console.log('\n==================================================');
    console.log('INPUT TEXT:');
    console.log(`"${item.text}"`);
    console.log(`Context: ${item.context || 'None'}`);

    try {
      const result = await runReadingCoach(item, { aiClient });

      console.log('\nNATURAL TRANSLATION (VIETNAMESE):');
      console.log(result.naturalTranslation);

      console.log('\nSUMMARY:');
      console.log(result.summaryVi);

      console.log('\nTONE ANALYSIS:');
      console.log(`Tone: ${result.toneAnalysis.toneVi}`);
      console.log(`Implied: ${result.toneAnalysis.impliedMeaningVi}`);

      console.log('\nKEY PHRASES:');
      if (result.keyPhrases.length === 0) {
        console.log('(None)');
      } else {
        result.keyPhrases.forEach((p) => {
          console.log(`- "${p.phrase}": ${p.meaningVi}`);
          console.log(`  Usage: ${p.usageVi}`);
        });
      }

      console.log('\nWORD-BY-WORD TRAPS / MISUNDERSTANDINGS:');
      if (result.misunderstandingsVi.length === 0) {
        console.log('(None)');
      } else {
        result.misunderstandingsVi.forEach((m) => {
          console.log(`- Trap: "${m.trapVi}"`);
          console.log(`  Explanation: ${m.explanationVi}`);
        });
      }

      console.log('\nSOURCE ISSUES (TYPOS/AWKWARD TEXT):');
      if (result.sourceIssues.length === 0) {
        console.log('(None)');
      } else {
        result.sourceIssues.forEach((s) => {
          console.log(`- Original: "${s.originalText}"`);
          console.log(`  Category: ${s.category}`);
          console.log(`  Issue: ${s.issueVi}`);
          console.log(`  Suggested: "${s.suggestedFix}"`);
        });
      }

      console.log('\nREPLY SUGGESTIONS:');
      if (!result.replySuggestions || result.replySuggestions.length === 0) {
        console.log('(None or Not Needed)');
      } else {
        result.replySuggestions.forEach((r) => {
          console.log(`- "${r.text}"`);
          console.log(`  When to use: ${r.contextVi}`);
        });
      }
    } catch (error) {
      console.error('Error running case:', error);
    }
  }
}

main();
