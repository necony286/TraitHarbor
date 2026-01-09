import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '../../../../../lib/supabase';
import { logError, logInfo, logWarn } from '../../../../../lib/logger';
import { parsePaddleWebhook, shouldUpdateOrder } from '../../../../../lib/paddle-webhook';
import { verifyPaddleSignature } from '../../../../../lib/signature';
import { orderStatusSchema } from '../../../../../lib/orders';

const orderLookupSchema = z.object({
  id: z.string().uuid(),
  status: orderStatusSchema,
  paddle_order_id: z.string().nullable().optional(),
  user_id: z.string().uuid()
});

const getWebhookSecret = () => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing PADDLE_WEBHOOK_SECRET');
  }
  return secret;
};

const shouldBypassSignature = () =>
  process.env.NODE_ENV === 'development' && process.env.ALLOW_WEBHOOK_TEST_BYPASS === '1';

const requestPdfGeneration = (orderId: string) => {
  logInfo('PDF generation queued for paid order.', { orderId });
};

export async function POST(request: Request) {
  const body = await request.text();

  if (!shouldBypassSignature()) {
    let secret: string;
    try {
      secret = getWebhookSecret();
    } catch (error) {
      logError('Webhook secret missing.', { message: error instanceof Error ? error.message : 'unknown' });
      return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
    }

    const signature = request.headers.get('Paddle-Signature');
    if (!verifyPaddleSignature(body, signature, secret)) {
      logWarn('Invalid Paddle webhook signature.', { hasSignature: Boolean(signature) });
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
  } else {
    logWarn('Webhook signature bypass enabled for development.');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsedEvent = parsePaddleWebhook(payload);
  if (!parsedEvent) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  if (!parsedEvent.status) {
    logInfo('Webhook event ignored.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!parsedEvent.orderId && !parsedEvent.paddleOrderId) {
    logWarn('Webhook missing order identifiers.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ error: 'Order identifiers missing.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    logError('Failed to initialize Supabase admin client for webhook.', {
      message: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Unable to process webhook.' }, { status: 500 });
  }

  let lookupQuery = supabase.from('orders').select('id, status, paddle_order_id, user_id');

  if (parsedEvent.orderId) {
    lookupQuery = lookupQuery.eq('id', parsedEvent.orderId);
  } else {
    lookupQuery = lookupQuery.eq('paddle_order_id', parsedEvent.paddleOrderId!);
  }

  const { data: order, error: lookupError } = await lookupQuery.maybeSingle();

  if (lookupError) {
    logError('Failed to lookup order for webhook.', { error: lookupError.message });
    return NextResponse.json({ error: 'Unable to reconcile order.' }, { status: 500 });
  }

  if (!order) {
    logWarn('Order not found for webhook.', {
      orderId: parsedEvent.orderId,
      paddleOrderId: parsedEvent.paddleOrderId
    });
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const parsedOrder = orderLookupSchema.safeParse(order);
  if (!parsedOrder.success) {
    logError('Order lookup returned invalid data.', {
      error: parsedOrder.error.message,
      orderId: parsedEvent.orderId,
      paddleOrderId: parsedEvent.paddleOrderId
    });
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 500 });
  }

  const parsedStatus = orderStatusSchema.safeParse(parsedOrder.data.status);
  if (!parsedStatus.success) {
    logError('Order has invalid status.', {
      orderId: parsedOrder.data.id,
      status: parsedOrder.data.status
    });
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 500 });
  }

  if (!shouldUpdateOrder(parsedStatus.data, parsedEvent.status)) {
    logInfo('Webhook received for already processed order.', {
      orderId: parsedOrder.data.id,
      status: parsedStatus.data,
      eventType: parsedEvent.eventType
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  const updates: { status: typeof parsedEvent.status; paddle_order_id?: string } = {
    status: parsedEvent.status
  };

  if (parsedEvent.paddleOrderId && parsedEvent.paddleOrderId !== parsedOrder.data.paddle_order_id) {
    updates.paddle_order_id = parsedEvent.paddleOrderId;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', parsedOrder.data.id)
    .select('id')
    .single();

  if (updateError) {
    logError('Failed to update order from webhook.', {
      error: updateError.message,
      orderId: parsedOrder.data.id
    });
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (parsedEvent.status === 'paid') {
    if (parsedEvent.customerEmail) {
      const normalizedEmail = parsedEvent.customerEmail.toLowerCase();
      const { data: userData, error: userLookupError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', parsedOrder.data.user_id)
        .maybeSingle();

      if (userLookupError) {
        logWarn('Failed to lookup user for webhook email update.', {
          orderId: parsedOrder.data.id,
          error: userLookupError.message
        });
      } else if (!userData || !userData.email) {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ email: normalizedEmail })
          .eq('id', parsedOrder.data.user_id);

        if (userUpdateError) {
          logWarn('Failed to update user email from webhook.', {
            orderId: parsedOrder.data.id,
            error: userUpdateError.message
          });
        }
      } else if (userData.email !== normalizedEmail) {
        logWarn('Webhook email mismatch for user.', {
          orderId: parsedOrder.data.id,
          existingEmail: userData.email,
          webhookEmail: normalizedEmail
        });
      }
    }

    requestPdfGeneration(parsedOrder.data.id);
  }

  return NextResponse.json({ received: true });
}
