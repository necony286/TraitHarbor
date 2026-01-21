import { TRAIT_DATA, type TraitKey } from '../../src/data/traits';

export type { TraitKey } from '../../src/data/traits';

export type TraitScores = Record<TraitKey, number>;

export type TraitDetails = {
  label: string;
  description: string;
  guidance: readonly string[];
};

export const TRAIT_ORDER: TraitKey[] = TRAIT_DATA.map((trait) => trait.key);

export const TRAIT_DETAILS = TRAIT_DATA.reduce<Record<TraitKey, TraitDetails>>(
  (accumulator, trait) => {
    accumulator[trait.key] = {
      label: trait.name,
      description: trait.description,
      guidance: trait.guidance
    };

    return accumulator;
  },
  {} as Record<TraitKey, TraitDetails>
);
