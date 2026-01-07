import { redirect } from 'next/navigation';
import { z } from 'zod';
import { PaywallCTA } from '../../../../components/results/PaywallCTA';
import { TraitChart } from '../../../../components/results/TraitChart';
import { TraitSummary } from '../../../../components/results/TraitSummary';
import { getSupabaseAdminClient } from '../../../../lib/supabase';

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
  params: {
    resultId: string;
  };
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { resultId } = params;

  if (!resultIdSchema.safeParse(resultId).success) {
    redirect('/quiz');
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('results').select('id, traits').eq('id', resultId).single();

  const parsed = resultSchema.safeParse(data);
  if (error || !parsed.success) {
    redirect('/quiz');
  }

  const { traits } = parsed.data;

  return (
    <div className="results">
      <header className="results__header">
        <p className="eyebrow">Your results</p>
        <h1>Big Five personality snapshot</h1>
        <p className="muted">
          Here is a quick look at your scores. Each trait is scored from 0–100 based on the IPIP-120 assessment.
        </p>
      </header>

      <TraitChart scores={traits} />

      <PaywallCTA resultId={resultId} />

      <TraitSummary scores={traits} />
    </div>
  );
}
