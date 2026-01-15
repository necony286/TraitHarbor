import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StickyNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  isLastPage: boolean;
  errorMessage?: string;
}

export function StickyNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canGoPrevious,
  isLastPage,
  errorMessage
}: StickyNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10"
      aria-label="Quiz navigation"
    >
      {errorMessage && (
        <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20" role="alert">
          <p className="text-sm text-destructive text-center">{errorMessage}</p>
        </div>
      )}

      <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg border font-medium
            transition-all duration-150 ease-out motion-reduce:transition-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
            ${
              canGoPrevious
                ? 'border-border bg-background text-foreground hover:bg-muted active:scale-95'
                : 'border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <button
          onClick={onNext}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
            transition-all duration-150 ease-out motion-reduce:transition-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
            ${
              isLastPage
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm'
            }
          `}
        >
          <span className="hidden sm:inline">{isLastPage ? 'Submit' : 'Next'}</span>
          <span className="sm:hidden">{isLastPage ? 'Submit' : 'Next'}</span>
          {!isLastPage && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
