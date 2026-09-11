import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://jens246.github.io/docket-clock/'),
  title: 'Docket Clock | How long did justice take?',
  description:
    'Guess how long famous civil cases took, then explore the procedural timeline.',
  openGraph: {
    title: 'Docket Clock',
    description: 'Guess how long famous civil cases took to move through the legal system.',
    type: 'website',
    url: 'https://jens246.github.io/docket-clock/',
    images: [{ url: 'og.png', width: 1734, height: 907, alt: 'Docket Clock, a civil litigation guessing game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docket Clock',
    description: 'Guess how long famous civil cases took to move through the legal system.',
    images: ['og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
