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

const traitKeyMap: Record<string, string> = {
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
  string,
  Record<ScoreBand, { strengths: string[]; growth: string[]; workStyle: string[]; relationships: string[] }>
> = {
  Openness: {
    High: {
      strengths: [
        'You absorb new ideas quickly and enjoy exploring novel perspectives.',
        'Creativity and curiosity help you spot unconventional solutions.'
      ],
      growth: [
        'Balance experimentation with follow-through to keep momentum.',
        'Anchor big ideas in practical next steps.'
      ],
      workStyle: [
        'You thrive in roles that reward experimentation and imaginative thinking.',
        'You enjoy work that encourages learning and variety.'
      ],
      relationships: [
        'You bring an open-minded, curious energy to conversations.',
        'Sharing new experiences can deepen your connections.'
      ]
    },
    Medium: {
      strengths: [
        'You can blend creativity with practicality when tackling challenges.',
        'You stay open to new ideas while valuing proven approaches.'
      ],
      growth: [
        'Seek out occasional novelty to keep your thinking flexible.',
        'Give yourself permission to experiment in low-risk ways.'
      ],
      workStyle: [
        'You adapt well to a mix of routine and innovation.',
        'You appreciate teams that value both creativity and execution.'
      ],
      relationships: [
        'You balance curiosity with respect for familiar routines.',
        'Staying open to others\' ideas keeps collaboration smooth.'
      ]
    },
    Low: {
      strengths: [
        'You value proven methods and keep your focus on what works.',
        'Practical thinking helps you stay grounded.'
      ],
      growth: [
        'Try small experiments to expand your comfort zone.',
        'Invite fresh perspectives to avoid blind spots.'
      ],
      workStyle: [
        'You excel in environments with clear expectations and structure.',
        'Consistency and reliability are strengths you bring to teams.'
      ],
      relationships: [
        'You offer steadiness and dependability to others.',
        'Occasionally exploring new experiences together can add variety.'
      ]
    }
  },
  Conscientiousness: {
    High: {
      strengths: [
        'You are organized, dependable, and follow through on commitments.',
        'Planning ahead helps you deliver consistent results.'
      ],
      growth: [
        'Allow room for flexibility when plans change.',
        'Avoid overextending by prioritizing what matters most.'
      ],
      workStyle: [
        'You thrive in roles that reward structure, planning, and ownership.',
        'Clear goals and timelines keep you energized.'
      ],
      relationships: [
        'You show care by being reliable and considerate.',
        'Remember to balance responsibility with spontaneous moments.'
      ]
    },
    Medium: {
      strengths: [
        'You balance structure with adaptability in your approach.',
        'You can plan ahead while staying open to change.'
      ],
      growth: [
        'Build simple routines to support your goals.',
        'Clarify priorities to avoid unnecessary stress.'
      ],
      workStyle: [
        'You work well in environments that offer guidance with flexibility.',
        'You appreciate clear expectations without rigid constraints.'
      ],
      relationships: [
        'You contribute steady support without being overly rigid.',
        'Consistent follow-through strengthens trust.'
      ]
    },
    Low: {
      strengths: [
        'You stay flexible and can adapt quickly to new situations.',
        'You keep things light when plans shift unexpectedly.'
      ],
      growth: [
        'Set small, achievable routines to build momentum.',
        'Use reminders or checklists to support follow-through.'
      ],
      workStyle: [
        'You enjoy roles that allow spontaneity and change.',
        'Short sprints and clear checkpoints can keep you on track.'
      ],
      relationships: [
        'Your flexibility can keep relationships easygoing.',
        'Follow-through on shared plans helps others feel supported.'
      ]
    }
  },
  Extraversion: {
    High: {
      strengths: [
        'You bring energy to groups and enjoy engaging with others.',
        'Social confidence helps you build momentum quickly.'
      ],
      growth: [
        'Make space for quiet reflection to recharge fully.',
        'Balance talking with active listening.'
      ],
      workStyle: [
        'You thrive in collaborative, high-interaction environments.',
        'Opportunities to lead or present are energizing.'
      ],
      relationships: [
        'You help others feel welcomed and connected.',
        'Pausing to listen can deepen understanding.'
      ]
    },
    Medium: {
      strengths: [
        'You can engage socially while still valuing downtime.',
        'You adapt to both collaborative and independent work.'
      ],
      growth: [
        'Notice when you need more stimulation versus quiet focus.',
        'Lean into networking when it aligns with your goals.'
      ],
      workStyle: [
        'You work well with a mix of collaboration and solo focus.',
        'Balanced environments help you stay steady.'
      ],
      relationships: [
        'You can connect easily while respecting others\' pace.',
        'Mixing social time with downtime keeps you balanced.'
      ]
    },
    Low: {
      strengths: [
        'You are thoughtful, observant, and comfortable with quiet focus.',
        'You listen deeply and avoid unnecessary distractions.'
      ],
      growth: [
        'Seek supportive social settings to expand your comfort zone.',
        'Practice sharing ideas early rather than waiting too long.'
      ],
      workStyle: [
        'You excel in roles with deep focus and independent work.',
        'Quiet time helps you produce your best work.'
      ],
      relationships: [
        'You offer steady, attentive presence to those close to you.',
        'Letting others in gradually can strengthen bonds.'
      ]
    }
  },
  Agreeableness: {
    High: {
      strengths: [
        'You are supportive, cooperative, and considerate of others.',
        'Empathy helps you build trust quickly.'
      ],
      growth: [
        'Set boundaries so your needs stay visible.',
        'Practice advocating for yourself in tough conversations.'
      ],
      workStyle: [
        'You foster harmony and collaboration on teams.',
        'People feel safe sharing ideas around you.'
      ],
      relationships: [
        'You show care through kindness and understanding.',
        'Clear boundaries help relationships stay balanced.'
      ]
    },
    Medium: {
      strengths: [
        'You balance empathy with honest feedback.',
        'You can collaborate while maintaining your own perspective.'
      ],
      growth: [
        'Lean into curiosity when conflict arises.',
        'Offer appreciation explicitly to reinforce connection.'
      ],
      workStyle: [
        'You can work well in teams while staying objective.',
        'You value both harmony and performance.'
      ],
      relationships: [
        'You bring a blend of warmth and clarity to communication.',
        'Staying open to compromise keeps relationships steady.'
      ]
    },
    Low: {
      strengths: [
        'You are direct, candid, and willing to make tough calls.',
        'You can stay objective in emotionally charged situations.'
      ],
      growth: [
        'Practice acknowledging others\' feelings before debating solutions.',
        'Small gestures of appreciation can go a long way.'
      ],
      workStyle: [
        'You are comfortable with constructive critique and debate.',
        'Clear expectations help you collaborate effectively.'
      ],
      relationships: [
        'Your honesty can help others see issues clearly.',
        'Showing warmth intentionally can deepen trust.'
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
        'Build stress-reduction rituals to protect your energy.',
        'Challenge anxious thoughts with evidence and perspective.'
      ],
      workStyle: [
        'You benefit from clear expectations and regular check-ins.',
        'Structured plans can reduce uncertainty.'
      ],
      relationships: [
        'Honest communication about stress helps others support you.',
        'Self-soothing habits keep emotions from overwhelming connection.'
      ]
    },
    Medium: {
      strengths: [
        'You balance emotional awareness with steady resilience.',
        'You can stay calm while still noticing risks.'
      ],
      growth: [
        'Use grounding routines when stress levels rise.',
        'Name emotions early to keep them manageable.'
      ],
      workStyle: [
        'You can handle pressure while keeping a realistic outlook.',
        'Balanced workloads help you stay at your best.'
      ],
      relationships: [
        'You are attuned to emotional shifts in others.',
        'Checking in regularly can strengthen trust.'
      ]
    },
    Low: {
      strengths: [
        'You remain calm under pressure and recover quickly from setbacks.',
        'Emotional steadiness helps you stay composed.'
      ],
      growth: [
        'Stay alert to risks so issues don\'t go unnoticed.',
        'Invite feedback if others seem concerned.'
      ],
      workStyle: [
        'You bring calm focus to high-pressure situations.',
        'You can steady teams when tensions rise.'
      ],
      relationships: [
        'Your calm presence can be reassuring to others.',
        'Naming emotions still matters, even when you feel steady.'
      ]
    }
  }
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

export const getFacetInsights = (
  trait: string,
  facetScores?: Record<string, Record<string, number>>
): string[] => {
  if (!facetScores) {
    return [];
  }

  const traitName = resolveTraitName(trait);
  const entry = Object.entries(facetScores).find(
    ([groupName]) => normalizeTrait(groupName) === normalizeTrait(traitName)
  );

  if (!entry) {
    return [];
  }

  const [, scores] = entry;
  const facets = Object.entries(scores)
    .filter(([, value]) => Number.isFinite(value))
    .map(([facetName, score]) => ({ facetName, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score);

  if (!facets.length) {
    return [];
  }

  const insights: string[] = [];
  const [topFacet] = facets;
  if (topFacet) {
    insights.push(`Top facet: ${topFacet.facetName} (${topFacet.score}/100).`);
  }
  const lowestFacet = facets[facets.length - 1];
  if (lowestFacet && lowestFacet.facetName !== topFacet.facetName) {
    insights.push(`Growth facet: ${lowestFacet.facetName} (${lowestFacet.score}/100).`);
  }

  return insights;
};

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

  return `Relationships may feel smoother when ${voice.subjectPronoun} stay mindful of ${lowestTrait}. ${relationshipLines.join(
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
  'Scores are normalized on a 0–100 scale (not percentiles) based on your responses to the Big Five inventory. This report is for personal insight only and does not diagnose or treat any mental health condition.';

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
    ? `Do more of this: ${strengths[0]}`
    : `Lean into ${topTrait} by choosing one task this week that highlights what you do best.`;
  const watchOut = growth[0]
    ? `Watch out for this: ${growth[0]}`
    : `Notice when ${bottomTrait} habits create friction, and pause to reset before reacting.`;
  const microHabit = `For 7 days, spend 10 minutes on a ${topTrait}-aligned action each morning, then end the day by naming one ${bottomTrait}-related moment you handled with care.`;

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
