import { NextResponse } from 'next/server';
import { getCheckoutConfig } from '../../../../lib/payments';

export async function GET() {
  try {
    const config = getCheckoutConfig();
    return NextResponse.json(config);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Checkout config error', error);
    return NextResponse.json({ error: 'Checkout is currently unavailable.' }, { status: 500 });
  }
}
