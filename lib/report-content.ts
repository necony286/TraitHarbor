type ScoreBand = 'High' | 'Medium' | 'Low';

type NarrativeVoice = {
  subject: string;
  subjectPronoun: 'you' | 'they';
  objectPronoun: 'you' | 'them';
  possessiveDeterminer: 'your' | 'their';
  possessiveAdjective: 'Your' | 'Their';
  possessiveName: string;
};

const getScoreBand = (score: number): ScoreBand => {
  if (score >= 70) {
    return 'High';
  }
  if (score >= 40) {
    return 'Medium';
  }
  return 'Low';
};

const normalizeTrait = (trait: string) => trait.trim().toLowerCase();

type TraitName = 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism';

const traitKeyMap: Record<string, TraitName> = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Neuroticism'
};

const resolveTraitName = (trait: string) => {
  const normalized = normalizeTrait(trait);
  return traitKeyMap[normalized] ?? trait.trim();
};

const NARRATIVE_VOICE: NarrativeVoice = {
  subject: 'You',
  subjectPronoun: 'you',
  objectPronoun: 'you',
  possessiveDeterminer: 'your',
  possessiveAdjective: 'Your',
  possessiveName: 'Your'
};

const traitContent: Record<
  TraitName,
  Record<ScoreBand, { strengths: string[]; growth: string[]; workStyle: string[]; relationships: string[] }>
