import { ClipboardList, Eye, Unlock } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Answer 120 questions",
    description: "Takes about 10 minutes. Simple Likert scale responses.",
  },
  {
    icon: Eye,
    title: "Get your free summary",
    description: "Instant Big Five scores with basic interpretations.",
  },
  {
    icon: Unlock,
    title: "Unlock full report for $3",
    description: "Deep insights, facets, and personalized recommendations.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
          How it works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="relative bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-sm font-medium shadow-md">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2563eb]/10 rounded-xl">
                  <Icon className="w-6 h-6 text-[#2563eb]" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-medium text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
