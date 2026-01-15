import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '../app/globals.css';
import { Navbar } from '../components/figma/Navbar';

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
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        {plausibleDomain ? (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        ) : null}
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
