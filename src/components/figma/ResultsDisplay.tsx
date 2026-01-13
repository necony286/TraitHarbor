import type { ReactNode } from 'react';
import { TRAIT_DETAILS, TRAIT_ORDER, type TraitScores } from '../../../components/results/traitData';

interface ResultsDisplayProps {
  traits: TraitScores;
  children: ReactNode;
}

export function ResultsDisplay({ traits, children }: ResultsDisplayProps) {
  const keyTraits = [...TRAIT_ORDER]
    .map((trait) => ({
      id: trait,
      label: TRAIT_DETAILS[trait].label,
      score: traits[trait] ?? 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-indigo-100/50 backdrop-blur">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg">
            Your results
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">TraitHarbor personality snapshot</h1>
          <p className="mt-3 text-base text-slate-600">
            Here is a quick look at your scores. Each trait is scored from 0–100 based on the IPIP-120 assessment.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-left text-lg font-semibold text-slate-900">Your key traits</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {keyTraits.map((trait, index) => (
              <div
                key={trait.id}
                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span>{trait.label}</span>
                <span className="text-indigo-600">{Math.round(trait.score)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
