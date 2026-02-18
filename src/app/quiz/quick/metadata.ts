import type { Metadata } from 'next';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Quick Quiz | TraitHarbor',
  description: 'Complete the Quick IPIP-60 five-factor personality questionnaire.',
  alternates: {
    canonical: canonicalUrl('/quiz/quick')
  },
  openGraph: {
    title: 'TraitHarbor Quick Quiz',
    description: 'Complete the Quick IPIP-60 five-factor personality questionnaire.',
    url: ogUrl('/quiz/quick'),
    siteName: 'TraitHarbor'
  }
};
