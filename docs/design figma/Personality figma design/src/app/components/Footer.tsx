import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from 'lucide-react';

const footerLinks = {
  quiz: [
    { name: 'Take the Quiz', href: '#quiz' },
    { name: 'Personality Types', href: '#types' },
    { name: 'How It Works', href: '#features' },
    { name: 'Sample Results', href: '#' },
    { name: 'Share Your Results', href: '#' }
  ],
  about: [
    { name: 'About Us', href: '#' },
    { name: 'Our Methodology', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Press', href: '#' },
    { name: 'Contact', href: '#contact' }
  ],
  resources: [
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Community', href: '#' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ]
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-gray-400">Get the latest news and updates delivered to your inbox.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white">PersonalityQuiz</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Discover your true personality type with our scientifically-designed assessment. Join thousands in unlocking self-awareness.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quiz</h4>
            <ul className="space-y-3">
              {footerLinks.quiz.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 PersonalityQuiz. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}