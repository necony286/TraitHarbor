import { ProgressBar } from "@/app/components/ProgressBar";

interface QuizHeaderProps {
  title: string;
  subtitle?: string;
  currentPage: number;
  totalPages: number;
  answeredCount: number;
  totalQuestions: number;
}

export function QuizHeader({
  title,
  subtitle,
  currentPage,
  totalPages,
  answeredCount,
  totalQuestions,
}: QuizHeaderProps) {
  const percentage = Math.round((answeredCount / totalQuestions) * 100);
  
  return (
    <header className="space-y-6">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-sm">
          <svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <span className="text-lg font-semibold text-foreground">TraitHarbor</span>
      </div>

      <div className="space-y-2">
        {subtitle && (
          <p className="text-sm text-[#2563eb] font-medium tracking-wide uppercase">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
          {title}
        </h1>
      </div>
      
      <ProgressBar current={answeredCount} total={totalQuestions} />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
        </span>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{answeredCount}</span>/{totalQuestions} answered
          <span className="ml-2 text-xs text-[#2563eb] font-medium">({percentage}%)</span>
        </span>
      </div>
    </header>
  );
}