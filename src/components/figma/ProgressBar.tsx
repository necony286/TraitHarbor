import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-slate-500">Question {current} of {total}</span>
        <span className="font-medium text-indigo-600">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
