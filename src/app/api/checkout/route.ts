import { NextResponse } from 'next/server';
import { getCheckoutConfigResult } from '../../../../lib/payments';

export async function GET() {
  try {
    const { checkout, reason, missing } = getCheckoutConfigResult();
    if (!checkout && reason === 'MISSING_ENV') {
      // eslint-disable-next-line no-console
      console.error('Missing Paddle checkout environment variables.', { missing });
    }
    return NextResponse.json({
      checkout,
      ...(checkout
        ? {}
        : {
            reason,
            missing
          })
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Checkout config error', error);
    return NextResponse.json({ error: 'Checkout is currently unavailable.' }, { status: 500 });
  }
}
