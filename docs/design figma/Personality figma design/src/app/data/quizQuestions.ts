// 120 personality assessment questions organized into categories
// 12 questions per page × 10 pages

export interface QuizQuestion {
  id: number;
  text: string;
  category: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Page 1: Self-Perception (Questions 1-12)
  { id: 1, text: "I see myself as someone who is talkative.", category: "Self-Perception" },
  { id: 2, text: "I tend to find fault with others.", category: "Self-Perception" },
  { id: 3, text: "I do a thorough job on tasks I undertake.", category: "Self-Perception" },
  { id: 4, text: "I am often depressed or sad.", category: "Self-Perception" },
  { id: 5, text: "I am original and come up with new ideas.", category: "Self-Perception" },
  { id: 6, text: "I am reserved and quiet in social situations.", category: "Self-Perception" },
  { id: 7, text: "I am helpful and unselfish with others.", category: "Self-Perception" },
  { id: 8, text: "I can be somewhat careless at times.", category: "Self-Perception" },
  { id: 9, text: "I am relaxed and handle stress well.", category: "Self-Perception" },
  { id: 10, text: "I am curious about many different things.", category: "Self-Perception" },
  { id: 11, text: "I am full of energy and enthusiasm.", category: "Self-Perception" },
  { id: 12, text: "I start quarrels or arguments with others.", category: "Self-Perception" },

  // Page 2: Work Style (Questions 13-24)
  { id: 13, text: "I am a reliable worker who gets things done.", category: "Work Style" },
  { id: 14, text: "I can be tense or anxious under pressure.", category: "Work Style" },
  { id: 15, text: "I am ingenious and a deep thinker.", category: "Work Style" },
  { id: 16, text: "I generate a lot of enthusiasm in team settings.", category: "Work Style" },
  { id: 17, text: "I have a forgiving nature toward mistakes.", category: "Work Style" },
  { id: 18, text: "I tend to be disorganized in my approach.", category: "Work Style" },
  { id: 19, text: "I worry a lot about potential problems.", category: "Work Style" },
  { id: 20, text: "I have an active imagination and creative mind.", category: "Work Style" },
  { id: 21, text: "I tend to be quiet and observe before acting.", category: "Work Style" },
  { id: 22, text: "I am generally trusting of others' intentions.", category: "Work Style" },
  { id: 23, text: "I tend to be lazy or lack motivation.", category: "Work Style" },
  { id: 24, text: "I am emotionally stable and not easily upset.", category: "Work Style" },

  // Page 3: Social Interactions (Questions 25-36)
  { id: 25, text: "I value artistic and aesthetic experiences.", category: "Social Interactions" },
  { id: 26, text: "I am outgoing and sociable with strangers.", category: "Social Interactions" },
  { id: 27, text: "I can be rude or have poor manners.", category: "Social Interactions" },
  { id: 28, text: "I make plans and follow through on them.", category: "Social Interactions" },
  { id: 29, text: "I get nervous easily in social situations.", category: "Social Interactions" },
  { id: 30, text: "I like to reflect and play with ideas.", category: "Social Interactions" },
  { id: 31, text: "I have few artistic interests or hobbies.", category: "Social Interactions" },
  { id: 32, text: "I like to cooperate and work with others.", category: "Social Interactions" },
  { id: 33, text: "I am easily distracted from my goals.", category: "Social Interactions" },
  { id: 34, text: "I am sophisticated in art, music, or literature.", category: "Social Interactions" },
  { id: 35, text: "I prefer to lead rather than follow.", category: "Social Interactions" },
  { id: 36, text: "I am sometimes cold and distant with others.", category: "Social Interactions" },

