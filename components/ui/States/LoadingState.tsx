import React from 'react';

import { cn } from '../utils';

type LoadingStateProps = {
  message: string;
  className?: string;
};

export function LoadingState({ message, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
