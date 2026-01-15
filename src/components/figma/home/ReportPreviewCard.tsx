import { BarChart3, TrendingUp, Users } from 'lucide-react';

const TRAITS = [
  { name: 'Openness', score: 72 },
  { name: 'Conscientiousness', score: 85 },
  { name: 'Extraversion', score: 58 },
  { name: 'Agreeableness', score: 68 },
  { name: 'Neuroticism', score: 45 }
];

export function ReportPreviewCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-brand" />
        <h3 className="font-medium text-foreground">Your Profile Preview</h3>
      </div>

      <div className="space-y-4 mb-6">
        {TRAITS.map((trait) => (
          <div key={trait.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{trait.name}</span>
              <span className="text-muted-foreground">{trait.score}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{
                  width: `${trait.score}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            High conscientiousness suggests strong organizational skills
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Moderate extraversion indicates balanced social preferences
          </p>
        </div>
      </div>
    </div>
  );
}