  // Page 4: Problem Solving (Questions 37-48)
  { id: 37, text: "I persevere until the task is finished.", category: "Problem Solving" },
  { id: 38, text: "I can be moody and have ups and downs.", category: "Problem Solving" },
  { id: 39, text: "I value logic and analytical thinking.", category: "Problem Solving" },
  { id: 40, text: "I don't find pleasure in artistic activities.", category: "Problem Solving" },
  { id: 41, text: "I prefer to take charge of situations.", category: "Problem Solving" },
  { id: 42, text: "I can be impolite or inconsiderate.", category: "Problem Solving" },
  { id: 43, text: "I am efficient and get things done quickly.", category: "Problem Solving" },
  { id: 44, text: "I remain calm in stressful situations.", category: "Problem Solving" },
  { id: 45, text: "I prefer routine over variety and novelty.", category: "Problem Solving" },
  { id: 46, text: "I am assertive and make my voice heard.", category: "Problem Solving" },
  { id: 47, text: "I am respectful and polite to everyone.", category: "Problem Solving" },
  { id: 48, text: "I make detailed plans before starting work.", category: "Problem Solving" },

  // Page 5: Emotional Awareness (Questions 49-60)
  { id: 49, text: "I am prone to feeling anxious or fearful.", category: "Emotional Awareness" },
  { id: 50, text: "I have a wide range of intellectual interests.", category: "Emotional Awareness" },
  { id: 51, text: "I am less active than other people.", category: "Emotional Awareness" },
  { id: 52, text: "I show compassion and empathy to others.", category: "Emotional Awareness" },
  { id: 53, text: "I am systematic and like to keep things tidy.", category: "Emotional Awareness" },
  { id: 54, text: "I feel secure and confident most of the time.", category: "Emotional Awareness" },
  { id: 55, text: "I prefer familiar routines to new experiences.", category: "Emotional Awareness" },
  { id: 56, text: "I am enthusiastic and express positive emotions.", category: "Emotional Awareness" },
  { id: 57, text: "I tend to be critical and find flaws.", category: "Emotional Awareness" },
  { id: 58, text: "I am disciplined and stick to my commitments.", category: "Emotional Awareness" },
  { id: 59, text: "I experience strong mood swings frequently.", category: "Emotional Awareness" },
  { id: 60, text: "I am intellectually curious and love learning.", category: "Emotional Awareness" },

  // Page 6: Leadership (Questions 61-72)
  { id: 61, text: "I prefer to work alone rather than in groups.", category: "Leadership" },
  { id: 62, text: "I am kind and considerate to almost everyone.", category: "Leadership" },
  { id: 63, text: "I can be counted on to complete my work.", category: "Leadership" },
  { id: 64, text: "I rarely feel lonely or isolated.", category: "Leadership" },
  { id: 65, text: "I enjoy tackling complex problems and puzzles.", category: "Leadership" },
  { id: 66, text: "I show a lot of energy in everything I do.", category: "Leadership" },
  { id: 67, text: "I assume the best about people's intentions.", category: "Leadership" },
  { id: 68, text: "I sometimes behave irresponsibly.", category: "Leadership" },
  { id: 69, text: "I handle unexpected challenges with ease.", category: "Leadership" },
  { id: 70, text: "I appreciate beauty in art and nature.", category: "Leadership" },
  { id: 71, text: "I take initiative and lead projects forward.", category: "Leadership" },
  { id: 72, text: "I am skeptical and question others' motives.", category: "Leadership" },

  // Page 7: Decision Making (Questions 73-84)
  { id: 73, text: "I am goal-oriented and achievement-focused.", category: "Decision Making" },
  { id: 74, text: "I struggle to control my worries and fears.", category: "Decision Making" },
  { id: 75, text: "I prefer abstract ideas to concrete facts.", category: "Decision Making" },
  { id: 76, text: "I am not interested in abstract discussions.", category: "Decision Making" },
  { id: 77, text: "I radiate joy and positive energy to others.", category: "Decision Making" },
  { id: 78, text: "I respect others and value their opinions.", category: "Decision Making" },
  { id: 79, text: "I tend to procrastinate on important tasks.", category: "Decision Making" },
  { id: 80, text: "I feel comfortable and at ease with myself.", category: "Decision Making" },
  { id: 81, text: "I am conservative and cautious in my choices.", category: "Decision Making" },
  { id: 82, text: "I seek out social events and gatherings.", category: "Decision Making" },
  { id: 83, text: "I look for the best in people and situations.", category: "Decision Making" },
  { id: 84, text: "I pay attention to details and avoid mistakes.", category: "Decision Making" },

