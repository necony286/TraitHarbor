import { NextResponse } from 'next/server';
import { getOrderById, updateOrderFromWebhook } from '../../../../../lib/db';
import { logError, logInfo, logWarn } from '../../../../../lib/logger';
import { parsePaddleWebhook, shouldUpdateOrder } from '../../../../../lib/paddle-webhook';
import { verifyPaddleSignature } from '../../../../../lib/signature';
import { orderStatusSchema } from '../../../../../lib/orders';
import { enforceRateLimit, getClientIdentifier } from '../../../../../lib/rate-limit';

const getWebhookSecret = () => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing PADDLE_WEBHOOK_SECRET');
  }
  return secret;
};

const shouldBypassSignature = () => {
  if (process.env.NODE_ENV !== 'development') {
    if (process.env.ALLOW_WEBHOOK_TEST_BYPASS === '1') {
      logWarn('Webhook signature bypass ignored outside development.');
    }
    return false;
  }

  return process.env.ALLOW_WEBHOOK_TEST_BYPASS === '1';
};

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

  const webhookIdentifier = `${getClientIdentifier(request)}:${parsedEvent.eventId ?? parsedEvent.paddleTransactionId ?? 'unknown'}`;
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'paddle-webhook',
    limit: 30,
    window: '1 m',
    mode: 'fail-closed',
    identifier: webhookIdentifier
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!parsedEvent.status) {
    logInfo('Webhook event ignored.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!parsedEvent.orderId && !parsedEvent.paddleOrderId) {
    logWarn('Webhook missing order identifiers.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ error: 'Order identifiers missing.' }, { status: 400 });
  }

  let order;
  try {
    const { data, error: lookupError } = await getOrderById({
      orderId: parsedEvent.orderId,
      paddleOrderId: parsedEvent.paddleOrderId
    });

    if (lookupError) {
      logError('Failed to lookup order for webhook.', { error: lookupError.message });
      return NextResponse.json({ error: 'Unable to reconcile order.' }, { status: 500 });
    }

    if (!data) {
      logWarn('Order not found for webhook.', {
        orderId: parsedEvent.orderId,
        paddleOrderId: parsedEvent.paddleOrderId
      });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    order = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for webhook.', {
      message: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Unable to process webhook.' }, { status: 500 });
  }

  const parsedStatus = orderStatusSchema.safeParse(order.status);
  if (!parsedStatus.success) {
    logError('Order has invalid status.', {
      orderId: order.id,
      status: order.status
    });
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 500 });
  }

  if (!shouldUpdateOrder(parsedStatus.data, parsedEvent.status)) {
    logInfo('Webhook received for already processed order.', {
      orderId: order.id,
      status: parsedStatus.data,
      eventType: parsedEvent.eventType
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  const { error: updateError } = await updateOrderFromWebhook({
    orderId: order.id,
    status: parsedEvent.status,
    paddleOrderId: parsedEvent.paddleOrderId,
    paddleTransactionId: parsedEvent.paddleTransactionId,
    customerEmail: parsedEvent.customerEmail
  });

  if (updateError) {
    logError('Failed to update order from webhook.', {
      error: updateError.message,
      orderId: order.id
    });
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (parsedEvent.status === 'paid') {
    requestPdfGeneration(order.id);
  }

  return NextResponse.json({ received: true });
}
