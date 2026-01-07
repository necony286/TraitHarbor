import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loadQuizItems } from '../../../../lib/ipip';
import { getMissingAnswerIds, scoreAnswers } from '../../../../lib/scoring';
import { getSupabaseAdminClient } from '../../../../lib/supabase';

const scoreRequestSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5))
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = scoreRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { answers } = parsed.data;
  const items = loadQuizItems();
  const missing = getMissingAnswerIds(answers, items);

  if (missing.length > 0) {
    return NextResponse.json({ error: 'Missing answers.', missing }, { status: 400 });
  }

  const result = scoreAnswers(answers, items);

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  const { data: createdResult, error: resultError } = await supabase
    .from('results')
    .insert({ traits: result.traits })
    .select('id')
    .single();

  if (resultError || !createdResult) {
    return NextResponse.json({ error: 'Failed to store results.' }, { status: 500 });
  }

  const answerRows = items.map((item) => ({
    result_id: createdResult.id,
    question_id: item.id,
    answer: answers[item.id]
  }));

  const { error: answersError } = await supabase.from('result_answers').insert(answerRows);

  if (answersError) {
    return NextResponse.json({ error: 'Failed to store answers.' }, { status: 500 });
  }

  return NextResponse.json({ resultId: createdResult.id });
}
