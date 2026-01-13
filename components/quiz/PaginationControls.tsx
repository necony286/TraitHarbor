import React from 'react';
import { Button } from '../ui/Button';

type PaginationControlsProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({ canGoBack, canGoForward, onPrevious, onNext }: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="ghost" onClick={onPrevious} disabled={!canGoBack}>
        Previous page
      </Button>
      <Button type="button" onClick={onNext} disabled={!canGoForward}>
        Next page
      </Button>
    </div>
  );
}
