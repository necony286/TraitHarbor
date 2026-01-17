interface LikertOption {
  value: string;
  label: string;
  shortLabel: string;
}

const LIKERT_OPTIONS: LikertOption[] = [
  { value: "strongly-disagree", label: "Strongly Disagree", shortLabel: "SD" },
  { value: "disagree", label: "Disagree", shortLabel: "D" },
  { value: "neutral", label: "Neutral", shortLabel: "N" },
  { value: "agree", label: "Agree", shortLabel: "A" },
  { value: "strongly-agree", label: "Strongly Agree", shortLabel: "SA" },
];

interface LikertScaleProps {
  name: string;
  value: string | null;
  onChange: (value: string) => void;
  questionId: string;
}

export function LikertScale({ name, value, onChange, questionId }: LikertScaleProps) {
  return (
    <div 
      role="radiogroup" 
      aria-labelledby={`question-${questionId}`}
      className="space-y-3"
    >
      {/* Desktop: Grid Layout with Full Labels */}
      <div className="hidden md:grid grid-cols-5 gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <label
              key={option.value}
              className={`
                relative flex flex-col items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ease-out motion-reduce:transition-none
                ${isSelected 
                  ? 'border-[#2563eb] bg-[#2563eb]/10 shadow-sm' 
                  : 'border-border bg-background hover:border-[#2563eb]/50 hover:bg-muted/50 hover:shadow-sm'
                }
                focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2563eb]/50
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              
              {/* Radio indicator */}
              <div 
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 ease-out motion-reduce:transition-none
                  ${isSelected 
                    ? 'border-[#2563eb] bg-[#2563eb] scale-110' 
                    : 'border-muted-foreground/30'
                  }
                `}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              
              {/* Full label - visible on desktop */}
              <span 
                className={`
                  text-xs font-medium text-center leading-tight
                  transition-colors duration-200
                  ${isSelected ? 'text-[#2563eb]' : 'text-foreground'}
                `}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Mobile: Compact Layout with Tooltips */}
      <div className="flex md:hidden gap-2">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <div key={option.value} className="relative flex-1 group">
              <label
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                  transition-all duration-200 ease-out motion-reduce:transition-none
                  ${isSelected 
                    ? 'border-[#2563eb] bg-[#2563eb]/10' 
                    : 'border-border bg-background active:border-[#2563eb]/50 active:bg-muted/50'
                  }
                  focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2563eb]/50
                `}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                />
                
                {/* Radio indicator */}
                <div 
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200 ease-out motion-reduce:transition-none
                    ${isSelected 
                      ? 'border-[#2563eb] bg-[#2563eb]' 
                      : 'border-muted-foreground/30'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                
                {/* Short label */}
                <span 
                  className={`
                    text-xs font-medium
                    transition-colors duration-200
                    ${isSelected ? 'text-[#2563eb]' : 'text-foreground'}
                  `}
                >
                  {option.shortLabel}
                </span>
                
                {/* Full label - screen reader */}
                <span className="sr-only">{option.label}</span>
              </label>

              {/* Tooltip - shows on active/touch */}
              <div 
                className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                  bg-gray-900 text-white text-xs rounded-md whitespace-nowrap
                  opacity-0 pointer-events-none
                  transition-opacity duration-200
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