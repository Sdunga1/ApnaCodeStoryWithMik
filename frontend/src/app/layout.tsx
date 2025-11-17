import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'codestorywithMIK - DSA Problem Roadmap',
  description: 'Master Data Structures & Algorithms with codestorywithMIK. Daily LeetCode problems, practice roadmap, and coding solutions.',
  keywords: ['DSA', 'LeetCode', 'Coding', 'Algorithms', 'Data Structures', 'Programming'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

