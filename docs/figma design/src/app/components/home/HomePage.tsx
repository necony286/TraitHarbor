import { Hero } from "@/app/components/home/Hero";
import { TrustRow } from "@/app/components/home/TrustRow";
import { HowItWorks } from "@/app/components/home/HowItWorks";
import { WhatYouGet } from "@/app/components/home/WhatYouGet";
import { CTASection } from "@/app/components/home/CTASection";
import { FAQ } from "@/app/components/home/FAQ";
import { Footer } from "@/app/components/home/Footer";

interface HomePageProps {
  onStartTest: () => void;
}

export function HomePage({ onStartTest }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Container for all sections */}
      <div className="container max-w-6xl mx-auto px-4">
        <Hero onStartTest={onStartTest} />
        <TrustRow />
      </div>

      <div className="container max-w-6xl mx-auto px-4">
        <HowItWorks />
      </div>

      <WhatYouGet />

      <CTASection onStartTest={onStartTest} />

      <FAQ />

      <Footer />
    </div>
  );
}