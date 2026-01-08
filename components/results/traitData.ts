export type TraitKey = 'O' | 'C' | 'E' | 'A' | 'N';

export type TraitScores = Record<TraitKey, number>;

export type TraitDetails = {
  label: string;
  description: string;
  guidance: string[];
};

export const TRAIT_ORDER: TraitKey[] = ['O', 'C', 'E', 'A', 'N'];

export const TRAIT_DETAILS: Record<TraitKey, TraitDetails> = {
  O: {
    label: 'Openness',
    description:
      'You lean into curiosity, new ideas, and creative exploration. High openness often shows up as imagination and comfort with change.',
    guidance: ['Try a new hobby or course this month.', 'Balance novelty with a simple routine to stay grounded.']
  },
  C: {
    label: 'Conscientiousness',
    description:
      'You value structure, follow-through, and steady progress. Strong conscientiousness supports reliability and goal achievement.',
    guidance: ['Set one clear priority each morning.', 'Celebrate small wins to keep momentum.']
  },
  E: {
    label: 'Extraversion',
    description:
      'You gain energy from people and active environments. Extraversion highlights social confidence and enthusiasm.',
    guidance: ['Schedule one social recharge each week.', 'Build in quiet time after busy days.']
  },
  A: {
    label: 'Agreeableness',
    description:
      'You focus on empathy, cooperation, and keeping relationships harmonious. High agreeableness often means you are a supportive teammate.',
    guidance: ['Practice saying yes and no with the same kindness.', 'Ask for feedback directly when you need clarity.']
  },
  N: {
    label: 'Neuroticism',
    description:
      'You feel emotions intensely and notice potential risks quickly. This sensitivity can help you prepare, especially with healthy coping strategies.',
    guidance: ['Use a calming ritual when stress spikes.', 'Name the feeling before reacting to it.']
  }
};
