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

type LikertVariant = 'desktop' | 'mobile';

interface LikertOptionItemProps {
  option: LikertOption;
  isSelected: boolean;
  name: string;
  onChange: (value: number) => void;
  variant: LikertVariant;
}

function LikertOptionItem({ option, isSelected, name, onChange, variant }: LikertOptionItemProps) {
  const isDesktop = variant === 'desktop';
  const labelSpacing = isDesktop ? 'gap-2.5 p-3.5' : 'gap-2 p-3';
  const selectedLabelClasses = isDesktop
    ? 'border-primary bg-primary/10 shadow-sm'
    : 'border-primary bg-primary/10';
  const unselectedLabelClasses = isDesktop
    ? 'border-border bg-background hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm'
    : 'border-border bg-background active:border-primary/50 active:bg-muted/50';
  const indicatorSize = isDesktop ? 'w-5 h-5' : 'w-4 h-4';
  const indicatorSelectedClasses = isDesktop
    ? 'border-primary bg-primary scale-110'
    : 'border-primary bg-primary';

  return (
    <div className={isDesktop ? '' : 'relative flex-1 group'}>
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
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 scroll-mt-24 scroll-mb-32"
        />

        <div
          className={`
            ${indicatorSize} rounded-full border-2 flex items-center justify-center
            transition-all duration-200 ease-out motion-reduce:transition-none
            ${isSelected ? indicatorSelectedClasses : 'border-muted-foreground/30'}
          `}
        >
          {isSelected && <div className={`${isDesktop ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full bg-white`} />}
        </div>

        <span
          className={`
            text-xs font-medium ${isDesktop ? 'text-center leading-tight' : ''} transition-colors duration-200
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}
        >
          {isDesktop ? option.label : option.shortLabel}
        </span>

        {!isDesktop && <span className="sr-only">{option.label}</span>}
      </label>

      {!isDesktop && (
        <div
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
            bg-foreground text-background text-xs rounded-md whitespace-nowrap
            opacity-0 pointer-events-none transition-opacity duration-200
            group-active:opacity-100
          `}
          aria-hidden="true"
        >
          {option.label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

export function LikertScale({ name, value, onChange, questionId }: LikertScaleProps) {
  return (
    <div role="radiogroup" aria-labelledby={`question-${questionId}`} className="space-y-3">
      <div className="hidden md:grid grid-cols-5 gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <LikertOptionItem
              key={option.value}
              option={option}
              isSelected={isSelected}
              name={name}
              onChange={onChange}
              variant="desktop"
            />
          );
        })}
      </div>

      <div className="flex md:hidden gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <LikertOptionItem
              key={option.value}
              option={option}
              isSelected={isSelected}
              name={name}
              onChange={onChange}
              variant="mobile"
            />
          );
        })}
      </div>
    </div>
  );
}
