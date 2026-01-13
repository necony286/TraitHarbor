import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import '../app/globals.css';
import { Container } from '../../components/ui/Container';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'TraitHarbor',
  description: 'TraitHarbor personality assessment experience',
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'TraitHarbor',
    description: 'Modern five-factor personality quiz and insights',
    url: 'https://example.com',
    siteName: 'TraitHarbor'
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
          <header className="site-header">
            <Container className="site-header__content">
              <Link href="/" className="brand">TraitHarbor</Link>
              <nav className="site-nav" aria-label="Primary">
                <Link className="nav-link" href="/quiz">
                  Quiz
                </Link>
                <a className="nav-link" href="#questions">
                  Questions
                </a>
                <a className="nav-link" href="#tokens">
                  Design system
                </a>
              </nav>
              <div className="site-header__cta">
                <Link className="ui-button ui-button--secondary" href="/quiz">
                  Start quiz
                </Link>
              </div>
            </Container>
          </header>
          <main className="shell__main">{children}</main>
          <footer className="shell__footer">
            <Container className="footer__content">
              <div>
                <p className="muted">Built with accessibility, privacy, and research-backed scoring.</p>
                <p className="muted footer__note">Your answers stay private and can be cleared anytime.</p>
              </div>
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
            </Container>
          </footer>
        </div>
      </body>
    </html>
  );
}
