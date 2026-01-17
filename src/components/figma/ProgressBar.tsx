import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const finiteCurrent = Number.isFinite(current) ? current : 0;
  const clampedCurrent = Math.max(0, Math.min(finiteCurrent, safeTotal));
  const percentage = safeTotal > 0 ? Math.round((clampedCurrent / safeTotal) * 100) : 0;

  return (
    <div
      className="w-full space-y-2"
      role="progressbar"
      aria-valuenow={clampedCurrent}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
    >
      <div className="relative h-2 bg-muted rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-500 ease-out motion-reduce:transition-none relative"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 0 && percentage < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      <span className="sr-only">{percentage}% complete</span>
    </div>
  );
}
