import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ReportPreviewCard } from '@/components/figma/home/ReportPreviewCard';

export function Hero() {
  return (
    <section id="hero" className="pt-16 pb-12 lg:pt-24 lg:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium leading-tight tracking-tight text-foreground lg:text-5xl xl:text-6xl">
              Choose your Big Five path and get clear personality insights.
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Start with Quick (60) for a concise overview, or take Pro (120) for deeper detail.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quiz/quick"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Take the Quick quiz
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/quiz"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Go deeper (Pro)
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">No signup required • Private by default</p>
          </div>
        </div>

        <div className="lg:pl-8">
          <ReportPreviewCard />
        </div>
      </div>
    </section>
  );
}
