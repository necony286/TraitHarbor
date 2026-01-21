import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Container } from '../../../components/ui/Container';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24 pt-20">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-slate-700">120 questions • ~15 min • no signup</span>
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Meet the TraitHarbor{' '}
            </span>
            <br />
            personality quiz
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            A friendly, research-backed walk through the IPIP-120 questionnaire with autosave, clear progress, and gentle
            guidance as you go.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Start the quiz
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://ipip.ori.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border-2 border-white bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-purple-200 hover:bg-purple-50"
            >
              About the five-factor model
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>100% Free • No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>5 traits • Based on IPIP-120</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>Autosave as you go</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border-8 border-white/50 shadow-2xl">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Questions like…</h2>
                  <p className="mt-2 text-slate-600">You’ll rate how much you agree with each statement.</p>
                </div>
                <div className="space-y-3 text-sm font-medium text-slate-700">
                  <div className="rounded-lg border border-indigo-200 bg-white/80 px-4 py-3">
                    “I feel energized when meeting new people.”
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-white/80 px-4 py-3">
                    “I keep my workspace organized.”
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-white/80 px-4 py-3">
                    “I stay calm under pressure.”
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>5-point scale</span>
                <span>Neutral is always okay</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div className="pointer-events-none absolute top-0 left-0 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-300/30 blur-3xl animate-blob animation-delay-4000" />
    </section>
  );
}
