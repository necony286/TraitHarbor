import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loadQuizItems } from '../../../../lib/ipip';
import { getMissingAnswerIds, scoreAnswers } from '../../../../lib/scoring';
import { createResponseAndScores } from '../../../../lib/db';
import { enforceRateLimit } from '../../../../lib/rate-limit';

const scoreRequestSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  userId: z.string().uuid()
});

const isAnswerStorageError = (error?: { code?: string } | null) => {
  if (!error?.code) return false;
  return error.code.startsWith('XXA');
};

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'score',
    limit: 10,
    window: '1 m',
    mode: 'fail-open'
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

  const { answers, userId } = parsed.data;
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

  let createdResultId: string | null = null;
  let createError: { code?: string; message?: string } | null = null;

  try {
    const response = await createResponseAndScores({
      userId,
      answers: sanitizedAnswers,
      traits: result.traits,
      expectedCount: items.length
    });
    createdResultId = response.data;
    createError = response.error;
  } catch (error) {
    console.error('Failed to initialize Supabase admin client in score route.', error);
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }

  if (createError || !createdResultId) {
    if (createError) {
      console.error('Failed to store response via RPC.', createError);
    }
    const errorMessage = isAnswerStorageError(createError)
      ? 'Failed to store answers.'
      : 'Failed to store results.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  return NextResponse.json({ resultId: createdResultId });
}
