import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-orbitron',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: 'ApnaCodestorywithMik - Story to Code',
  description:
    'Master Data Structures & Algorithms with ApnaCodestorywithMik. Daily LeetCode problems, practice roadmap, and coding solutions.',
  keywords: [
    'DSA',
    'LeetCode',
    'Coding',
    'Algorithms',
    'Data Structures',
    'Programming',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${rajdhani.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" offset="80px" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
