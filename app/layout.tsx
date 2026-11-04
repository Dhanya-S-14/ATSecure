import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/components/ThemeInitializer';

export const metadata: Metadata = {
  title: 'ATSecure — AI-Powered Resume Intelligence & Career Roadmap',
  description: 'Analyze your resume, discover missing keywords, understand your ATS score, and follow a personalized career roadmap for the jobs you actually want.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full scroll-smooth">
      <body
        suppressHydrationWarning
        className="h-full min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white transition-colors duration-200"
      >
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
