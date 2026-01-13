import { ArrowRight, Sparkles } from 'lucide-react';

interface CTAProps {
  onStartQuiz?: () => void;
}

export function CTA({ onStartQuiz }: CTAProps) {
  return (
    <section id="cta" className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm text-white font-medium">Free Forever • No Signup Required</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Discover Who You Really Are?
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join 50,000+ people who have unlocked insights about their personality. Take the quiz now and get instant results.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onStartQuiz}
            className="group px-8 py-4 bg-white text-purple-600 rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Start Your Quiz Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium border-2 border-white/30 hover:bg-white/20 transition-all">
            See Example Results
          </button>
        </div>

        <p className="mt-8 text-white/80 text-sm">
          Takes only 2 minutes • 8 simple questions • Instant personalized results
        </p>
      </div>
    </section>
  );
}