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
        if (!details) {
          return null;
        }
        const score = scores[trait] ?? 0;
        const safeScore = Number.isFinite(scores[trait]) ? scores[trait] : 0;
        const width = Math.max(0, Math.min(100, safeScore));

        return (
          <div className="flex flex-col gap-2" key={trait}>
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>{details.label}</span>
              <span className="text-muted-foreground">{Math.round(safeScore)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
