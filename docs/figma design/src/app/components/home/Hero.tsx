import { ArrowRight } from "lucide-react";
import { ReportPreviewCard } from "@/app/components/home/ReportPreviewCard";

interface HeroProps {
  onStartTest: () => void;
}

export function Hero({ onStartTest }: HeroProps) {
  return (
    <section className="pt-16 pb-12 lg:pt-24 lg:pb-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Hero content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium leading-tight tracking-tight text-foreground">
              See your Big Five profile with a Quick flow.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              120 questions • Instant results • Full report unlock $3
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onStartTest}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#2563eb] text-white rounded-xl font-medium shadow-lg shadow-[#2563eb]/25 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#2563eb]/30 active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
            >
              Start the test
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
            <p className="text-sm text-muted-foreground">
              No signup required • Private by default
            </p>
          </div>
        </div>

        {/* Right: Report preview */}
        <div className="lg:pl-8">
          <ReportPreviewCard />
        </div>
      </div>
    </section>
  );
}
