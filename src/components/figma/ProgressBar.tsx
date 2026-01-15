interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const finiteCurrent = Number.isFinite(current) ? current : 0;
  const safeCurrent = Math.max(0, Math.min(finiteCurrent, safeTotal));
  const percentage = safeTotal > 0 ? Math.round((safeCurrent / safeTotal) * 100) : 0;

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={safeCurrent}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
    >
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="sr-only">{percentage}% complete</span>
    </div>
  );
}
