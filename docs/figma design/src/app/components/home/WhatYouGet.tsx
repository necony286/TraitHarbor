import { MessageSquare, Briefcase, Heart } from "lucide-react";

const EXAMPLE_INSIGHTS = [
  {
    tag: "Communication",
    icon: MessageSquare,
    headline: "You prefer depth over breadth",
    description:
      "Your profile suggests you value meaningful one-on-one conversations over large social gatherings.",
  },
  {
    tag: "Work style",
    icon: Briefcase,
    headline: "Structured approach to tasks",
    description:
      "High conscientiousness indicates you thrive with clear plans and systematic processes.",
  },
  {
    tag: "Relationships",
    icon: Heart,
    headline: "Balanced emotional expression",
    description:
      "Moderate agreeableness means you balance empathy with healthy boundaries.",
  },
];

const DETAILED_TRAITS = [
  { name: "Openness", score: 72 },
  { name: "Conscientiousness", score: 85 },
  { name: "Extraversion", score: 58 },
  { name: "Agreeableness", score: 68 },
  { name: "Neuroticism", score: 45 },
];

export function WhatYouGet() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
            What you get
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Report preview */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-md">
            <h3 className="font-medium text-foreground mb-6">
              Your Big Five Profile
            </h3>

            <div className="space-y-5 mb-6">
              {DETAILED_TRAITS.map((trait) => (
                <div key={trait.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {trait.name}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {trait.score}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Includes facet-level insights for each trait
              </p>
            </div>
          </div>

          {/* Right: Example insights */}
          <div className="space-y-4">
            {EXAMPLE_INSIGHTS.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#2563eb]/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#2563eb]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="inline-block px-2 py-0.5 bg-[#2563eb]/10 text-[#2563eb] text-xs font-medium rounded mb-2">
                        {insight.tag}
                      </div>
                      <h4 className="font-medium text-foreground">
                        {insight.headline}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
