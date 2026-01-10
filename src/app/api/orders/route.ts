import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCheckoutAmountCents, getCheckoutConfig } from '../../../../lib/payments';
import { mapOrderRecord, orderStatusSchema } from '../../../../lib/orders';
import { createProvisionalOrder, getOrderById, updateOrderStatus } from '../../../../lib/db';
import { enforceRateLimit } from '../../../../lib/rate-limit';

const createOrderBodySchema = z.object({
  resultId: z.string().uuid(),
  userId: z.string().uuid()
});

const orderIdSchema = z.string().uuid();

const updateOrderSchema = z.object({
  orderId: orderIdSchema,
  status: orderStatusSchema
}).refine((data) => data.status === 'pending_webhook', {
  message: 'Only pending_webhook is supported right now.',
  path: ['status']
});

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'orders',
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

  const parsed = createOrderBodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const reportAccessToken = randomUUID();
  let data;
  let error;
  try {
    const response = await createProvisionalOrder({
      userId: parsed.data.userId,
      responseId: parsed.data.resultId,
      amountCents: getCheckoutAmountCents(),
      reportAccessToken
    });
    data = response.data;
    error = response.error;
  } catch (errorResponse) {
    console.error('Failed to initialize Supabase admin client for orders.', errorResponse);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }

  if (error || !data) {
    if (error?.code === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }
    console.error('Failed to create provisional order.', error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }

  let checkoutConfig = null;
  try {
    checkoutConfig = getCheckoutConfig();
  } catch (error) {
    console.error('Failed to load checkout config for order creation.', error);
  }

  return NextResponse.json({
    order: mapOrderRecord(data),
    checkout: checkoutConfig,
    reportAccessToken
  });
}

export async function GET(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'orders',
    limit: 10,
    window: '1 m',
    mode: 'fail-open'
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId || !orderIdSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
  }

  let data;
  let error;
  try {
    const response = await getOrderById({ orderId });
    data = response.data;
    error = response.error;
  } catch (errorResponse) {
    console.error('Failed to initialize Supabase admin client for order lookup.', errorResponse);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  if (error) {
    console.error('Failed to fetch order.', error);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order: mapOrderRecord(data) });
}

export async function PATCH(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'orders',
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

  const parsed = updateOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body.',
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  let data;
  let error;
  try {
    const response = await updateOrderStatus({
      orderId: parsed.data.orderId,
      status: parsed.data.status
    });
    data = response.data;
    error = response.error;
  } catch (errorResponse) {
    console.error('Failed to initialize Supabase admin client for order update.', errorResponse);
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (error) {
    console.error('Failed to update order.', error);
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Order status conflict.' }, { status: 409 });
  }

  return NextResponse.json({ order: mapOrderRecord(data) });
}
