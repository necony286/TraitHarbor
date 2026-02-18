import { z } from 'zod';
import { PG_FOREIGN_KEY_VIOLATION_ERROR_CODE } from './db/constants';
import { logWarn } from './logger';
import { OrderStatus, orderDetailSchema, orderSchema } from './orders';
import { FacetScores, TraitScores } from './scoring';
import { getSupabaseAdminClient } from './supabase';
import { QuizVariant, resolveQuizVariant } from './ipip';

const traitSchema = z.object({
  O: z.number(),
  C: z.number(),
  E: z.number(),
  A: z.number(),
  N: z.number(),
});

const scoreRowSchema = z.object({
  response_id: z.string().uuid(),
  traits: traitSchema,
  quiz_variant: z.enum(['ipip120', 'ipip60']).optional().nullable(),
});

const facetScoresSchema = z.record(z.record(z.number()));

const orderIdSchema = z.string().uuid();

type DbError = {
  message: string;
  code?: string;
};

type DbResult<T> = {
  data: T | null;
  error: DbError | null;
};

type OrderLookup = {
  orderId?: string;
  paddleOrderId?: string;
};

type CreateResponseParams = {
  userId: string;
  answers: Record<string, number>;
  traits: TraitScores;
  facetScores?: FacetScores | null;
  expectedCount: number;
  quizVariant: QuizVariant;
};

export type ScoresWithVariant = {
  traits: TraitScores;
  quizVariant: QuizVariant;
};

type CreateOrderParams = {
  userId: string;
  responseId: string;
  amountCents: number;
  reportAccessTokenHash: string;
  email?: string | null;
  provider?: string | null;
  providerSessionId?: string | null;
};

type UpdateOrderStatusParams = {
  orderId: string;
  status: OrderStatus;
};

type WebhookUpdateParams = {
  orderId: string;
  status: 'paid' | 'failed';
  paddleOrderId?: string;
  paddleTransactionId?: string;
  customerEmail?: string;
};

type ReportAssetParams = {
  orderId: string;
  userId: string;
  reportPath: string;
  kind: 'report_pdf';
};

type ReportAccessLinkParams = {
  email: string;
  orderId: string;
  tokenHash: string;
  expiresAt: string;
};

const normalizeTimestamp = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  let normalized = value.replace(' ', 'T');

  if (normalized.endsWith('Z')) {
    return normalized;
  }

  normalized = normalized.replace(/([+-]\d{2})$/, '$1:00');

  return normalized;
};

const reportAccessLinkTimestampSchema = z.preprocess(
  normalizeTimestamp,
  z.string().datetime({ offset: true })
);

export const reportAccessLinkSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  order_id: z.string().uuid().nullable().optional(),
  token_hash: z.string(),
  expires_at: reportAccessLinkTimestampSchema,
  used_at: reportAccessLinkTimestampSchema.nullable().optional(),
  created_at: reportAccessLinkTimestampSchema,
});

const PAID_ORDER_COLUMNS =
  'id, status, amount_cents, response_id, paddle_order_id, created_at, report_access_token_hash, user_id, email, provider, provider_session_id, report_id, results_snapshot_id, report_file_key, paid_at, updated_at, quiz_variant';

const REPORT_ACCESS_LINK_COLUMNS_ARRAY = [
  'id',
  'email',
  'order_id',
  'token_hash',
  'expires_at',
  'used_at',
  'created_at',
];
const REPORT_ACCESS_LINK_COLUMNS = REPORT_ACCESS_LINK_COLUMNS_ARRAY.join(', ');

const ensureUserRecord = async (userId: string): Promise<DbError | null> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId }, { onConflict: 'id' });
  if (error) {
    return { message: error.message, code: error.code };
  }
  return null;
};

const mapDbError = (error: unknown, fallback: string): DbError => {
  if (error && typeof error === 'object' && 'message' in error) {
    const record = error as { message: string; code?: string };
    return { message: record.message, code: record.code };
  }
  return { message: fallback };
};

export const createResponseAndScores = async ({
  userId,
  answers,
  traits,
  facetScores,
  expectedCount,
  quizVariant,
}: CreateResponseParams): Promise<DbResult<string>> => {
  const userError = await ensureUserRecord(userId);
  if (userError) {
    return { data: null, error: userError };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc('create_response_with_scores', {
    user_id: userId,
    answers,
    traits,
    facet_scores: facetScores ?? null,
    expected_count: expectedCount,
    quiz_variant: quizVariant,
  });

  if (error || !data) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to create response.'),
    };
  }

  if (typeof data !== 'string') {
    return { data: null, error: { message: 'Invalid response id.' } };
  }

  return { data, error: null };
};

export const getScoresAndQuizVariantByResultId = async (
  resultId: string
): Promise<DbResult<ScoresWithVariant>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('scores')
    .select('response_id, traits, quiz_variant')
    .eq('response_id', resultId)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to fetch scores.') };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = scoreRowSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return {
    data: {
      traits: parsed.data.traits,
      quizVariant: resolveQuizVariant(parsed.data.quiz_variant),
    },
    error: null,
  };
};

