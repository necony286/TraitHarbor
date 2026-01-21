import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '../../../../components/ui/Container';

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
      className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10 shadow-2xl pointer-events-none"
      aria-label="Quiz navigation"
    >
      {errorMessage && (
        <div
          className="px-4 py-3 bg-destructive/10 border-b border-destructive/20 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          role="alert"
        >
          <Container className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-destructive font-medium text-center">{errorMessage}</p>
          </Container>
        </div>
      )}

      <Container className="flex items-center justify-between gap-4 py-4 pointer-events-none">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm pointer-events-auto
            transition-all duration-200 ease-out motion-reduce:transition-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50
            ${
              canGoPrevious
                ? 'border-border bg-background text-foreground hover:bg-muted hover:border-border/80 active:scale-95 shadow-sm'
                : 'border-border/30 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-40'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-center min-w-[100px]">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">{currentPage}</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{totalPages}</span>
          </div>
          <span className="text-xs text-muted-foreground">{isLastPage ? 'Final Page' : 'Pages'}</span>
        </div>

        <button
          onClick={onNext}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm pointer-events-auto
            transition-all duration-200 ease-out motion-reduce:transition-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50
            ${
              isLastPage
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary active:scale-95 shadow-lg shadow-primary/25'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md'
            }
          `}
        >
          <span>{isLastPage ? 'Submit' : 'Next'}</span>
          {!isLastPage && <ChevronRight className="w-4 h-4" />}
          {isLastPage && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </Container>
    </nav>
  );
}
