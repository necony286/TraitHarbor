import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ResultsDisplay } from '../../../../components/results/ResultsDisplay';
import { getSupabaseAdminClient } from '../../../../lib/supabase';
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
    title: 'Results | BigFive',
    description: 'Your Big Five personality results and next steps.',
    alternates: {
      canonical: `/results/${resultId}`
    },
    openGraph: {
      title: 'BigFive Results',
      description: 'Your Big Five personality results and next steps.',
      url: `/results/${resultId}`,
      siteName: 'BigFive'
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

  let supabase: ReturnType<typeof getSupabaseAdminClient>;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client for results page.', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return (
      <div className="results">
        <header className="results__header">
          <p className="eyebrow">Results unavailable</p>
          <h1>We couldn&apos;t load your results</h1>
          <p className="muted">Please return to the quiz and try again in a moment.</p>
        </header>
      </div>
    );
  }
  const { data, error } = await supabase.from('results').select('id, traits').eq('id', resultId).single();

  const parsed = resultSchema.safeParse(data);
  if (error || !parsed.success) {
    redirect('/quiz');
  }

  const { traits } = parsed.data;

  return <ResultsDisplay traits={traits} resultId={resultId} />;
}
