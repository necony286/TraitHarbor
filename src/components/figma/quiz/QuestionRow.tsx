import React from 'react';
import { LikertScale } from '@/components/figma/quiz/LikertScale';

interface QuestionRowProps {
  questionId: string;
  questionNumber: number;
  questionText: string;
  value: number | null;
  onChange: (value: number) => void;
  hasError?: boolean;
}

export function QuestionRow({
  questionId,
  questionNumber,
  questionText,
  value,
  onChange,
  hasError = false
}: QuestionRowProps) {
  return (
    <div
      className={`
        p-5 lg:p-6 rounded-xl border-2 transition-all duration-300 motion-reduce:transition-none
        ${hasError ? 'border-destructive/50 bg-destructive/5 shadow-sm' : value ? 'border-primary/20 bg-card shadow-sm' : 'border-border bg-card hover:border-border/80'}
      `}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p id={`question-${questionId}`} className="text-sm lg:text-base font-medium text-foreground leading-relaxed">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold mr-3">
              {questionNumber}
            </span>
            {questionText}
          </p>
          {hasError && (
            <div className="flex items-center gap-2 ml-9 mt-2">
              <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-destructive font-medium" role="alert">
                Please select an answer to continue
              </p>
            </div>
          )}
        </div>

        <div className="pt-1">
          <LikertScale name={`question-${questionId}`} value={value} onChange={onChange} questionId={questionId} />
        </div>
      </div>
    </div>
  );
}
