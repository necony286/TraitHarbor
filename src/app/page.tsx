import type { Metadata } from 'next';

import { HomePageClient } from '@/components/figma/home/HomePageClient';
import { canonicalUrl, ogUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/')
  },
  openGraph: {
    url: ogUrl('/')
  }
};

export default function Page() {
  return <HomePageClient />;
}
