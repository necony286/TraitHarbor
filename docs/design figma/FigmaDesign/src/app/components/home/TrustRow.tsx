import { Award, Shield, Info } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Award,
    text: "Based on Big Five (OCEAN)",
  },
  {
    icon: Shield,
    text: "Science-backed / validated model",
  },
  {
    icon: Info,
    text: "Not medical advice",
  },
];

export function TrustRow() {
  return (
    <div className="py-8 border-y border-border/50">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
        {TRUST_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
