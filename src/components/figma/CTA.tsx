import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '../../../components/ui/Container';

export function CTA() {
  return (
    <section id="cta" className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20">
      <Container className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Free forever • no signup required</span>
        </div>

        <h2 className="mt-8 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Ready to discover who you really are?
        </h2>
        <p className="mt-4 text-lg text-white/90">
          Join thousands of people who have unlocked insights about their personality. Take the quiz now and get instant
          results.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/quiz"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-purple-700 shadow-xl transition-all hover:shadow-2xl"
          >
            Start your quiz now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#questions"
            className="rounded-lg border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/20"
          >
            Preview questions
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/80">Takes about 15 minutes • 120 thoughtful prompts • Instant results</p>
      </Container>
    </section>
  );
}
