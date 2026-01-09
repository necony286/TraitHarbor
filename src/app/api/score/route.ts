import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loadQuizItems } from '../../../../lib/ipip';
import { getMissingAnswerIds, scoreAnswers } from '../../../../lib/scoring';
import { getSupabaseAdminClient } from '../../../../lib/supabase';

const scoreRequestSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5))
});

const isAnswerStorageError = (error?: { code?: string } | null) => {
  if (!error?.code) return false;
  return error.code.startsWith('XXA');
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = scoreRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body.',
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { answers } = parsed.data;
  const items = loadQuizItems();
  const allowedIds = new Set(items.map((item) => item.id));
  const sanitizedAnswers: Record<string, number> = {};
  const extraIds: string[] = [];

  for (const [id, value] of Object.entries(answers)) {
    if (allowedIds.has(id)) {
      sanitizedAnswers[id] = value;
    } else {
      extraIds.push(id);
    }
  }

  if (extraIds.length > 0) {
    return NextResponse.json(
      { error: 'Unexpected answers.', extra: extraIds },
      { status: 400 }
    );
  }

  const missing = getMissingAnswerIds(sanitizedAnswers, items);

  if (missing.length > 0) {
    return NextResponse.json({ error: 'Missing answers.', missing }, { status: 400 });
  }

  const result = scoreAnswers(sanitizedAnswers, items);

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client in score route.', error);
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }

  const { data: createdResultId, error: rpcError } = await supabase.rpc(
    'create_result_with_answers',
    {
      traits: result.traits,
      answers: sanitizedAnswers,
      expected_count: items.length
    }
  );

  if (rpcError || !createdResultId) {
    if (rpcError) {
      console.error('Failed to store result answers via RPC.', rpcError);
    }
    const errorMessage = isAnswerStorageError(rpcError)
      ? 'Failed to store answers.'
      : 'Failed to store results.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  return NextResponse.json({ resultId: createdResultId });
}