  // Page 8: Adaptability (Questions 85-96)
  { id: 85, text: "I cope well with stress and pressure.", category: "Adaptability" },
  { id: 86, text: "I enjoy philosophical discussions and debates.", category: "Adaptability" },
  { id: 87, text: "I am a quiet person who speaks less than others.", category: "Adaptability" },
  { id: 88, text: "I am warm and friendly toward everyone.", category: "Adaptability" },
  { id: 89, text: "I am thorough and detail-oriented in my work.", category: "Adaptability" },
  { id: 90, text: "I get rattled and flustered under stress.", category: "Adaptability" },
  { id: 91, text: "I am adventurous and seek new experiences.", category: "Adaptability" },
  { id: 92, text: "I am talkative and enjoy conversations.", category: "Adaptability" },
  { id: 93, text: "I can be harsh and blunt in my communication.", category: "Adaptability" },
  { id: 94, text: "I work hard and strive for excellence.", category: "Adaptability" },
  { id: 95, text: "I experience frequent negative emotions.", category: "Adaptability" },
  { id: 96, text: "I think creatively and outside the box.", category: "Adaptability" },

  // Page 9: Communication (Questions 97-108)
  { id: 97, text: "I am shy and feel uncomfortable around strangers.", category: "Communication" },
  { id: 98, text: "I care about others' feelings and wellbeing.", category: "Communication" },
  { id: 99, text: "I keep my workspace and surroundings organized.", category: "Communication" },
  { id: 100, text: "I am confident and self-assured in most situations.", category: "Communication" },
  { id: 101, text: "I have varied interests across many topics.", category: "Communication" },
  { id: 102, text: "I am energetic and approach tasks with vigor.", category: "Communication" },
  { id: 103, text: "I am distrustful and doubt people's sincerity.", category: "Communication" },
  { id: 104, text: "I follow through on promises and commitments.", category: "Communication" },
  { id: 105, text: "I handle criticism and setbacks with resilience.", category: "Communication" },
  { id: 106, text: "I seek out new knowledge and understanding.", category: "Communication" },
  { id: 107, text: "I am passive and avoid taking the lead.", category: "Communication" },
  { id: 108, text: "I show understanding and tolerance to others.", category: "Communication" },

  // Page 10: Values & Goals (Questions 109-120)
  { id: 109, text: "I set high standards and work to meet them.", category: "Values & Goals" },
  { id: 110, text: "I become discouraged easily when facing obstacles.", category: "Values & Goals" },
  { id: 111, text: "I enjoy experimenting with new ideas and methods.", category: "Values & Goals" },
  { id: 112, text: "I prefer solitude to being around many people.", category: "Values & Goals" },
  { id: 113, text: "I am generous and willing to help others succeed.", category: "Values & Goals" },
  { id: 114, text: "I am meticulous and careful in everything I do.", category: "Values & Goals" },
  { id: 115, text: "I maintain emotional balance and composure.", category: "Values & Goals" },
  { id: 116, text: "I think deeply about life's big questions.", category: "Values & Goals" },
  { id: 117, text: "I am dynamic and full of life and energy.", category: "Values & Goals" },
  { id: 118, text: "I believe most people are fundamentally good.", category: "Values & Goals" },
  { id: 119, text: "I am reliable and others can depend on me.", category: "Values & Goals" },
  { id: 120, text: "I maintain a positive outlook even in difficulties.", category: "Values & Goals" }
];

// Helper function to get questions for a specific page
export function getQuestionsForPage(pageNumber: number): QuizQuestion[] {
  const startIndex = (pageNumber - 1) * 12;
  const endIndex = startIndex + 12;
  return QUIZ_QUESTIONS.slice(startIndex, endIndex);
}

// Helper function to get category for a page
export function getCategoryForPage(pageNumber: number): string {
  const questions = getQuestionsForPage(pageNumber);
  return questions[0]?.category || 'Personality Assessment';
}

export const TOTAL_PAGES = 10;
export const QUESTIONS_PER_PAGE = 12;
