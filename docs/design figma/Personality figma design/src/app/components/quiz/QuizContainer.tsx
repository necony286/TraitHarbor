import { useState } from 'react';
import { QuizPage } from './QuizPage';
import { getQuestionsForPage, getCategoryForPage, TOTAL_PAGES } from '@/app/data/quizQuestions';

interface QuizContainerProps {
  onComplete?: (answers: Record<number, number>) => void;
}

export function QuizContainer({ onComplete }: QuizContainerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const currentQuestions = getQuestionsForPage(currentPage);
  const currentCategory = getCategoryForPage(currentPage);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Call the onComplete callback with all answers
    if (onComplete) {
      onComplete(answers);
    } else {
      // Default behavior: log answers and show completion message
      console.log('Quiz completed!', answers);
      alert(`Quiz completed! You answered ${Object.keys(answers).length} out of 120 questions.`);
    }
  };

  return (
    <QuizPage
      currentPage={currentPage}
      totalPages={TOTAL_PAGES}
      questions={currentQuestions}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onSubmit={handleSubmit}
      categoryTitle={currentCategory}
    />
  );
}
