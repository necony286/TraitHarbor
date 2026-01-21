import { TRAIT_DATA, type TraitKey } from '../../src/data/traits';

export type { TraitKey } from '../../src/data/traits';

export type TraitScores = Record<TraitKey, number>;

export type TraitDetails = {
  label: string;
  description: string;
  guidance: readonly string[];
};

export const TRAIT_ORDER: TraitKey[] = TRAIT_DATA.map((trait) => trait.key);

export const TRAIT_DETAILS: Record<TraitKey, TraitDetails> = TRAIT_DATA.reduce(
  (acc, trait) => {
    acc[trait.key] = {
      label: trait.name,
      description: trait.description,
      guidance: trait.guidance
    };
    return acc;
  },
  {} as Record<TraitKey, TraitDetails>
);
