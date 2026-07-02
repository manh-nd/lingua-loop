import { redirect } from 'next/navigation';

export default function MessageRedirectPage() {
  redirect('/workspace?preset=quick_message');
}
