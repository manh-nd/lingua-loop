import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Message Coach - Lingua Loop',
  description:
    'Turn workplace intentions into natural English messages. Optimized for tone and concise output.',
};

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
