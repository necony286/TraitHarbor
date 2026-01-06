import React from 'react';

interface ProgressProps {
  answered: number;
  total: number;
  currentPage: number;
  totalPages: number;
}

export function Progress({ answered, total, currentPage, totalPages }: ProgressProps) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  return (
    <section aria-label="Quiz progress" className="quiz-progress">
      <div className="quiz-progress__header">
        <div>
          <p className="eyebrow">Progress</p>
          <p className="muted">Answered {answered} of {total} questions</p>
        </div>
        <p className="muted">
          Page {currentPage + 1} of {totalPages}
        </p>
      </div>
      <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
