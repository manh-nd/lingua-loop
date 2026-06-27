import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explanation Coach - Lingua Loop',
  description:
    'Polish longer workplace writing for clarity and structure. Optimized for PR descriptions, tech specs, and requirement descriptions.',
};

export default function ExplanationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
