import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCheckoutConfig } from '../../../../lib/payments';
import { mapOrderRecord, orderSchema, orderStatusSchema } from '../../../../lib/orders';
import { getSupabaseAdminClient } from '../../../../lib/supabase';

const createOrderBodySchema = z.object({}).passthrough();

const orderIdSchema = z.string().uuid();

const updateOrderSchema = z.object({
  orderId: orderIdSchema,
  status: orderStatusSchema
}).refine((data) => data.status === 'pending_webhook', {
  message: 'Only pending_webhook is supported right now.',
  path: ['status']
});

export async function POST(request: Request) {
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

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client for orders.', error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }

  let checkoutConfig;
  try {
    checkoutConfig = getCheckoutConfig();
  } catch (error) {
    console.error('Failed to load checkout config for order creation.', error);
    return NextResponse.json({ error: 'Checkout is currently unavailable.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      amount_cents: checkoutConfig.amount,
      status: 'created'
    })
    .select('id, status, amount_cents, paddle_order_id, created_at')
    .single();

  if (error || !data) {
    console.error('Failed to create provisional order.', error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }

  const parsedOrder = orderSchema.safeParse(data);
  if (!parsedOrder.success) {
    console.error('Failed to parse created order payload.', parsedOrder.error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }

  return NextResponse.json({
    order: mapOrderRecord(parsedOrder.data),
    checkout: checkoutConfig
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId || !orderIdSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client for order lookup.', error);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, status, amount_cents, paddle_order_id, created_at')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Failed to fetch order.', error);
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const parsedOrder = orderSchema.safeParse(data);
  if (!parsedOrder.success) {
    console.error('Failed to parse order lookup payload.', parsedOrder.error);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  return NextResponse.json({ order: mapOrderRecord(parsedOrder.data) });
}

export async function PATCH(request: Request) {
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

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client for order update.', error);
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.orderId)
    .select('id, status, amount_cents, paddle_order_id, created_at')
    .single();

  if (error) {
    console.error('Failed to update order.', error);
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const parsedOrder = orderSchema.safeParse(data);
  if (!parsedOrder.success) {
    console.error('Failed to parse updated order payload.', parsedOrder.error);
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  return NextResponse.json({ order: mapOrderRecord(parsedOrder.data) });
}
