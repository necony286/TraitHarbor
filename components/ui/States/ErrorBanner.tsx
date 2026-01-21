import React, { type ReactNode } from 'react';

import { cn } from '../utils';

type ErrorTone = 'error' | 'warning';

type ErrorBannerProps = {
  message: string;
  action?: ReactNode;
  tone?: ErrorTone;
  className?: string;
};

const toneStyles: Record<ErrorTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800'
};

export function ErrorBanner({ message, action, tone = 'error', className }: ErrorBannerProps) {
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', toneStyles[tone], className)} role="alert">
      <p>{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
