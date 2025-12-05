import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'POS Reengineered',
  description: 'Modern POS system rebuilt with NestJS + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F7FAF8] text-[#1A1F1C] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