> = {
  Openness: {
    High: {
      strengths: [
        'You absorb new ideas quickly and enjoy exploring novel perspectives.',
        'You use creativity and curiosity to spot unconventional solutions.'
      ],
      growth: [
        'You balance experimentation with follow-through to keep momentum.',
        'You anchor big ideas in practical next steps.'
      ],
      workStyle: [
        'You thrive in roles that reward experimentation and imaginative thinking.',
        'You enjoy work that encourages learning and variety.'
      ],
      relationships: [
        'You bring an open-minded, curious energy to conversations.',
        'You share new experiences to deepen your connections.'
      ]
    },
    Medium: {
      strengths: [
        'You can blend creativity with practicality when tackling challenges.',
        'You stay open to new ideas while valuing proven approaches.'
      ],
      growth: [
        'You seek out occasional novelty to keep your thinking flexible.',
        'You give yourself permission to experiment in low-risk ways.'
      ],
      workStyle: [
        'You adapt well to a mix of routine and innovation.',
        'You appreciate teams that value both creativity and execution.'
      ],
      relationships: [
        'You balance curiosity with respect for familiar routines.',
        'You stay open to others\' ideas to keep collaboration smooth.'
      ]
    },
    Low: {
      strengths: [
        'You value proven methods and keep your focus on what works.',
        'Your practical thinking helps you stay grounded.'
      ],
      growth: [
        'You try small experiments to expand your comfort zone.',
        'You invite fresh perspectives to avoid blind spots.'
      ],
      workStyle: [
        'You excel in environments with clear expectations and structure.',
        'Your consistency and reliability are strengths you bring to teams.'
      ],
      relationships: [
        'You offer steadiness and dependability to others.',
        'You occasionally explore new experiences together to add variety.'
      ]
    }
  },
  Conscientiousness: {
    High: {
      strengths: [
        'You are organized, dependable, and follow through on commitments.',
        'You plan ahead to deliver consistent results.'
      ],
      growth: [
        'You allow room for flexibility when plans change.',
        'You avoid overextending by prioritizing what matters most.'
      ],
      workStyle: [
        'You thrive in roles that reward structure, planning, and ownership.',
        'Your clear goals and timelines keep you energized.'
      ],
      relationships: [
        'You show care by being reliable and considerate.',
        'You remember to balance responsibility with spontaneous moments.'
      ]
    },
    Medium: {
      strengths: [
        'You balance structure with adaptability in your approach.',
        'You can plan ahead while staying open to change.'
      ],
      growth: [
        'You build simple routines to support your goals.',
        'You clarify priorities to avoid unnecessary stress.'
      ],
      workStyle: [
        'You work well in environments that offer guidance with flexibility.',
        'You appreciate clear expectations without rigid constraints.'
      ],
      relationships: [
        'You contribute steady support without being overly rigid.',
        'Your consistent follow-through strengthens trust.'
      ]
    },
    Low: {
      strengths: [
        'You stay flexible and can adapt quickly to new situations.',
        'You keep things light when plans shift unexpectedly.'
      ],
      growth: [
        'You set small, achievable routines to build momentum.',
        'You use reminders or checklists to support follow-through.'
      ],
      workStyle: [
        'You enjoy roles that allow spontaneity and change.',
        'You use short sprints and clear checkpoints to stay on track.'
      ],
      relationships: [
        'Your flexibility can keep relationships easygoing.',
        'Your follow-through on shared plans helps others feel supported.'
      ]
    }
  },
  Extraversion: {
    High: {
      strengths: [
        'You bring energy to groups and enjoy engaging with others.',
        'Your social confidence helps you build momentum quickly.'
      ],
      growth: [
        'You make space for quiet reflection to recharge fully.',
        'You balance talking with active listening.'
      ],
      workStyle: [
        'You thrive in collaborative, high-interaction environments.',
        'You feel energized by opportunities to lead or present.'
      ],
      relationships: [
        'You help others feel welcomed and connected.',
        'You pause to listen to deepen understanding.'
      ]
    },
    Medium: {
      strengths: [
        'You can engage socially while still valuing downtime.',
        'You adapt to both collaborative and independent work.'
      ],
      growth: [
        'You notice when you need more stimulation versus quiet focus.',
        'You lean into networking when it aligns with your goals.'
      ],
      workStyle: [
        'You work well with a mix of collaboration and solo focus.',
        'You stay steady in balanced environments.'
      ],
      relationships: [
        'You can connect easily while respecting others\' pace.',
        'You mix social time with downtime to stay balanced.'
      ]
    },
    Low: {
      strengths: [
        'You are thoughtful, observant, and comfortable with quiet focus.',
        'You listen deeply and avoid unnecessary distractions.'
      ],
      growth: [
        'You seek supportive social settings to expand your comfort zone.',
        'You practice sharing ideas early rather than waiting too long.'
      ],
      workStyle: [
        'You excel in roles with deep focus and independent work.',
        'You use quiet time to produce your best work.'
      ],
      relationships: [
        'You offer steady, attentive presence to those close to you.',
        'You let others in gradually to strengthen bonds.'
      ]
    }
  },
  Agreeableness: {
    High: {
      strengths: [
        'You are supportive, cooperative, and considerate of others.',
        'Your empathy helps you build trust quickly.'
      ],
      growth: [
        'You set boundaries so your needs stay visible.',
        'You practice advocating for yourself in tough conversations.'
      ],
      workStyle: [
        'You foster harmony and collaboration on teams.',
        'You make people feel safe sharing ideas around you.'
      ],
      relationships: [
        'You show care through kindness and understanding.',
        'Your clear boundaries help relationships stay balanced.'
      ]
    },
    Medium: {
      strengths: [
        'You balance empathy with honest feedback.',
        'You can collaborate while maintaining your own perspective.'
      ],
      growth: [
        'You lean into curiosity when conflict arises.',
        'You offer appreciation explicitly to reinforce connection.'
      ],
      workStyle: [
        'You can work well in teams while staying objective.',
        'You value both harmony and performance.'
      ],
      relationships: [
        'You bring a blend of warmth and clarity to communication.',
        'You stay open to compromise to keep relationships steady.'
      ]
    },
    Low: {
      strengths: [
        'You are direct, candid, and willing to make tough calls.',
        'You can stay objective in emotionally charged situations.'
      ],
      growth: [
        'You practice acknowledging others\' feelings before debating solutions.',
'Your small gestures of appreciation can go a long way.'
      ],
      workStyle: [
        'You are comfortable with constructive critique and debate.',
'You collaborate more effectively when expectations are clear.'
      ],
      relationships: [
        'Your honesty can help others see issues clearly.',
        'You show warmth intentionally to deepen trust.'
      ]
    }
  },
  Neuroticism: {
    High: {
      strengths: [
        'You are sensitive to risks and notice potential issues early.',
        'Your vigilance can help you prepare thoroughly.'
      ],
      growth: [
        'You build stress-reduction rituals to protect your energy.',
        'You challenge anxious thoughts with evidence and perspective.'
      ],
      workStyle: [
        'You benefit from clear expectations and regular check-ins.',
        'You use structured plans to reduce uncertainty.'
      ],
      relationships: [
        'You use honest communication about stress so others can support you.',
        'Your self-soothing habits keep emotions from overwhelming connection.'
      ]
    },
    Medium: {
      strengths: [
        'You balance emotional awareness with steady resilience.',
        'You can stay calm while still noticing risks.'
      ],
      growth: [
        'You use grounding routines when stress levels rise.',
        'You name emotions early to keep them manageable.'
      ],
      workStyle: [
        'You can handle pressure while keeping a realistic outlook.',
'You stay at your best with a balanced workload.'
      ],
      relationships: [
        'You are attuned to emotional shifts in others.',
        'You check in regularly to strengthen trust.'
      ]
    },
    Low: {
      strengths: [
        'You remain calm under pressure and recover quickly from setbacks.',
        'Your emotional steadiness helps you stay composed.'
      ],
      growth: [
        'You stay alert to risks so issues don\'t go unnoticed.',
        'You invite feedback if others seem concerned.'
      ],
      workStyle: [
        'You bring calm focus to high-pressure situations.',
        'You can steady teams when tensions rise.'
      ],
      relationships: [
        'Your calm presence can be reassuring to others.',
        'You still name emotions, even when you feel steady.'
      ]
    }
  }
};

