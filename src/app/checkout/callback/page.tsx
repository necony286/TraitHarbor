import { Suspense } from 'react';

import CheckoutCallbackClient from './CheckoutCallbackClient';

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading checkout details…</p>}>
      <CheckoutCallbackClient />
    </Suspense>
  );
}
