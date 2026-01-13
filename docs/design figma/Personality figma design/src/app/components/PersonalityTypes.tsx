import { Lightbulb, Building2, Heart, BookOpen, Compass, Brain, Users2, Rocket } from 'lucide-react';

const personalityTypes = [
  {
    icon: Lightbulb,
    name: 'The Visionary',
    description: 'Creative thinkers who see possibilities everywhere and inspire others with innovative ideas.',
    color: 'from-yellow-500 to-orange-500',
    traits: ['Innovative', 'Creative', 'Forward-thinking']
  },
  {
    icon: Building2,
    name: 'The Architect',
    description: 'Strategic planners who excel at organizing complex systems and building lasting structures.',
    color: 'from-blue-500 to-cyan-500',
    traits: ['Organized', 'Strategic', 'Analytical']
  },
  {
    icon: Heart,
    name: 'The Advocate',
    description: 'Compassionate souls dedicated to helping others and making the world a better place.',
    color: 'from-pink-500 to-red-500',
    traits: ['Empathetic', 'Caring', 'Idealistic']
  },
  {
    icon: BookOpen,
    name: 'The Scholar',
    description: 'Curious minds who love learning and sharing knowledge with deep intellectual insights.',
    color: 'from-indigo-500 to-purple-500',
    traits: ['Intellectual', 'Curious', 'Knowledgeable']
  },
  {
    icon: Compass,
    name: 'The Explorer',
    description: 'Adventurous spirits who thrive on new experiences and embrace the unknown with enthusiasm.',
    color: 'from-green-500 to-emerald-500',
    traits: ['Adventurous', 'Spontaneous', 'Bold']
  },
  {
    icon: Brain,
    name: 'The Strategist',
    description: 'Logical thinkers who excel at problem-solving and making calculated decisions.',
    color: 'from-purple-600 to-indigo-600',
    traits: ['Logical', 'Strategic', 'Efficient']
  },
  {
    icon: Users2,
    name: 'The Connector',
    description: 'Natural networkers who build bridges between people and create harmonious communities.',
    color: 'from-teal-500 to-cyan-500',
    traits: ['Social', 'Diplomatic', 'Harmonious']
  },
  {
    icon: Rocket,
    name: 'The Achiever',
    description: 'Goal-oriented individuals driven by success and motivated to reach their full potential.',
    color: 'from-orange-500 to-red-500',
    traits: ['Driven', 'Ambitious', 'Results-focused']
  }
];

interface PersonalityTypesProps {
  onStartQuiz?: () => void;
}

export function PersonalityTypes({ onStartQuiz }: PersonalityTypesProps) {
  return (
    <section id="types" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personality Type
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Our quiz identifies 8 unique personality types, each with distinct traits and characteristics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalityTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{type.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  {type.traits.map((trait, traitIndex) => (
                    <span
                      key={traitIndex}
                      className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg">Which personality type are you?</p>
          <button 
            onClick={onStartQuiz}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Take the Quiz to Find Out
          </button>
        </div>
      </div>
    </section>
  );
}