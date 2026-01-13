import React from 'react';
import { ProgressBar } from '../../src/components/figma/ProgressBar';

interface ProgressProps {
  answered: number;
  total: number;
  currentPage: number;
  totalPages: number;
}

export function Progress({ answered, total, currentPage, totalPages }: ProgressProps) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const current = Math.min(total, Math.max(0, answered));

  return (
    <section aria-label="Quiz progress" className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
          <p className="mt-1">Answered {answered} of {total} questions</p>
        </div>
        <p className="font-medium text-slate-500">Page {currentPage + 1} of {totalPages}</p>
      </div>
      <div className="mt-4" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <ProgressBar current={current} total={total} />
      </div>
    </section>
  );
}
