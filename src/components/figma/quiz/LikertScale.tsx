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
    <div role="radiogroup" aria-labelledby={`question-${questionId}`} className="space-y-3">
      <div className="hidden md:grid grid-cols-5 gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`
                relative flex flex-col items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ease-out motion-reduce:transition-none
                ${isSelected ? 'border-[#2563eb] bg-[#2563eb]/10 shadow-sm' : 'border-border bg-background hover:border-[#2563eb]/50 hover:bg-muted/50 hover:shadow-sm'}
                focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2563eb]/50
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 ease-out motion-reduce:transition-none
                  ${isSelected ? 'border-[#2563eb] bg-[#2563eb] scale-110' : 'border-muted-foreground/30'}
                `}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              <span
                className={`
                  text-xs font-medium text-center leading-tight transition-colors duration-200
                  ${isSelected ? 'text-[#2563eb]' : 'text-foreground'}
                `}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex md:hidden gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <div key={option.value} className="relative flex-1 group">
              <label
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                  transition-all duration-200 ease-out motion-reduce:transition-none
                  ${isSelected ? 'border-[#2563eb] bg-[#2563eb]/10' : 'border-border bg-background active:border-[#2563eb]/50 active:bg-muted/50'}
                  focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2563eb]/50
                `}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />

                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200 ease-out motion-reduce:transition-none
                    ${isSelected ? 'border-[#2563eb] bg-[#2563eb]' : 'border-muted-foreground/30'}
                  `}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <span
                  className={`
                    text-xs font-medium transition-colors duration-200
                    ${isSelected ? 'text-[#2563eb]' : 'text-foreground'}
                  `}
                >
                  {option.shortLabel}
                </span>

                <span className="sr-only">{option.label}</span>
              </label>

              <div
                className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                  bg-gray-900 text-white text-xs rounded-md whitespace-nowrap
                  opacity-0 pointer-events-none transition-opacity duration-200
                  ${isSelected ? 'group-active:opacity-100' : ''}
                `}
                aria-hidden="true"
              >
                {option.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                  <div className="border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
