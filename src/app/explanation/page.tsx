import { redirect } from 'next/navigation';

export default function ExplanationRedirectPage() {
  redirect('/workspace?preset=explanation_spec');
}
