import type { Metadata } from 'next';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Terms of Service | TraitHarbor',
  description: 'Terms of service for the TraitHarbor personality assessment.',
  alternates: {
    canonical: canonicalUrl('/terms')
  },
  openGraph: {
    title: 'Terms of Service | TraitHarbor',
    description: 'Terms of service for the TraitHarbor personality assessment.',
    url: ogUrl('/terms'),
    siteName: 'TraitHarbor'
  }
};

export default function TermsPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Terms of service</p>
        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
        <p className="text-base text-slate-600">Draft outline for review. Summarizes acceptable use and purchasing terms.</p>
      </header>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>Eligibility</li>
        <li>Account responsibilities</li>
        <li>Payment terms</li>
        <li>Refund policy</li>
        <li>Prohibited use</li>
        <li>Disclaimers</li>
        <li>Limitation of liability</li>
        <li>Governing law</li>
      </ol>
    </section>
  );
}