export type TraitResource = {
  label: string;
  url: string;
};

export const RESOURCES_BY_TRAIT: Record<TraitName, TraitResource[]> = {
  Openness: [
    { label: 'Openness to experience (overview)', url: 'https://en.wikipedia.org/wiki/Openness_to_experience' },
    { label: 'Openness (APA Dictionary of Psychology)', url: 'https://dictionary.apa.org/openness' }
  ],
  Conscientiousness: [
    { label: 'Conscientiousness (overview)', url: 'https://en.wikipedia.org/wiki/Conscientiousness' },
    { label: 'Conscientiousness (APA Dictionary of Psychology)', url: 'https://dictionary.apa.org/conscientiousness' }
  ],
  Extraversion: [
    { label: 'Extraversion (overview)', url: 'https://en.wikipedia.org/wiki/Extraversion' },
    { label: 'Extraversion (APA Dictionary of Psychology)', url: 'https://dictionary.apa.org/extraversion' }
  ],
  Agreeableness: [
    { label: 'Agreeableness (overview)', url: 'https://en.wikipedia.org/wiki/Agreeableness' },
    { label: 'Agreeableness (APA Dictionary of Psychology)', url: 'https://dictionary.apa.org/agreeableness' }
  ],
  Neuroticism: [
    { label: 'Neuroticism (overview)', url: 'https://en.wikipedia.org/wiki/Neuroticism' },
    { label: 'Neuroticism (APA Dictionary of Psychology)', url: 'https://dictionary.apa.org/neuroticism' }
  ]
};

const getTraitContent = (trait: string, score: number) => {
  const traitName = resolveTraitName(trait);
  const content = traitContent[traitName];
  if (!content) {
    return null;
  }
  const band = getScoreBand(score);
  return { band, ...content[band] };
};

export const getStrengths = (trait: string, score: number): string[] =>
  getTraitContent(trait, score)?.strengths ?? [];

export const getGrowthTips = (trait: string, score: number): string[] =>
  getTraitContent(trait, score)?.growth ?? [];

export const getTraitMeaning = (trait: string, score: number): string => {
  const voice = NARRATIVE_VOICE;
  const band = getScoreBand(score);
  const traitName = resolveTraitName(trait);
  const base = `${voice.possessiveDeterminer} ${traitName} score is ${band.toLowerCase()}.`;

  switch (band) {
    case 'High':
      return `${base} This trait shows up often and likely shapes how ${voice.subjectPronoun} think, feel, and act.`;
    case 'Medium':
      return `${base} ${voice.subjectPronoun} can flex this trait depending on the situation, balancing it with other strengths.`;
    case 'Low':
      return `${base} ${voice.subjectPronoun} rely on this trait less, leaning on other qualities in most situations.`;
    default:
      return base;
  }
};

