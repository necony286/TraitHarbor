import React from 'react';

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

interface LikertScaleProps {
  name: string;
  value: number | null;
  onChange: (value: number) => void;
  questionId: string;
}

export function LikertScale({ name, value, onChange, questionId }: LikertScaleProps) {
  return (
    <div role="radiogroup" aria-labelledby={`question-${questionId}`} className="grid grid-cols-5 gap-2">
      {LIKERT_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            className={`
              relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer
              transition-all duration-150 ease-out motion-reduce:transition-none
              ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'}
              focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              aria-label={option.label}
              className="sr-only"
            />

            <div
              className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                transition-all duration-150 ease-out motion-reduce:transition-none
                ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
              `}
            >
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
            </div>

            <span className="text-xs font-medium text-foreground" aria-hidden="true">
              {option.shortLabel}
            </span>

            <span className="sr-only">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
