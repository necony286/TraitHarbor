import { z } from 'zod';

export type OrderStatus = 'created' | 'pending' | 'pending_webhook' | 'paid' | 'failed' | 'refunded';

export type OrderRecord = {
  id: string;
  status: OrderStatus;
  amountCents: number;
  resultId: string | null;
  paddleOrderId: string | null;
  createdAt: string;
};

export const orderStatusSchema = z.enum(['created', 'pending', 'pending_webhook', 'paid', 'failed', 'refunded']);

export const orderSchema = z.object({
  id: z.string().uuid(),
  status: orderStatusSchema,
  amount_cents: z.number().int().nonnegative(),
  response_id: z.string().uuid().nullable().optional(),
  paddle_order_id: z.string().nullable().optional(),
  paddle_transaction_id: z.string().nullable().optional(),
  created_at: z.string().datetime()
});

export const mapOrderRecord = (order: z.infer<typeof orderSchema>): OrderRecord => ({
  id: order.id,
  status: order.status,
  amountCents: order.amount_cents,
  resultId: order.response_id ?? null,
  paddleOrderId: order.paddle_order_id ?? null,
  createdAt: order.created_at
});

export const orderRecordSchema = z.object({
  id: z.string().uuid(),
  status: orderStatusSchema,
  amountCents: z.number().int().nonnegative(),
  resultId: z.string().uuid().nullable(),
  paddleOrderId: z.string().nullable(),
  createdAt: z.string().datetime()
});

export const orderDetailSchema = orderSchema.extend({
  report_access_token_hash: z.string().nullable().optional(),
  user_id: z.string().uuid().nullable(),
  email: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  provider_session_id: z.string().nullable().optional(),
  report_id: z.string().uuid().nullable().optional(),
  results_snapshot_id: z.string().uuid().nullable().optional(),
  report_file_key: z.string().nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
  updated_at: z.string().datetime().nullable().optional()
});