export const getWorkStyleTips = (trait: string, score: number): string[] =>
  getTraitContent(trait, score)?.workStyle ?? [];

export const getRelationshipTips = (trait: string, score: number): string[] =>
  getTraitContent(trait, score)?.relationships ?? [];

export const getProfileSummary = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): string => {
  const voice = NARRATIVE_VOICE;
  if (!traitRankOrder.length) {
    return `${voice.possessiveName} profile reflects a balanced mix of personality traits.`;
  }

  const highestTrait = traitRankOrder[0];
  const lowestTrait = traitRankOrder[traitRankOrder.length - 1];
  const formatPercent = (trait: string) => {
    const value = traitPercentages[trait];
    return Number.isFinite(value) ? ` (${Math.round(value)}/100)` : '';
  };

  const statements = [`${voice.possessiveName} highest trait is ${highestTrait}${formatPercent(highestTrait)}.`];
  if (lowestTrait && lowestTrait !== highestTrait) {
    statements.push(`${voice.possessiveName} lowest trait is ${lowestTrait}${formatPercent(lowestTrait)}.`);
  }

  return statements.join(' ');
};

export type FacetSummary = {
  facets: { facetName: string; score: number }[];
  callouts: string[];
};

export const getFacetSummary = (
  trait: string,
  facetScores?: Record<string, Record<string, number>>
): FacetSummary | null => {
  if (!facetScores) {
    return null;
  }

  const traitName = resolveTraitName(trait);
  const entry = Object.entries(facetScores).find(
    ([groupName]) => normalizeTrait(groupName) === normalizeTrait(traitName)
  );

  if (!entry) {
    return null;
  }

  const [, scores] = entry;
  const facets = Object.entries(scores)
    .filter(([, value]) => Number.isFinite(value))
    .map(([facetName, score]) => ({ facetName, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score);

  if (!facets.length) {
    return null;
  }

  const callouts: string[] = [];
  const [topFacet] = facets;
  if (topFacet) {
    callouts.push(`Your strongest facet: ${topFacet.facetName} (${topFacet.score}/100).`);
  }
  const lowestFacet = facets[facets.length - 1];
  if (lowestFacet && lowestFacet.facetName !== topFacet.facetName) {
    callouts.push(`Your weakest facet: ${lowestFacet.facetName} (${lowestFacet.score}/100).`);
  }

  return { facets, callouts };
};

export const getFacetInsights = (
  trait: string,
  facetScores?: Record<string, Record<string, number>>
): string[] => getFacetSummary(trait, facetScores)?.callouts ?? [];

export const getWorkStyleInsights = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): string => {
  const voice = NARRATIVE_VOICE;
  if (!traitRankOrder.length) {
    return `${voice.possessiveName} work style reflects a blend of focus, collaboration, and adaptability.`;
  }

  const [primaryTrait, secondaryTrait] = traitRankOrder;
  const primaryScore = traitPercentages[primaryTrait] ?? 0;
  const primaryContent = getTraitContent(primaryTrait, primaryScore);
  const primaryLines = primaryContent?.workStyle ?? [];

  if (secondaryTrait) {
    return `${voice.possessiveName} strongest drivers at work are ${primaryTrait} and ${secondaryTrait}. ${primaryLines.join(' ')}`.trim();
  }

  return `${voice.possessiveName} strongest driver at work is ${primaryTrait}. ${primaryLines.join(' ')}`.trim();
};

export const getRelationshipInsights = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): string => {
  const voice = NARRATIVE_VOICE;
  if (!traitRankOrder.length) {
    return `${voice.possessiveName} relationships benefit from steady communication and mutual understanding.`;
  }

  const lowestTrait = traitRankOrder[traitRankOrder.length - 1];
  const lowestScore = traitPercentages[lowestTrait] ?? 0;
  const lowestContent = getTraitContent(lowestTrait, lowestScore);
  const relationshipLines = lowestContent?.relationships ?? [];

  return `Your relationships may feel smoother when ${voice.subjectPronoun} stay mindful of ${lowestTrait}. ${relationshipLines.join(
    ' '
  )}`.trim();
};

