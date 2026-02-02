type ScoreBand = 'High' | 'Medium' | 'Low';
export type ScoreBandLabel = 'High' | 'Balanced' | 'Low';

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
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const formatFacetLabel = (raw: string): string => {
  const withoutPrefix = raw.replace(/^[OCEAN][1-6]_/, '');
  const withSpaces = withoutPrefix
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const collapsed = withSpaces.replace(/\s+/g, ' ').trim();
  if (!collapsed) {
    return '';
  }
  const lower = collapsed.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
};

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

export const articleFor = (word: string): 'a' | 'an' => {
  // NOTE: This is a simplified check and may not work for all English words (e.g., 'hour', 'user').
  const normalized = word.trim().toLowerCase();
  return /^[aeiou]/.test(normalized) ? 'an' : 'a';
};

const NARRATIVE_VOICE: NarrativeVoice = {
  subject: 'You',
  subjectPronoun: 'you',
  objectPronoun: 'you',
  possessiveDeterminer: 'your',
  possessiveAdjective: 'Your',
  possessiveName: 'Your'
};

export const withPrefix = (message: string, fallback: string) =>
  /^(you|your)\b(?![-.]\w)/i.test(message) ? message : `${fallback}: ${message}`;

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
  const base = `${voice.possessiveAdjective} ${traitName} score is ${band.toLowerCase()}.`;

  switch (band) {
    case 'High':
      return `${base} This trait shows up often and likely shapes how ${voice.subjectPronoun} think, feel, and act.`;
    case 'Medium':
      return `${base} ${voice.subject} can flex this trait depending on the situation, balancing it with other strengths.`;
    case 'Low':
      return `${base} ${voice.subject} rely on this trait less, leaning on other qualities in most situations.`;
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

const LEAST_STRONG_FACET_SCORE_THRESHOLD = 60;

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
    .map(([facetName, score]) => ({ facetName: formatFacetLabel(facetName), score: Math.round(score) }))
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
    const lowestFacetLabel =
      lowestFacet.score >= LEAST_STRONG_FACET_SCORE_THRESHOLD ? 'least strong facet' : 'weakest facet';
    callouts.push(`Your ${lowestFacetLabel}: ${lowestFacet.facetName} (${lowestFacet.score}/100).`);
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

  const doMore = strengths[0]
    ? withPrefix(strengths[0], 'You do more of this')
    : `You lean into ${topTrait} by choosing one task this week that highlights what you do best.`;
  const watchOut = growth[0]
    ? withPrefix(growth[0], 'You watch out for this')
    : `You notice when ${bottomTrait} habits create friction, and pause to reset before reacting.`;
  const microHabit = `You spend 7 days dedicating 10 minutes to ${articleFor(topTrait)} ${topTrait}-aligned action each morning, then end the day by naming one ${bottomTrait}-related moment you handled with care.`;

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

const SCORE_BAND_LABELS: Record<ScoreBand, ScoreBandLabel> = {
  High: 'High',
  Medium: 'Balanced',
  Low: 'Low'
};

export const getScoreBandLabel = (score: number): ScoreBandLabel => SCORE_BAND_LABELS[getScoreBand(score)];

export type FacetSpread = {
  range: number;
  stdev: number;
  label: string;
  description: string;
};

const roundTo = (value: number, digits = 1) => Number(value.toFixed(digits));

const calculateStandardDeviation = (values: number[]) => {
  if (!values.length) {
    return 0;
  }
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const TIGHT_SPREAD_RANGE_MAX = 15;
const TIGHT_SPREAD_STDEV_MAX = 6;
const MODERATE_SPREAD_RANGE_MAX = 30;
const MODERATE_SPREAD_STDEV_MAX = 12;

const getFacetSpreadLabel = (range: number, stdev: number) => {
  if (range <= TIGHT_SPREAD_RANGE_MAX && stdev <= TIGHT_SPREAD_STDEV_MAX) {
    return {
      label: 'Tight spread',
      description: 'Facet scores cluster closely, suggesting a consistent expression of this trait.'
    };
  }
  if (range <= MODERATE_SPREAD_RANGE_MAX && stdev <= MODERATE_SPREAD_STDEV_MAX) {
    return {
      label: 'Moderate spread',
      description: 'Facet scores show some variation, blending consistent and situational expressions.'
    };
  }
  return {
    label: 'Wide spread',
    description: 'Facet scores vary widely, highlighting distinct strengths and growth areas within this trait.'
  };
};

export const getFacetSpread = (
  trait: string,
  facetScores?: Record<string, Record<string, number>>
): FacetSpread | null => {
  const summary = getFacetSummary(trait, facetScores);
  if (!summary || summary.facets.length < 2) {
    return null;
  }
  const scores = summary.facets.map((facet) => facet.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;
  const stdev = calculateStandardDeviation(scores);
  const { label, description } = getFacetSpreadLabel(range, stdev);
  const roundedRange = roundTo(range, 0);
  const roundedStdev = roundTo(stdev, 1);
  const detailedDescription = `${description} (Range ${roundedRange}, stdev ${roundedStdev}).`;

  return {
    range: roundedRange,
    stdev: roundedStdev,
    label: escapeHtml(label),
    description: escapeHtml(detailedDescription)
  };
};

export const getTraitSummary = (
  trait: string,
  score: number,
  facetScores?: Record<string, Record<string, number>>
): string => {
  const traitName = resolveTraitName(trait);
  const bandLabel = getScoreBandLabel(score).toLowerCase();
  const summary = getFacetSummary(trait, facetScores);
  if (summary && summary.facets.length > 0) {
    const { facets } = summary;
    const topFacet = facets[0];

    if (facets.length > 1) {
      const bottomFacet = facets[facets.length - 1];
      const bottomLabel =
        bottomFacet.score >= LEAST_STRONG_FACET_SCORE_THRESHOLD ? 'least strong facet' : 'weakest facet';
      return escapeHtml(
        `${traitName} shows its strongest facet in ${topFacet.facetName}, while your ${bottomLabel} is ${bottomFacet.facetName}. Overall, your ${traitName} is ${bandLabel}.`
      );
    }

    return escapeHtml(
      `${traitName} shows its strongest facet in ${topFacet.facetName}. Overall, your ${traitName} is ${bandLabel}.`
    );
  }
  return escapeHtml(`Overall, your ${traitName} is ${bandLabel}.`);
};

export type TraitGuidance = {
  strengths: string[];
  watchOuts: string[];
  microAction: string;
};

const TRAIT_MICRO_ACTIONS: Record<TraitName, string> = {
  Openness: 'Schedule 10 minutes to explore a new idea, then capture one practical next step.',
  Conscientiousness: 'Pick one priority and set a 15-minute timer to complete a focused first step.',
  Extraversion: 'Reach out to one person for a brief check-in and ask a thoughtful question.',
  Agreeableness: 'Offer one small act of support while stating a clear, respectful boundary.',
  Neuroticism: 'Take a 2-minute reset: breathe slowly and name the feeling before moving forward.'
};

export const getTraitGuidance = (trait: string, score: number): TraitGuidance => {
  const traitName = resolveTraitName(trait);
  const strengths = getStrengths(traitName, score).map(escapeHtml);
  const watchOuts = getGrowthTips(traitName, score).map(escapeHtml);
  const microAction =
    (TRAIT_MICRO_ACTIONS as Record<string, string>)[traitName] ??
    `Choose one small action today that supports your ${traitName} balance.`;

  return {
    strengths,
    watchOuts,
    microAction: escapeHtml(microAction)
  };
};

export type ActionPlanSelection = {
  leanInto: string;
  support: string;
  stressReset: string;
};

export const getActionPlanSelections = (
  traitPercentages: Record<string, number>,
  traitRankOrder: string[]
): ActionPlanSelection => {
  const normalizedRank = traitRankOrder.map(resolveTraitName);
  const leanIntoRaw =
    normalizedRank.find((traitName) => normalizeTrait(traitName) !== 'neuroticism') ??
    normalizedRank[0] ??
    'Neuroticism';

  let supportRaw: string;
  const traitEntries = Object.entries(traitPercentages);
  if (traitEntries.length) {
    const traitsByScore = traitEntries
      .filter(([, value]) => Number.isFinite(value))
      .sort((a, b) => a[1] - b[1]);
    const lowestTraitName = traitsByScore[0]?.[0];
    supportRaw = resolveTraitName(lowestTraitName ?? leanIntoRaw);
  } else {
    supportRaw = normalizedRank[normalizedRank.length - 1] ?? leanIntoRaw;
  }

  return {
    leanInto: escapeHtml(leanIntoRaw),
    support: escapeHtml(supportRaw),
    stressReset: escapeHtml('Neuroticism')
  };
};
