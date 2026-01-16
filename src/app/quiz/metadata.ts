import type { Metadata } from 'next';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Quiz | TraitHarbor',
  description: 'Complete the IPIP-120 five-factor personality questionnaire.',
  alternates: {
    canonical: canonicalUrl('/quiz')
  },
  openGraph: {
    title: 'TraitHarbor Quiz',
    description: 'Complete the IPIP-120 five-factor personality questionnaire.',
    url: ogUrl('/quiz'),
    siteName: 'TraitHarbor'
  }
};
