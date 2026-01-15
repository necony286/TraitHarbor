import { ProgressBar } from '@/components/figma/ProgressBar';

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
  totalQuestions
}: QuizHeaderProps) {
  return (
    <header className="space-y-6">
      <div className="space-y-2">
        {subtitle && <p className="text-sm text-muted-foreground tracking-wide">{subtitle}</p>}
        <h1 className="text-xl lg:text-2xl font-medium text-foreground">{title}</h1>
      </div>

      <ProgressBar current={answeredCount} total={totalQuestions} />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <span>
          {answeredCount}/{totalQuestions} answered
        </span>
      </div>
    </header>
  );
}
