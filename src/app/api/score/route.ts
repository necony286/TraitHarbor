import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loadQuizItems, resolveQuizVariant } from '../../../../lib/ipip';
import { scoreAnswers } from '../../../../lib/scoring';
import { createResponseAndScores } from '../../../../lib/db';
import { enforceRateLimit } from '../../../../lib/rate-limit';

const scoreRequestSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  userId: z.string().uuid(),
  quizVariant: z.enum(['ipip120', 'ipip60']).optional()
});

const isAnswerStorageError = (error?: { code?: string } | null) => {
  if (!error?.code) return false;
  return error.code.startsWith('XXA');
};

const getIdSet = (ids: string[]) => new Set(ids);

const getAnswerSetMismatch = ({
  submittedIds,
  expectedIds
}: {
  submittedIds: string[];
  expectedIds: string[];
}) => {
  const submittedSet = getIdSet(submittedIds);
  const expectedSet = getIdSet(expectedIds);

  const missing = expectedIds.filter((id) => !submittedSet.has(id));
  const extra = submittedIds.filter((id) => !expectedSet.has(id));

  return { missing, extra };
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
  const quizVariant = resolveQuizVariant(parsed.data.quizVariant);
  const items = loadQuizItems({ variant: quizVariant });
  const submittedIds = Object.keys(answers);
  const expectedIds = items.map((item) => item.id);
  const { missing, extra } = getAnswerSetMismatch({ submittedIds, expectedIds });

  if (missing.length > 0 || extra.length > 0) {
    return NextResponse.json(
      {
        error: 'Answer IDs must exactly match quiz items for this quiz variant.',
        quizVariant,
        missing,
        extra
      },
      { status: 400 }
    );
  }

  const result = scoreAnswers(answers, items);

  let createdResultId: string | null = null;
  let createError: { code?: string; message?: string } | null = null;

  try {
    const response = await createResponseAndScores({
      userId,
      answers,
      traits: result.traits,
      facetScores: result.facetScores,
      expectedCount: items.length,
      quizVariant
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

  return NextResponse.json({ resultId: createdResultId, quizVariant });
}
