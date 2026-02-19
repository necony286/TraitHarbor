import Link from 'next/link';

const OPTIONS = [
  {
    title: 'Quick quiz (60)',
    summary: 'A concise Big Five snapshot for fast self-reflection.',
    trustNote: 'Great for a focused overview without extra depth.',
    href: '/quiz/quick',
    cta: 'Start Quick'
  },
  {
    title: 'Pro quiz (120)',
    summary: 'The full IPIP-120 path with richer trait detail.',
    trustNote: 'Best when you want more context before reading your report.',
    href: '/quiz',
    cta: 'Start Pro'
  }
] as const;

export function QuizOptions() {
  return (
    <section id="quiz-options" className="py-12 lg:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-medium text-foreground lg:text-4xl">Pick the quiz that fits your goal</h2>
        <p className="mt-3 text-base text-muted-foreground">Your responses stay private, and both paths give instant Big Five results.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {OPTIONS.map((option) => (
          <article key={option.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-medium text-foreground">{option.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{option.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{option.trustNote}</p>
            <Link
              href={option.href}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {option.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
