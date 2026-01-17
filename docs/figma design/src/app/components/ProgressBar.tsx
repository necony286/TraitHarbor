interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full space-y-2" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-500 ease-out motion-reduce:transition-none relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shimmer effect */}
          {percentage > 0 && percentage < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      <span className="sr-only">{percentage}% complete</span>
    </div>
  );
}