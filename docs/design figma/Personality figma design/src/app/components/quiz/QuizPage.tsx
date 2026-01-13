import { useState, useRef, useEffect } from 'react';
import { QuestionRow } from './QuestionRow';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  category?: string;
}

interface QuizPageProps {
  currentPage: number;
  totalPages: number;
  questions: Question[];
  answers: Record<number, number>;
  onAnswerChange: (questionId: number, value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  pageTitle?: string;
  categoryTitle?: string;
}

export function QuizPage({
  currentPage,
  totalPages,
  questions,
  answers,
  onAnswerChange,
  onPrevious,
  onNext,
  onSubmit,
  pageTitle = 'Personality Assessment',
  categoryTitle
}: QuizPageProps) {
  const [validationError, setValidationError] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isLastPage = currentPage === totalPages;
  const totalQuestions = totalPages * 12; // 12 questions per page
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Calculate questions answered on current page
  const currentPageAnswered = questions.filter(q => answers[q.id] !== undefined).length;

  const handleNext = () => {
    // Validate that all questions on current page are answered
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    
    if (unanswered.length > 0) {
      setValidationError(true);
      setUnansweredQuestions(new Set(unanswered.map(q => q.id)));
      
      // Scroll to first unanswered question
      setTimeout(() => {
        const firstUnanswered = document.querySelector('[data-question-error="true"]');
        if (firstUnanswered) {
          firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return;
    }
    
    setValidationError(false);
    setUnansweredQuestions(new Set());
    
    if (isLastPage) {
      onSubmit();
    } else {
      onNext();
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setValidationError(false);
    setUnansweredQuestions(new Set());
    onPrevious();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerChange = (questionId: number, value: number) => {
    onAnswerChange(questionId, value);
    
    // Remove question from unanswered set if it was there
    if (unansweredQuestions.has(questionId)) {
      const newSet = new Set(unansweredQuestions);
      newSet.delete(questionId);
      setUnansweredQuestions(newSet);
      
      // Clear validation error if all questions are now answered
      if (newSet.size === 0) {
        setValidationError(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--quiz-surface)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[var(--quiz-surface-elevated)] border-b border-[var(--quiz-border-subtle)] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-5">
          {/* Title and Meta */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg md:text-xl font-semibold text-[var(--quiz-text-primary)]">
                {categoryTitle || pageTitle}
              </h1>
              <span className="text-sm text-[var(--quiz-text-muted)]">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <p className="text-sm text-[var(--quiz-text-secondary)]">
              {answeredCount} of {totalQuestions} questions answered
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[var(--quiz-accent)] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quiz progress: ${answeredCount} of ${totalQuestions} questions answered`}
            />
          </div>

          {/* Page Progress Indicator */}
          <div className="mt-3 flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <div
                key={page}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${page < currentPage 
                    ? 'bg-[var(--quiz-success)]' 
                    : page === currentPage 
                    ? 'bg-[var(--quiz-accent)]' 
                    : 'bg-gray-200'
                  }
                `}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={contentRef} className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              data-question-error={unansweredQuestions.has(question.id)}
              className="motion-safe:animate-fadeIn"
              style={{
                animationDelay: `${index * 30}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <QuestionRow
                questionNumber={(currentPage - 1) * 12 + index + 1}
                questionText={question.text}
                value={answers[question.id] ?? null}
                onChange={(value) => handleAnswerChange(question.id, value)}
                hasError={unansweredQuestions.has(question.id)}
              />
            </div>
          ))}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div
            className="mt-6 p-4 bg-[var(--quiz-error-light)] border border-[var(--quiz-error)] rounded-lg flex items-start gap-3 motion-safe:animate-fadeIn"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 text-[var(--quiz-error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--quiz-error)]">
                Please answer all questions before continuing
              </p>
              <p className="text-sm text-[var(--quiz-text-secondary)] mt-1">
                {unansweredQuestions.size} question{unansweredQuestions.size !== 1 ? 's' : ''} remaining on this page
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--quiz-surface-elevated)] border-t border-[var(--quiz-border-subtle)] shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                transition-all duration-150
                motion-reduce:transition-none
                ${currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-white border border-[var(--quiz-border-medium)] text-[var(--quiz-text-primary)] hover:bg-gray-50 active:scale-95 motion-reduce:active:scale-100'
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-focus-ring)] focus-visible:ring-offset-2
              `}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Center Info (Desktop) */}
            <div className="hidden md:flex items-center gap-4 text-sm text-[var(--quiz-text-secondary)]">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {currentPageAnswered}/12 on this page
              </span>
              <span className="text-[var(--quiz-text-muted)]">•</span>
              <span>{answeredCount}/{totalQuestions} total</span>
            </div>

            {/* Next/Submit Button */}
            <button
              onClick={handleNext}
              className={`
                inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                bg-[var(--quiz-accent)] text-white
                hover:bg-[var(--quiz-accent-hover)]
                active:scale-95
                motion-reduce:active:scale-100
                transition-all duration-150
                motion-reduce:transition-none
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-focus-ring)] focus-visible:ring-offset-2
                shadow-sm hover:shadow-md
              `}
              aria-label={isLastPage ? 'Submit quiz' : 'Go to next page'}
            >
              <span>{isLastPage ? 'Submit Quiz' : 'Next'}</span>
              {isLastPage ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Info */}
          <div className="md:hidden mt-3 flex items-center justify-center gap-3 text-xs text-[var(--quiz-text-secondary)]">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {currentPageAnswered}/12 this page
            </span>
            <span className="text-[var(--quiz-text-muted)]">•</span>
            <span>{answeredCount}/{totalQuestions} total</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
