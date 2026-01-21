'use client';

import { FAQ } from '@/components/figma/home/FAQ';
import { Footer } from '@/components/figma/home/Footer';
import { Hero } from '@/components/figma/home/Hero';
import { HowItWorks } from '@/components/figma/home/HowItWorks';
import { TrustRow } from '@/components/figma/home/TrustRow';
import { WhatYouGet } from '@/components/figma/home/WhatYouGet';
import { Container } from '../../../../components/ui/Container';

interface HomePageProps {
  onStartTest: () => void;
}

export function HomePage({ onStartTest }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Container>
        <Hero onStartTest={onStartTest} />
        <TrustRow />
      </Container>

      <Container>
        <HowItWorks />
      </Container>

      <WhatYouGet />

      <FAQ />

      <Footer />
    </div>
  );
}
