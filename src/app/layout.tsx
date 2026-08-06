import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DKB Knowledge Base',
  description: 'Die Befreiung Kurs - Knowledge Base',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
