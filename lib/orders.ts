import { z } from 'zod';

export type OrderStatus = 'created' | 'pending_webhook' | 'paid' | 'failed';

export type OrderRecord = {
  id: string;
  status: OrderStatus;
  amountCents: number;
  resultId: string | null;
  paddleOrderId: string | null;
  createdAt: string;
};

export const orderStatusSchema = z.enum(['created', 'pending_webhook', 'paid', 'failed']);

export const orderSchema = z.object({
  id: z.string().uuid(),
  status: orderStatusSchema,
  amount_cents: z.number().int().nonnegative(),
  result_id: z.string().uuid().nullable().optional(),
  paddle_order_id: z.string().nullable().optional(),
  created_at: z.string().datetime()
});

export const mapOrderRecord = (order: z.infer<typeof orderSchema>): OrderRecord => ({
  id: order.id,
  status: order.status,
  amountCents: order.amount_cents,
  resultId: order.result_id ?? null,
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
