import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onStartQuiz?: () => void;
}

export function Navbar({ onStartQuiz }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">PersonalityQuiz</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#types" className="text-gray-600 hover:text-gray-900 transition-colors">Personality Types</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onStartQuiz}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              Take Quiz
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#types" className="block text-gray-600 hover:text-gray-900 transition-colors">Personality Types</a>
            <a href="#testimonials" className="block text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
            <div className="pt-4">
              <button 
                onClick={onStartQuiz}
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
              >
                Take Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}