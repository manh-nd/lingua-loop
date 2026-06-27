import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reading Coach - Lingua Loop',
  description:
    'Understand workplace English text in context. Identify tone, key phrases, and source issues.',
};

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