export const getScoresByResultId = async (
  resultId: string
): Promise<DbResult<TraitScores>> => {
  const { data, error } = await getScoresAndQuizVariantByResultId(resultId);

  if (error || !data) {
    return { data: data?.traits ?? null, error };
  }

  return { data: data.traits, error: null };
};

export const getFacetScoresByResultId = async (
  resultId: string
): Promise<DbResult<FacetScores>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('scores')
    .select('response_id, facet_scores')
    .eq('response_id', resultId)
    .maybeSingle();

  if (error) {
    // PostgreSQL error code for "undefined column"
    if (error.code === '42703' && error.message.includes('facet_scores')) {
      return { data: null, error: null };
    }
    return {
      data: null,
      error: mapDbError(error, 'Failed to fetch facet scores.'),
    };
  }

  if (!data || !('facet_scores' in data) || data.facet_scores === null) {
    return { data: null, error: null };
  }

  const parsed = facetScoresSchema.safeParse(data.facet_scores);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const createProvisionalOrder = async ({
  userId,
  responseId,
  amountCents,
  reportAccessTokenHash,
  email,
  provider,
  providerSessionId,
}: CreateOrderParams): Promise<DbResult<z.infer<typeof orderSchema>>> => {
  const userError = await ensureUserRecord(userId);
  if (userError) {
    return { data: null, error: userError };
  }

  const supabase = getSupabaseAdminClient();
  const { data: responseData, error: responseError } = await supabase
    .from('responses')
    .select('id, quiz_variant')
    .eq('id', responseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (responseError) {
    return {
      data: null,
      error: mapDbError(responseError, 'Failed to lookup response.'),
    };
  }

  if (!responseData) {
    return {
      data: null,
      error: { message: 'Response not found.', code: 'NOT_FOUND' },
    };
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      amount_cents: amountCents,
      status: 'created',
      response_id: responseId,
      report_access_token_hash: reportAccessTokenHash,
      user_id: userId,
      email: email?.toLowerCase() ?? null,
      provider: provider ?? null,
      provider_session_id: providerSessionId ?? null,
      quiz_variant: resolveQuizVariant(responseData.quiz_variant),
    })
    .select(
      'id, status, amount_cents, response_id, paddle_order_id, created_at, quiz_variant'
    )
    .single();

  if (error || !data) {
    const mappedError = mapDbError(error, 'Failed to create order.');
    if (error?.code === PG_FOREIGN_KEY_VIOLATION_ERROR_CODE) {
      return {
        data: null,
        error: { message: 'Response not found.', code: 'NOT_FOUND' },
      };
    }
    return { data: null, error: mappedError };
  }

  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const getOrderById = async ({
  orderId,
  paddleOrderId,
}: OrderLookup): Promise<DbResult<z.infer<typeof orderDetailSchema>>> => {
  if (!orderId && !paddleOrderId) {
    return { data: null, error: { message: 'Order identifier required.' } };
  }

  if (orderId && !orderIdSchema.safeParse(orderId).success) {
    return { data: null, error: { message: 'Invalid order id.' } };
  }

  const supabase = getSupabaseAdminClient();
  let lookupQuery = supabase.from('orders').select(PAID_ORDER_COLUMNS);

  if (orderId) {
    lookupQuery = lookupQuery.eq('id', orderId);
  } else if (paddleOrderId) {
    lookupQuery = lookupQuery.eq('paddle_order_id', paddleOrderId);
  }

  const { data, error } = await lookupQuery.maybeSingle();

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to lookup order.') };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = orderDetailSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const getOrderByProviderSessionId = async (
  providerSessionId: string
): Promise<DbResult<z.infer<typeof orderDetailSchema>>> => {
  let supabase: ReturnType<typeof getSupabaseAdminClient>;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Missing Supabase configuration.',
      },
    };
  }
  const { data, error } = await supabase
    .from('orders')
    .select(PAID_ORDER_COLUMNS)
    .eq('provider_session_id', providerSessionId)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to lookup order.') };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = orderDetailSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const updateOrderStatus = async ({
  orderId,
  status,
}: UpdateOrderStatusParams): Promise<
  DbResult<z.infer<typeof orderSchema> | null>
> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('status', 'created')
    .select(
      'id, status, amount_cents, response_id, paddle_order_id, created_at, quiz_variant'
    )
    .maybeSingle();

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to update order.') };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const updateOrderFromWebhook = async ({
  orderId,
  status,
  paddleOrderId,
  paddleTransactionId,
  customerEmail,
}: WebhookUpdateParams): Promise<
  DbResult<z.infer<typeof orderDetailSchema>>
