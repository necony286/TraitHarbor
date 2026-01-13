import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroProps {
  onStartQuiz?: () => void;
}

export function Hero({ onStartQuiz }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-8 shadow-sm">
            <CheckCircle className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-700">Taken by 50,000+ people worldwide</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Discover Your True
            </span>
            <br />
            <span className="text-gray-900">Personality Type</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Take our scientifically-designed personality assessment and unlock insights about your unique traits, strengths, and potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={onStartQuiz}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Take the Quiz Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
              Learn More
            </button>
          </div>

          <div className="flex flex-wrap gap-8 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>100% Free • No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Only 8 questions • 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Instant results</span>
            </div>
          </div>
        </div>

        {/* Quiz Preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-white/50 backdrop-blur-sm">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">?</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">!</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <p className="text-gray-700 text-lg font-medium">8 Thoughtful Questions • Beautiful Results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </section>
  );
}