import { Zap, Shield, Users, BarChart3, Sparkles, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Quick & Easy',
    description: 'Complete the assessment in just 2 minutes with 8 carefully crafted questions designed to reveal your core personality traits.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Sparkles,
    title: 'Scientifically Designed',
    description: 'Our quiz is based on proven personality psychology frameworks to provide accurate and meaningful insights about who you are.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BarChart3,
    title: 'Detailed Results',
    description: 'Receive a comprehensive breakdown of your personality type with strengths, characteristics, and personalized recommendations.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: '8 Unique Types',
    description: 'Discover which of 8 distinct personality types you are, from The Visionary to The Advocate, each with unique traits.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Globe,
    title: 'Share Your Results',
    description: 'Easily share your personality results with friends, family, or colleagues to better understand each other.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Shield,
    title: 'Completely Private',
    description: 'No signup required. Your answers and results are completely anonymous and never stored or shared.',
    color: 'from-red-500 to-pink-500'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Why Take Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personality Quiz?
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            A modern approach to self-discovery with instant, actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}