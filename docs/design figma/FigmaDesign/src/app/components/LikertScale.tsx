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
      className="grid grid-cols-5 gap-2"
    >
      {LIKERT_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <label
            key={option.value}
            className={`
              relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer
              transition-all duration-150 ease-out motion-reduce:transition-none
              ${isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'
              }
              focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring
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
            
            {/* Visual indicator */}
            <div 
              className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                transition-all duration-150 ease-out motion-reduce:transition-none
                ${isSelected 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground/30'
                }
              `}
            >
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
            
            {/* Short label - visible */}
            <span 
              className="text-xs font-medium text-foreground" 
              aria-hidden="true"
            >
              {option.shortLabel}
            </span>
            
            {/* Full label - screen reader only */}
            <span className="sr-only">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
