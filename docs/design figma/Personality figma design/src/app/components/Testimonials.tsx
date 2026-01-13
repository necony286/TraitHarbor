import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'The Visionary',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    content: 'This quiz gave me such clarity! The results were spot-on and helped me understand why I approach challenges the way I do.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'The Architect',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    content: 'I was skeptical at first, but the detailed breakdown of my personality type was incredibly accurate and insightful.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'The Advocate',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    content: 'Finally, a personality test that feels authentic! It helped me recognize my strengths and embrace who I truly am.',
    rating: 5
  },
  {
    name: 'David Park',
    role: 'The Strategist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    content: 'The quiz is quick, beautifully designed, and the results gave me valuable insights for both work and personal life.',
    rating: 5
  },
  {
    name: 'Lisa Thompson',
    role: 'The Explorer',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    content: 'Shared this with my whole team! It sparked great conversations and helped us understand each other better.',
    rating: 5
  },
  {
    name: 'James Wilson',
    role: 'The Achiever',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    content: 'Best personality quiz I\'ve taken. The results resonated deeply and gave me a new perspective on my goals.',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            What People{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discovered
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            See how our personality quiz has helped thousands gain self-awareness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <Quote className="w-10 h-10 text-purple-200 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-purple-600 font-medium">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              50,000+
            </div>
            <div className="text-gray-600">Quizzes Taken</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              98%
            </div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              4.9/5
            </div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              2 min
            </div>
            <div className="text-gray-600">To Complete</div>
          </div>
        </div>
      </div>
    </section>
  );
}