'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How long does it take?',
    answer: 'About ~10 minutes for 120 questions.'
  },
  {
    question: 'Is it free?',
    answer:
      "You'll get a free summary with your Big Five scores. The full report unlock with detailed insights and facet analysis is $3."
  },
  {
    question: 'Do you save my data?',
    answer:
      "Your answers are handled privately. We only store what's necessary to generate your results. You can complete the test without creating an account, and your data is never shared with third parties."
  },
  {
    question: 'What is the Big Five (OCEAN) model?',
    answer:
      'The Big Five personality model is one of the most scientifically validated frameworks in psychology. It measures five core traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 lg:py-24">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">FAQ</h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-toggle-${index}`;
            return (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleItem(index)}
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="font-medium text-foreground">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-5 pt-1"
                  >
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
