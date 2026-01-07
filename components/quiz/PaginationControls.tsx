import React from 'react';

type PaginationControlsProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({ canGoBack, canGoForward, onPrevious, onNext }: PaginationControlsProps) {
  return (
    <div className="pagination-controls">
      <button type="button" className="button button--ghost" onClick={onPrevious} disabled={!canGoBack}>
        Previous page
      </button>
      <button type="button" className="button" onClick={onNext} disabled={!canGoForward}>
        Next page
      </button>
    </div>
  );
}
