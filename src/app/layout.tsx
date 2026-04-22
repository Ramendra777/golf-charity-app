import type { Metadata } from 'next';
import { Epilogue, Plus_Jakarta_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const epilogue = Epilogue({
  variable: '--font-epilogue',
  subsets: ['latin'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fairway Impact Rewards | Golf. Charity. Win.',
  description:
    'A modern subscription platform combining golf performance tracking, monthly prize draws, and seamless charity fundraising. Subscribe. Score. Impact.',
  keywords: ['golf charity', 'stableford', 'prize draw', 'fundraising', 'golf subscription'],
  openGraph: {
    title: 'Fairway Impact Rewards',
    description: 'Play golf. Win prizes. Fund causes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${epilogue.variable} ${jakarta.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
