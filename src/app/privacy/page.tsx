import type { Metadata } from 'next';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';
import { Container } from '../../../components/ui/Container';

export const metadata: Metadata = {
  title: 'Privacy Policy | TraitHarbor',
  description: 'Privacy policy for the TraitHarbor personality assessment.',
  alternates: {
    canonical: canonicalUrl('/privacy')
  },
  openGraph: {
    title: 'Privacy Policy | TraitHarbor',
    description: 'Privacy policy for the TraitHarbor personality assessment.',
    url: ogUrl('/privacy'),
    siteName: 'TraitHarbor'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Privacy policy</p>
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-base text-slate-600">Draft outline for review. Summarizes how we handle quiz data and reports.</p>
      </header>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>Information we collect</li>
        <li>How we use your information</li>
        <li>Data storage &amp; retention</li>
        <li>Security practices</li>
        <li>Analytics &amp; cookies</li>
        <li>Third-party processors</li>
        <li>Your rights</li>
        <li>International transfers</li>
        <li>Contact</li>
      </ol>
    </Container>
  );
}
