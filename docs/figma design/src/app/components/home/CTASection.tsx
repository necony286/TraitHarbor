import { ArrowRight, Sparkles } from "lucide-react";

interface CTASectionProps {
  onStartTest: () => void;
}

export function CTASection({ onStartTest }: CTASectionProps) {
  const handlePreviewQuestions = () => {
    // Scroll to How It Works section
    const howItWorksSection = document.querySelector('section');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#d946ef] p-12 lg:p-16 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative z-10 text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Free forever • no signup required</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-medium text-white leading-tight">
                Ready to discover who you really are?
              </h2>
              <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of people who have unlocked insights about their personality. Take the quiz now and get instant results.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartTest}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6366f1] rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start your quiz now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
              
              <button
                onClick={handlePreviewQuestions}
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/40 text-white rounded-xl font-medium backdrop-blur-sm hover:bg-white/10 hover:border-white/60 active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Preview questions
              </button>
            </div>

            {/* Meta text */}
            <div className="pt-4">
              <p className="text-sm text-white/70">
                Takes about 10 minutes • 120 thoughtful prompts • Instant results
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
