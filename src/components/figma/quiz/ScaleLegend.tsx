interface ScaleLegendProps {
  variant?: 'default' | 'compact';
}

export function ScaleLegend({ variant = 'default' }: ScaleLegendProps) {
  const options = [
    { short: 'SD', full: 'Strongly Disagree', color: '#ef4444' },
    { short: 'D', full: 'Disagree', color: '#f59e0b' },
    { short: 'N', full: 'Neutral', color: '#6b7280' },
    { short: 'A', full: 'Agree', color: '#10b981' },
    { short: 'SA', full: 'Strongly Agree', color: '#2563eb' }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center gap-2 md:gap-3 py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
        <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">Scale:</span>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
          {options.map((option, index) => (
            <div key={option.short} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
              <span className="text-xs text-foreground">
                <span className="font-semibold md:hidden">{option.short}</span>
                <span className="hidden md:inline">{option.full}</span>
              </span>
              {index < options.length - 1 && (
                <span className="text-muted-foreground/30 ml-1 hidden sm:inline">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 lg:p-5 border border-blue-200/50 dark:border-blue-800/30">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Rate each statement</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For each statement, select how much you agree or disagree based on how you typically think, feel, or behave.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {options.map((option) => (
              <div
                key={option.short}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-900 rounded-lg border border-border/50"
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />
                <span className="text-xs font-medium text-foreground">{option.full}</span>
              </div>
            ))}
          </div>

          <div className="flex md:hidden items-center gap-2 flex-wrap">
            {options.map((option) => (
              <div
                key={option.short}
                className="flex items-center gap-1.5 py-1.5 px-2.5 bg-white dark:bg-gray-900 rounded-md border border-border/50"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
                <span className="text-xs font-medium text-foreground">
                  {option.short} = {option.full}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
