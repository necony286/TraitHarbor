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
  errorId?: string;
  isInvalid?: boolean;
}

interface LikertOptionItemProps {
  option: LikertOption;
  isSelected: boolean;
  name: string;
  onChange: (value: number) => void;
}

function LikertOptionItem({ option, isSelected, name, onChange }: LikertOptionItemProps) {
  const labelSpacing = 'gap-2 p-3 md:gap-2.5 md:p-3.5';
  const selectedLabelClasses = 'border-primary bg-primary/10 md:shadow-sm';
  const unselectedLabelClasses =
    'border-border bg-background active:border-primary/50 active:bg-muted/50 md:hover:border-primary/50 md:hover:bg-muted/50 md:hover:shadow-sm';
  const indicatorSize = 'w-4 h-4 md:w-5 md:h-5';
  const indicatorSelectedClasses = 'border-primary bg-primary md:scale-110';

  return (
    <div className="relative flex-1 group md:flex-none">
      <label
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer ${labelSpacing}
          transition-all duration-200 ease-out motion-reduce:transition-none
          ${isSelected ? selectedLabelClasses : unselectedLabelClasses}
          focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary/50
        `}
      >
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={isSelected}
          onChange={() => onChange(option.value)}
          aria-label={option.label}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 scroll-mt-24 scroll-mb-32"
        />

        <div
          className={`
            ${indicatorSize} rounded-full border-2 flex items-center justify-center
            transition-all duration-200 ease-out motion-reduce:transition-none
            ${isSelected ? indicatorSelectedClasses : 'border-muted-foreground/30'}
          `}
        >
          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white md:h-2 md:w-2" />}
        </div>

        <span
          className={`
            text-xs font-medium transition-colors duration-200 md:text-center md:leading-tight
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}
        >
          <span className="md:hidden" aria-hidden="true">
            {option.shortLabel}
          </span>
          <span className="hidden md:inline">
            {option.label}
          </span>
        </span>

        <span className="sr-only md:hidden">{option.label}</span>
      </label>

      <div
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
          bg-foreground text-background text-xs rounded-md whitespace-nowrap
          opacity-0 pointer-events-none transition-opacity duration-200
          group-active:opacity-100 md:hidden
        `}
        aria-hidden="true"
      >
        {option.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-foreground" />
        </div>
      </div>
    </div>
  );
}

export function LikertScale({ name, value, onChange, questionId, errorId, isInvalid }: LikertScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`question-${questionId}`}
      aria-describedby={isInvalid ? errorId : undefined}
      aria-invalid={isInvalid ? true : undefined}
      className="space-y-3"
    >
      <div className="flex gap-2 md:grid md:grid-cols-5">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <LikertOptionItem
              key={option.value}
              option={option}
              isSelected={isSelected}
              name={name}
              onChange={onChange}
            />
          );
        })}
      </div>
    </div>
  );
}
