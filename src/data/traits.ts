export const TRAIT_DATA = [
  { key: 'O', name: 'Openness' },
  { key: 'C', name: 'Conscientiousness' },
  { key: 'E', name: 'Extraversion' },
  { key: 'A', name: 'Agreeableness' },
  { key: 'N', name: 'Neuroticism' }
] as const;

export type Trait = (typeof TRAIT_DATA)[number];
export type TraitKey = Trait['key'];