> => {
  const supabase = getSupabaseAdminClient();
  const updates: {
    status: typeof status;
    paddle_order_id?: string;
    paddle_transaction_id?: string;
    email?: string;
  } = { status };

  if (paddleOrderId) {
    updates.paddle_order_id = paddleOrderId;
  }

  if (paddleTransactionId) {
    updates.paddle_transaction_id = paddleTransactionId;
  }

  if (customerEmail) {
    updates.email = customerEmail.toLowerCase();
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      ...updates,
      paid_at: status === 'paid' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select(
      'id, status, amount_cents, response_id, paddle_order_id, created_at, report_access_token_hash, user_id, email, provider, provider_session_id, report_id, results_snapshot_id, report_file_key, paid_at, updated_at'
    )
    .single();

  if (error || !data) {
    return { data: null, error: mapDbError(error, 'Failed to update order.') };
  }

  const parsed = orderDetailSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  if (status === 'paid' && customerEmail && parsed.data.user_id) {
    const normalizedEmail = customerEmail.toLowerCase();
    const { data: userData, error: userLookupError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', parsed.data.user_id)
      .maybeSingle();

    if (userLookupError) {
      logWarn('Failed to lookup user for webhook email update.', {
        orderId: parsed.data.id,
        error: userLookupError,
      });
    } else if (!userData) {
      logWarn('User not found for order during webhook processing.', {
        orderId: parsed.data.id,
        userId: parsed.data.user_id,
      });
    } else if (!userData.email) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ email: normalizedEmail })
        .eq('id', parsed.data.user_id);

      if (userUpdateError) {
        logWarn('Failed to update user email from webhook.', {
          orderId: parsed.data.id,
          error: userUpdateError,
        });
      }
    } else if (userData.email !== normalizedEmail) {
      logWarn('Webhook email mismatch for user.', {
        orderId: parsed.data.id,
        existingEmail: userData.email,
        webhookEmail: normalizedEmail,
      });
    }
  }

  return { data: parsed.data, error: null };
};

export const getReportAsset = async (
  orderId: string,
  kind: ReportAssetParams['kind']
): Promise<DbResult<{ path: string }>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('assets')
    .select('path')
    .eq('order_id', orderId)
    .eq('kind', kind)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to lookup asset.') };
  }

  if (!data) {
    return { data: null, error: null };
  }

  if (typeof data.path !== 'string') {
    return { data: null, error: { message: 'Invalid asset payload.' } };
  }

  return { data: { path: data.path }, error: null };
};

export const storeReportAsset = async ({
  orderId,
  userId,
  reportPath,
  kind,
}: ReportAssetParams): Promise<DbResult<null>> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('assets').upsert(
    {
      user_id: userId,
      order_id: orderId,
      kind,
      path: reportPath,
    },
    { onConflict: 'order_id,kind' }
  );

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to store asset.') };
  }

  return { data: null, error: null };
};

export const updateOrderReportFileKey = async ({
  orderId,
  reportFileKey,
}: {
  orderId: string;
  reportFileKey: string;
}): Promise<DbResult<null>> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({
      report_file_key: reportFileKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to update order report file key.'),
    };
  }

  return { data: null, error: null };
};

export const updateOrderReportAccessToken = async ({
  orderId,
  reportAccessTokenHash,
}: {
  orderId: string;
  reportAccessTokenHash: string;
}): Promise<DbResult<null>> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({
      report_access_token_hash: reportAccessTokenHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to update order report access token.'),
    };
  }

  return { data: null, error: null };
};

const getPaidOrdersBy = async (
  field: 'email' | 'user_id',
  value: string
): Promise<DbResult<z.infer<typeof orderDetailSchema>[]>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select(PAID_ORDER_COLUMNS)
    .eq('status', 'paid')
    .eq(field, value)
    .order('paid_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to lookup orders.') };
  }

  if (!data) {
    return { data: [], error: null };
  }

  const parsed = z.array(orderDetailSchema).safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const getPaidOrdersByEmail = async (
  email: string
): Promise<DbResult<z.infer<typeof orderDetailSchema>[]>> => {
  return getPaidOrdersBy('email', email);
};

export const getPaidOrdersByUserId = async (
  userId: string
): Promise<DbResult<z.infer<typeof orderDetailSchema>[]>> => {
  return getPaidOrdersBy('user_id', userId);
};

export const createReportAccessLink = async ({
  email,
  orderId,
  tokenHash,
  expiresAt,
}: ReportAccessLinkParams): Promise<
  DbResult<z.infer<typeof reportAccessLinkSchema>>
> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('report_access_links')
    .insert({
      email: email.toLowerCase(),
      order_id: orderId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select(REPORT_ACCESS_LINK_COLUMNS)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to create report access link.'),
    };
  }

  const parsed = reportAccessLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const getReportAccessLinkByHash = async (
  tokenHash: string
): Promise<DbResult<z.infer<typeof reportAccessLinkSchema> | null>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('report_access_links')
    .select(REPORT_ACCESS_LINK_COLUMNS)
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to lookup report access link.'),
    };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = reportAccessLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const markReportAccessLinkUsed = async (
  linkId: string
): Promise<DbResult<z.infer<typeof reportAccessLinkSchema> | null>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('report_access_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', linkId)
    .is('used_at', null)
    .select(REPORT_ACCESS_LINK_COLUMNS)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: mapDbError(error, 'Failed to update report access link.'),
    };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const parsed = reportAccessLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};
