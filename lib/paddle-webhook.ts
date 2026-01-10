import { z } from 'zod';
import { OrderStatus } from './orders';

export type PaddleWebhookEvent = {
  eventType: string;
  eventId?: string;
  orderId?: string;
  paddleOrderId?: string;
  paddleTransactionId?: string;
  customerEmail?: string;
  status?: Extract<OrderStatus, 'paid' | 'failed'>;
};

export const paddleWebhookSchema = z.object({
  event_type: z.string(),
  data: z.unknown()
});

const EVENT_STATUS_MAP: Record<string, PaddleWebhookEvent['status']> = {
  payment_succeeded: 'paid',
  payment_failed: 'failed',
  'transaction.completed': 'paid',
  'transaction.payment_failed': 'failed'
};

const getStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

export const getWebhookEventStatus = (eventType: string): PaddleWebhookEvent['status'] => EVENT_STATUS_MAP[eventType];

export const extractOrderIds = (data: unknown): Pick<PaddleWebhookEvent, 'orderId' | 'paddleOrderId'> => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const record = data as Record<string, unknown>;
  const customData = record.custom_data as Record<string, unknown> | undefined;
  const metadata = record.metadata as Record<string, unknown> | undefined;

  const orderId =
    getStringValue(customData?.order_id) ??
    getStringValue(metadata?.order_id) ??
    getStringValue(record.order_id);

  const paddleOrderId =
    getStringValue(record.id) ??
    getStringValue(record.transaction_id) ??
    getStringValue(record.order_id);

  return { orderId, paddleOrderId };
};

export const extractTransactionId = (data: unknown, eventType: string): string | undefined => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  const transactionId = getStringValue(record.transaction_id);
  if (transactionId) {
    return transactionId;
  }

  if (eventType.startsWith('transaction.')) {
    return getStringValue(record.id);
  }

  return undefined;
};

export const extractEventId = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  return getStringValue(record.event_id) ?? getStringValue(record.id);
};

export const extractCustomerEmail = (data: unknown): PaddleWebhookEvent['customerEmail'] => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  const customer = record.customer as Record<string, unknown> | undefined;
  const billingDetails = record.billing_details as Record<string, unknown> | undefined;

  return (
    getStringValue(record.customer_email) ??
    getStringValue(record.email) ??
    getStringValue(customer?.email) ??
    getStringValue(billingDetails?.email)
  );
};

export const parsePaddleWebhook = (payload: unknown): PaddleWebhookEvent | null => {
  const parsed = paddleWebhookSchema.safeParse(payload);
  if (!parsed.success) return null;

  const { event_type, data } = parsed.data;
  const status = getWebhookEventStatus(event_type);
  const { orderId, paddleOrderId } = extractOrderIds(data);
  const paddleTransactionId = extractTransactionId(data, event_type);
  const eventId = extractEventId(payload);
  const customerEmail = extractCustomerEmail(data);

  return {
    eventType: event_type,
    eventId,
    status,
    orderId,
    paddleOrderId,
    paddleTransactionId,
    customerEmail
  };
};

export const shouldUpdateOrder = (currentStatus: OrderStatus, nextStatus?: PaddleWebhookEvent['status']) => {
  if (!nextStatus) return false;
  if (currentStatus === nextStatus) return false;
  if (currentStatus === 'paid') return false;
  return true;
};
