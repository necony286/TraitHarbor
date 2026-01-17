import { LikertScale } from "@/app/components/LikertScale";

interface QuestionRowProps {
  questionId: string;
  questionNumber: number;
  questionText: string;
  value: string | null;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function QuestionRow({
  questionId,
  questionNumber,
  questionText,
  value,
  onChange,
  hasError = false,
}: QuestionRowProps) {
  return (
    <div 
      className={`
        p-4 lg:p-6 rounded-lg border transition-all duration-200 motion-reduce:transition-none
        ${hasError 
          ? 'border-destructive/50 bg-destructive/5' 
          : 'border-border bg-card'
        }
      `}
    >
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[1fr_auto] lg:gap-8 lg:items-center">
        {/* Question prompt */}
        <div className="space-y-1">
          <p 
            id={`question-${questionId}`}
            className="text-sm lg:text-base font-medium text-foreground leading-relaxed"
          >
            <span className="text-muted-foreground mr-2">{questionNumber}.</span>
            {questionText}
          </p>
          {hasError && (
            <p className="text-xs text-destructive" role="alert">
              Please select an answer
            </p>
          )}
        </div>
        
        {/* Likert scale */}
        <div className="lg:min-w-[420px]">
          <LikertScale
            name={`question-${questionId}`}
            value={value}
            onChange={onChange}
            questionId={questionId}
          />
        </div>
      </div>
    </div>
  );
}
