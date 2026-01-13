import { CTA } from '../components/figma/CTA';
import { Hero } from '../components/figma/Hero';
import { TokenPreview } from '../../components/design-system/TokenPreview';
import { Card } from '../../components/ui/Card';
import { Container } from '../../components/ui/Container';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 pb-16">
      <Hero />

      <section id="questions" className="py-10">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Questions like…</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Thoughtful prompts, clear choices</h2>
            <p className="mt-4 text-base text-slate-600">
              Every prompt uses the same five-point agreement scale so you can move quickly without losing nuance.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-indigo-100/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Extraversion</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">I make friends easily.</h3>
              <p className="mt-3 text-sm text-slate-600">Pick from Strongly disagree → Strongly agree.</p>
            </Card>
            <Card className="border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-indigo-100/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conscientiousness</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">I follow through on plans.</h3>
              <p className="mt-3 text-sm text-slate-600">Take your time—answers autosave as you go.</p>
            </Card>
            <Card className="border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-indigo-100/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Neuroticism</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">I worry about things.</h3>
              <p className="mt-3 text-sm text-slate-600">No trick questions. Just honest reflections.</p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="tokens" className="py-10">
        <Container>
          <TokenPreview />
        </Container>
      </section>

      <CTA />
    </div>
  );
}
