import { FAQ } from '@/components/figma/home/FAQ';
import { Footer } from '@/components/figma/home/Footer';
import { Hero } from '@/components/figma/home/Hero';
import { HowItWorks } from '@/components/figma/home/HowItWorks';
import { TrustRow } from '@/components/figma/home/TrustRow';
import { WhatYouGet } from '@/components/figma/home/WhatYouGet';

interface HomePageProps {
  onStartTest: () => void;
}

export function HomePage({ onStartTest }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4">
        <Hero onStartTest={onStartTest} />
        <TrustRow />
      </div>

      <div className="container max-w-6xl mx-auto px-4">
        <HowItWorks />
      </div>

      <WhatYouGet />

      <FAQ />

      <Footer />
    </div>
  );
}
