import { useState, useId } from 'react';

interface LikertOption {
  value: number;
  label: string;
  shortLabel: string;
}

const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: 'Strongly Disagree', shortLabel: 'SD' },
  { value: 2, label: 'Disagree', shortLabel: 'D' },
  { value: 3, label: 'Neutral', shortLabel: 'N' },
  { value: 4, label: 'Agree', shortLabel: 'A' },
  { value: 5, label: 'Strongly Agree', shortLabel: 'SA' }
];

interface QuestionRowProps {
  questionNumber: number;
  questionText: string;
  value: number | null;
  onChange: (value: number) => void;
  hasError?: boolean;
}

export function QuestionRow({
  questionNumber,
  questionText,
  value,
  onChange,
  hasError = false
}: QuestionRowProps) {
  const groupId = useId();
  const questionId = `question-${questionNumber}`;

  return (
    <div
      className={`
        group/question
        border rounded-lg
        transition-all duration-200
        ${hasError 
          ? 'border-[var(--quiz-error)] bg-[var(--quiz-error-light)]' 
          : 'border-[var(--quiz-border-subtle)] bg-[var(--quiz-surface-elevated)] hover:border-[var(--quiz-border-medium)]'
        }
        motion-safe:hover:shadow-sm
      `}
      role="group"
      aria-labelledby={questionId}
    >
      <div className="p-4 md:p-5">
        {/* Mobile: Stacked Layout */}
        <div className="md:hidden space-y-4">
          {/* Question Text */}
          <div className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--quiz-surface)] border border-[var(--quiz-border-subtle)] text-xs font-medium text-[var(--quiz-text-secondary)]">
              {questionNumber}
            </span>
            <p 
              id={questionId}
              className="flex-1 text-[15px] leading-snug text-[var(--quiz-text-primary)] font-normal"
            >
              {questionText}
            </p>
          </div>

          {/* Likert Scale */}
          <LikertScale
            groupId={groupId}
            questionId={questionId}
            options={LIKERT_OPTIONS}
            value={value}
            onChange={onChange}
          />
        </div>

        {/* Desktop: Two-Column Layout */}
        <div className="hidden md:grid md:grid-cols-[1fr,auto] md:gap-8 md:items-center">
          {/* Question Text */}
          <div className="flex gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--quiz-surface)] border border-[var(--quiz-border-subtle)] text-xs font-medium text-[var(--quiz-text-secondary)]">
              {questionNumber}
            </span>
            <p 
              id={questionId}
              className="flex-1 text-[15px] leading-snug text-[var(--quiz-text-primary)] font-normal"
            >
              {questionText}
            </p>
          </div>

          {/* Likert Scale */}
          <LikertScale
            groupId={groupId}
            questionId={questionId}
            options={LIKERT_OPTIONS}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

interface LikertScaleProps {
  groupId: string;
  questionId: string;
  options: LikertOption[];
  value: number | null;
  onChange: (value: number) => void;
}

function LikertScale({ groupId, questionId, options, value, onChange }: LikertScaleProps) {
  return (
    <div 
      role="radiogroup" 
      aria-labelledby={questionId}
      className="flex gap-1.5 md:gap-2"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            relative flex-1 cursor-pointer
            transition-all duration-150
            motion-reduce:transition-none
          `}
        >
          {/* Hidden Radio Input */}
          <input
            type="radio"
            name={groupId}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only peer"
          />

          {/* Visual Button */}
          <div
            className={`
              flex flex-col items-center justify-center
              h-12 md:h-14 px-2 md:px-3
              rounded-md border
              transition-all duration-150
              motion-reduce:transition-none
              
              /* Default State */
              ${value === option.value
                ? 'bg-[var(--quiz-accent-light)] border-[var(--quiz-accent)] shadow-sm'
                : 'bg-white border-[var(--quiz-border-subtle)] hover:border-[var(--quiz-border-medium)] hover:bg-gray-50'
              }
              
              /* Focus State */
              peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--quiz-focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none
              
              /* Active/Pressed State */
              active:scale-95
              motion-reduce:active:scale-100
            `}
          >
            {/* Short Label (always visible) */}
            <span 
              className={`
                text-xs md:text-sm font-medium
                transition-colors duration-150
                ${value === option.value 
                  ? 'text-[var(--quiz-accent)]' 
                  : 'text-[var(--quiz-text-secondary)] group-hover:text-[var(--quiz-text-primary)]'
                }
              `}
            >
              {option.shortLabel}
            </span>
            
            {/* Full Label (screen reader + tooltip on hover) */}
            <span className="sr-only">{option.label}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