export const getComparisonText = (traitRankOrder: string[]): string => {
  if (!traitRankOrder.length) {
    return '';
  }

  const voice = NARRATIVE_VOICE;
  return `${voice.possessiveName} trait rank order is ${traitRankOrder.join(', ')}.`;
};

export const getPatternSummary = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): string => {
  const voice = NARRATIVE_VOICE;
  if (!traitRankOrder.length) {
    return `${voice.possessiveName} pattern reflects a balanced mix of Big Five traits that shifts with context.`;
  }

  const [primaryTrait, secondaryTrait] = traitRankOrder;
  const primaryScore = traitPercentages[primaryTrait] ?? 0;
  const secondaryScore = traitPercentages[secondaryTrait] ?? 0;
  const primaryStrength = getStrengths(primaryTrait, primaryScore)[0];
  const secondaryStrength = secondaryTrait
    ? getStrengths(secondaryTrait, secondaryScore)[0]
    : undefined;

  if (secondaryTrait) {
    const primaryLine = primaryStrength
      ? `It suggests ${primaryStrength.toLowerCase()}`
      : `It suggests ${voice.subjectPronoun} lean on ${primaryTrait} as a core strength.`;
    const secondaryLine = secondaryStrength
      ? `Meanwhile, ${secondaryTrait} adds another layer: ${secondaryStrength.toLowerCase()}`
      : `Meanwhile, ${secondaryTrait} adds another dimension to ${voice.possessiveDeterminer} style.`;
    return `${voice.possessiveName} top traits are ${primaryTrait} and ${secondaryTrait}. ${primaryLine} ${secondaryLine}`.trim();
  }

  const singleLine = primaryStrength
    ? `It suggests ${primaryStrength.toLowerCase()}`
    : `It suggests ${voice.subjectPronoun} lean on ${primaryTrait} as a core strength.`;
  return `${voice.possessiveName} standout trait is ${primaryTrait}. ${singleLine}`.trim();
};

export const getResourcesMethodologyText = (): string =>
  'Your scores are normalized on a 0–100 scale (not percentiles) based on your responses to the Big Five inventory. This report is for personal insight only and does not diagnose or treat any mental health condition.';

export const getPersonalDevelopmentRoadmap = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): Array<{ recommendationType: string; items: string[] }> => {
  if (!traitRankOrder.length) {
    return [];
  }

  const [topTrait] = traitRankOrder;
  const bottomTrait = traitRankOrder[traitRankOrder.length - 1];
  const topScore = traitPercentages[topTrait] ?? 0;
  const bottomScore = traitPercentages[bottomTrait] ?? 0;

  const strengths = getStrengths(topTrait, topScore);
  const growth = getGrowthTips(bottomTrait, bottomScore);

  const withPrefix = (message: string, fallback: string) =>
    /^(you|your) /i.test(message) ? message : `${fallback}: ${message}`;
  const doMore = strengths[0]
    ? withPrefix(strengths[0], 'You do more of this')
    : `You lean into ${topTrait} by choosing one task this week that highlights what you do best.`;
  const watchOut = growth[0]
    ? withPrefix(growth[0], 'You watch out for this')
    : `You notice when ${bottomTrait} habits create friction, and pause to reset before reacting.`;
  const microHabit = `You spend 7 days dedicating 10 minutes to a ${topTrait}-aligned action each morning, then end the day by naming one ${bottomTrait}-related moment you handled with care.`;

  return [
    {
      recommendationType: `Do more of… ${topTrait}`,
      items: [doMore]
    },
    {
      recommendationType: `Watch out for… ${bottomTrait}`,
      items: [watchOut]
    },
    {
      recommendationType: '1-week micro-habit',
      items: [microHabit]
    }
  ];
};

export const getScoreBandLabel = (score: number) => getScoreBand(score);
