import { Suspense } from 'react';
import CheckoutCallbackClient from './CheckoutCallbackClient';

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<p className="muted">Loading checkout details…</p>}>
      <CheckoutCallbackClient />
    </Suspense>
  );
}
