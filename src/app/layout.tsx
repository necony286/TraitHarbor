import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'BigFive',
  description: 'BigFive personality assessment experience',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'BigFive',
    description: 'Modern Big Five personality quiz and insights',
    url: 'https://example.com',
    siteName: 'BigFive'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="shell">
          <header className="shell__header">
            <p className="brand">BigFive</p>
            <nav aria-label="Primary">
              <a className="nav-link" href="#tokens">Design system</a>
              <a className="nav-link" href="#get-started">Get started</a>
            </nav>
          </header>
          <main className="shell__main">{children}</main>
          <footer className="shell__footer">
            <p className="muted">Built with accessibility, privacy, and research-backed scoring.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
