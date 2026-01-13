import { PersonalityResult } from '../types/quiz';

interface ResultsDisplayProps {
  result: PersonalityResult;
  onRestart: () => void;
}

export function ResultsDisplay({ result, onRestart }: ResultsDisplayProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${result.color} text-white font-bold text-lg mb-4 shadow-lg`}>
          {result.type}
        </div>
        <h2 className="text-3xl font-bold mb-2">{result.title}</h2>
      </div>

      <div className="mb-8">
        <p className="text-gray-700 text-lg leading-relaxed">
          {result.description}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4">Your Key Traits:</h3>
        <div className="grid grid-cols-2 gap-3">
          {result.traits.map((trait, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-lg bg-gradient-to-r ${result.color} bg-opacity-10 text-center font-medium transition-all hover:shadow-md hover:scale-105`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {trait}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all transform hover:scale-105"
        >
          Take Quiz Again
        </button>
        <button
          onClick={() => {
            const shareText = `I just discovered I'm "${result.type}" - ${result.title}! Take the personality test to find out yours!`;
            if (navigator.share) {
              navigator.share({ text: shareText });
            } else {
              navigator.clipboard.writeText(shareText);
              alert('Result copied to clipboard!');
            }
          }}
          className={`flex-1 py-3 px-6 bg-gradient-to-r ${result.color} text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105`}
        >
          Share Result
        </button>
      </div>
    </div>
  );
}