import { Question } from '../types/quiz';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (optionIndex: number) => void;
}

export function QuizQuestion({ question, selectedAnswer, onSelectAnswer }: QuizQuestionProps) {
  return (
    <div className="w-full max-w-2xl animate-fadeIn">
      <h2 className="text-2xl mb-8 text-center">{question.text}</h2>
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] ${
              selectedAnswer === index
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-500 scale-110'
                    : 'border-gray-300'
                }`}
              >
                {selectedAnswer === index && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="flex-1">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}