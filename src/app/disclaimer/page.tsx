import type { Metadata } from 'next';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';
import { Container } from '../../../components/ui/Container';

export const metadata: Metadata = {
  title: 'Disclaimer | TraitHarbor',
  description: 'Disclaimer for the TraitHarbor personality assessment.',
  alternates: {
    canonical: canonicalUrl('/disclaimer')
  },
  openGraph: {
    title: 'Disclaimer | TraitHarbor',
    description: 'Disclaimer for the TraitHarbor personality assessment.',
    url: ogUrl('/disclaimer'),
    siteName: 'TraitHarbor'
  }
};

export default function DisclaimerPage() {
  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Disclaimer</p>
        <h1 className="text-3xl font-bold text-slate-900">Disclaimer</h1>
        <p className="text-base text-slate-600">Draft outline for review. This assessment provides informational results only.</p>
      </header>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>Not medical advice</li>
        <li>Informational use only</li>
        <li>No guarantees</li>
        <li>Contact</li>
      </ol>
    </Container>
  );
}
