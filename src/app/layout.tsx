import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'BigFive',
  description: 'BigFive personality assessment experience',
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'BigFive',
    description: 'Modern Big Five personality quiz and insights',
    url: 'https://example.com',
    siteName: 'BigFive'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en">
      <body className={inter.className}>
        {plausibleDomain ? (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        ) : null}
        <div className="shell">
          <header className="shell__header">
            <Link href="/" className="brand">BigFive</Link>
            <nav aria-label="Primary">
              <Link className="nav-link" href="/quiz">
                Quiz
              </Link>
              <a className="nav-link" href="#tokens">Design system</a>
              <a className="nav-link" href="#get-started">Get started</a>
            </nav>
          </header>
          <main className="shell__main">{children}</main>
          <footer className="shell__footer">
            <div className="footer__content">
              <p className="muted">Built with accessibility, privacy, and research-backed scoring.</p>
              <nav className="footer__links" aria-label="Legal">
                <Link href="/terms" className="footer__link">
                  Terms
                </Link>
                <Link href="/privacy" className="footer__link">
                  Privacy
                </Link>
                <Link href="/cookies" className="footer__link">
                  Cookies
                </Link>
                <Link href="/disclaimer" className="footer__link">
                  Disclaimer
                </Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
