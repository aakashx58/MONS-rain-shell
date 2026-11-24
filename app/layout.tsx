import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MONS — Field System 08',
  description: 'MONS rain shell system. Hover to unmask.',
  openGraph: {
    title: 'MONS — Field System 08',
    description: 'MONS rain shell system. Hover to unmask.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MONS — Field System 08',
    description: 'MONS rain shell system. Hover to unmask.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="js-anim" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
