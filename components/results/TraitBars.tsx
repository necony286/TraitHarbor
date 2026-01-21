import { TRAIT_DETAILS, TRAIT_ORDER, type TraitKey, type TraitScores } from './traitData';

type TraitBarsProps = {
  scores: TraitScores;
  traits?: TraitKey[];
};

export function TraitBars({ scores, traits = TRAIT_ORDER }: TraitBarsProps) {
  return (
    <>
      {traits.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

        return (
          <div className="flex flex-col gap-2" key={trait}>
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>{details.label}</span>
              <span className="text-muted-foreground">{Math.round(score)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-strong"
                style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
