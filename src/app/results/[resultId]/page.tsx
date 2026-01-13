import React from 'react';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ResultsDisplay } from '../../../../components/results/ResultsDisplay';
import { Container } from '../../../../components/ui/Container';
import { getScoresByResultId } from '../../../../lib/db';
import resultsFixture from '../../../data/results.fixture.json';

const resultIdSchema = z.string().uuid();
const traitSchema = z.object({
  O: z.number(),
  C: z.number(),
  E: z.number(),
  A: z.number(),
  N: z.number()
});

const resultSchema = z.object({
  id: z.string().uuid(),
  traits: traitSchema
});

type ResultsPageProps = {
  params: Promise<{
    resultId: string;
  }>;
};

export async function generateMetadata({ params }: ResultsPageProps) {
  const { resultId } = await params;
  return {
    title: 'Results | TraitHarbor',
    description: 'Your TraitHarbor personality results and next steps.',
    alternates: {
      canonical: `/results/${resultId}`
    },
    openGraph: {
      title: 'TraitHarbor Results',
      description: 'Your TraitHarbor personality results and next steps.',
      url: `/results/${resultId}`,
      siteName: 'TraitHarbor'
    }
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { resultId } = await params;

  if (!resultIdSchema.safeParse(resultId).success) {
    redirect('/quiz');
  }

  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  if (useFixture) {
    const fixtureResult = resultSchema.safeParse({ id: resultId, traits: resultsFixture });
    if (!fixtureResult.success) {
      redirect('/quiz');
    }

    const { traits } = fixtureResult.data;

    return <ResultsDisplay traits={traits} resultId={resultId} />;
  }

  try {
    const { data, error } = await getScoresByResultId(resultId);

    if (error) {
      console.error('Failed to load scores for results page.', {
        message: error.message
      });
      redirect('/quiz');
    }

    if (data) {
      const parsed = resultSchema.safeParse({ id: resultId, traits: data });
      if (parsed.success) {
        return <ResultsDisplay traits={parsed.data.traits} resultId={resultId} />;
      }
    }

    redirect('/quiz');
  } catch (error) {
    console.error('Failed to initialize Supabase admin client for results page.', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return (
    <Container className="py-16">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl shadow-indigo-100/40">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Results unavailable</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">We couldn&apos;t load your results</h1>
        <p className="mt-3 text-base text-slate-600">Please return to the quiz and try again in a moment.</p>
      </div>
    </Container>
  );
}
