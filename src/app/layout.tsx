import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import '../app/globals.css';
import { Navbar } from '../components/figma/Navbar';
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
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        {plausibleDomain ? (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        ) : null}
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200/70 bg-white/80 py-10">
            <Container className="flex flex-col gap-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-700">Built with accessibility, privacy, and research-backed scoring.</p>
                <p className="mt-2">Your answers stay private and can be cleared anytime.</p>
              </div>
              <nav className="flex flex-wrap gap-4" aria-label="Legal">
                <Link href="/terms" className="font-semibold text-slate-600 transition-colors hover:text-slate-900">
                  Terms
                </Link>
                <Link href="/privacy" className="font-semibold text-slate-600 transition-colors hover:text-slate-900">
                  Privacy
                </Link>
                <Link href="/cookies" className="font-semibold text-slate-600 transition-colors hover:text-slate-900">
                  Cookies
                </Link>
                <Link href="/disclaimer" className="font-semibold text-slate-600 transition-colors hover:text-slate-900">
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
