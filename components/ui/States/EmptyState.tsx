import React, { type ReactNode } from 'react';

import { cn } from '../utils';

type EmptyStateTone = 'neutral' | 'success';

type EmptyStateProps = {
  message: string;
  action?: ReactNode;
  tone?: EmptyStateTone;
  className?: string;
};

const toneStyles: Record<EmptyStateTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

export function EmptyState({ message, action, tone = 'neutral', className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', toneStyles[tone], className)}>
      <p>{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
