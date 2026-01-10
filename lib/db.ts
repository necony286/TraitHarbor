import { z } from 'zod';
import { OrderStatus, orderDetailSchema, orderSchema } from './orders';
import { TraitScores } from './scoring';
import { getSupabaseAdminClient } from './supabase';
import { PG_FOREIGN_KEY_VIOLATION_ERROR_CODE } from './db/constants';

const traitSchema = z.object({
  O: z.number(),
  C: z.number(),
  E: z.number(),
  A: z.number(),
  N: z.number()
});

const scoreRowSchema = z.object({
  response_id: z.string().uuid(),
  traits: traitSchema
});

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
  expectedCount: number;
};

type CreateOrderParams = {
  userId: string;
  responseId: string;
  amountCents: number;
  reportAccessToken: string;
};

type UpdateOrderStatusParams = {
  orderId: string;
  status: OrderStatus;
};

type WebhookUpdateParams = {
  orderId: string;
  status: 'paid' | 'failed';
  paddleOrderId?: string;
  customerEmail?: string;
};

type ReportAssetParams = {
  orderId: string;
  userId: string;
  reportPath: string;
  kind: 'report_pdf';
};

const ensureUserRecord = async (userId: string): Promise<DbError | null> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });
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
  expectedCount
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
    expected_count: expectedCount
  });

  if (error || !data) {
    return { data: null, error: mapDbError(error, 'Failed to create response.') };
  }

  if (typeof data !== 'string') {
    return { data: null, error: { message: 'Invalid response id.' } };
  }

  return { data, error: null };
};

export const getScoresByResultId = async (resultId: string): Promise<DbResult<TraitScores>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('scores')
    .select('response_id, traits')
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

  return { data: parsed.data.traits, error: null };
};

export const createProvisionalOrder = async ({
  userId,
  responseId,
  amountCents,
  reportAccessToken
}: CreateOrderParams): Promise<DbResult<z.infer<typeof orderSchema>>> => {
  const userError = await ensureUserRecord(userId);
  if (userError) {
    return { data: null, error: userError };
  }

  const supabase = getSupabaseAdminClient();
  const { data: responseData, error: responseError } = await supabase
    .from('responses')
    .select('id')
    .eq('id', responseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (responseError) {
    return { data: null, error: mapDbError(responseError, 'Failed to lookup response.') };
  }

  if (!responseData) {
    return { data: null, error: { message: 'Response not found.', code: 'NOT_FOUND' } };
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      amount_cents: amountCents,
      status: 'created',
      response_id: responseId,
      report_access_token: reportAccessToken,
      user_id: userId
    })
    .select('id, status, amount_cents, response_id, paddle_order_id, created_at')
    .single();

  if (error || !data) {
    const mappedError = mapDbError(error, 'Failed to create order.');
    if (error?.code === PG_FOREIGN_KEY_VIOLATION_ERROR_CODE) {
      return { data: null, error: { message: 'Response not found.', code: 'NOT_FOUND' } };
    }
    return { data: null, error: mappedError };
  }

  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  return { data: parsed.data, error: null };
};

export const getOrderById = async ({ orderId, paddleOrderId }: OrderLookup): Promise<DbResult<z.infer<typeof orderDetailSchema>>> => {
  if (!orderId && !paddleOrderId) {
    return { data: null, error: { message: 'Order identifier required.' } };
  }

  if (orderId && !orderIdSchema.safeParse(orderId).success) {
    return { data: null, error: { message: 'Invalid order id.' } };
  }

  const supabase = getSupabaseAdminClient();
  let lookupQuery = supabase
    .from('orders')
    .select('id, status, amount_cents, response_id, paddle_order_id, created_at, report_access_token, user_id');

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

export const updateOrderStatus = async ({ orderId, status }: UpdateOrderStatusParams): Promise<DbResult<z.infer<typeof orderSchema> | null>> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('status', 'created')
    .select('id, status, amount_cents, response_id, paddle_order_id, created_at')
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
  customerEmail
}: WebhookUpdateParams): Promise<DbResult<z.infer<typeof orderDetailSchema>>> => {
  const supabase = getSupabaseAdminClient();
  const updates: { status: typeof status; paddle_order_id?: string } = { status };

  if (paddleOrderId) {
    updates.paddle_order_id = paddleOrderId;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, amount_cents, response_id, paddle_order_id, created_at, report_access_token, user_id')
    .single();

  if (error || !data) {
    return { data: null, error: mapDbError(error, 'Failed to update order.') };
  }

  const parsed = orderDetailSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.message } };
  }

  if (status === 'paid' && customerEmail) {
    const normalizedEmail = customerEmail.toLowerCase();
    const { data: userData, error: userLookupError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', parsed.data.user_id)
      .maybeSingle();

    if (userLookupError) {
      console.warn('Failed to lookup user for webhook email update.', {
        orderId: parsed.data.id,
        error: userLookupError.message
      });
    } else if (!userData || !userData.email) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ email: normalizedEmail })
        .eq('id', parsed.data.user_id);

      if (userUpdateError) {
        console.warn('Failed to update user email from webhook.', {
          orderId: parsed.data.id,
          error: userUpdateError.message
        });
      }
    } else if (userData.email !== normalizedEmail) {
      console.warn('Webhook email mismatch for user.', {
        orderId: parsed.data.id,
        existingEmail: userData.email,
        webhookEmail: normalizedEmail
      });
    }
  }

  return { data: parsed.data, error: null };
};

export const getReportAsset = async (orderId: string, kind: ReportAssetParams['kind']): Promise<DbResult<{ path: string }>> => {
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
  kind
}: ReportAssetParams): Promise<DbResult<null>> => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('assets').upsert(
    {
      user_id: userId,
      order_id: orderId,
      kind,
      path: reportPath
    },
    { onConflict: 'order_id,kind' }
  );

  if (error) {
    return { data: null, error: mapDbError(error, 'Failed to store asset.') };
  }

  return { data: null, error: null };
};
