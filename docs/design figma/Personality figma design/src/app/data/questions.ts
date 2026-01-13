import { Question } from '../types/quiz';

export const questions: Question[] = [
  {
    id: 1,
    text: "How do you prefer to spend your weekend?",
    options: [
      { text: "Out with friends at a lively event", trait: "extraversion", value: 2 },
      { text: "A mix of social activities and alone time", trait: "extraversion", value: 1 },
      { text: "Relaxing at home with a good book or hobby", trait: "introversion", value: 2 },
    ]
  },
  {
    id: 2,
    text: "When facing a problem, you tend to:",
    options: [
      { text: "Trust your gut feeling and instincts", trait: "intuition", value: 2 },
      { text: "Consider both facts and feelings", trait: "balanced", value: 1 },
      { text: "Analyze all the facts and details", trait: "sensing", value: 2 },
    ]
  },
  {
    id: 3,
    text: "In group projects, you usually:",
    options: [
      { text: "Take the lead and organize everyone", trait: "judging", value: 2 },
      { text: "Contribute ideas and help when needed", trait: "balanced", value: 1 },
      { text: "Go with the flow and adapt as things develop", trait: "perceiving", value: 2 },
    ]
  },
  {
    id: 4,
    text: "When making decisions, what matters most?",
    options: [
      { text: "Logical analysis and objective criteria", trait: "thinking", value: 2 },
      { text: "A balance of logic and personal values", trait: "balanced", value: 1 },
      { text: "How it affects people and relationships", trait: "feeling", value: 2 },
    ]
  },
  {
    id: 5,
    text: "Your ideal vacation would be:",
    options: [
      { text: "Spontaneous adventure with no fixed plans", trait: "perceiving", value: 2 },
      { text: "A loose itinerary with room for changes", trait: "balanced", value: 1 },
      { text: "Carefully planned with booked activities", trait: "judging", value: 2 },
    ]
  },
  {
    id: 6,
    text: "How do you recharge after a long day?",
    options: [
      { text: "Calling friends or going out", trait: "extraversion", value: 2 },
      { text: "Some quiet time, then maybe socializing", trait: "balanced", value: 1 },
      { text: "Spending time alone to reflect", trait: "introversion", value: 2 },
    ]
  },
  {
    id: 7,
    text: "When learning something new, you prefer:",
    options: [
      { text: "Understanding the big picture and possibilities", trait: "intuition", value: 2 },
      { text: "A mix of theory and practical application", trait: "balanced", value: 1 },
      { text: "Hands-on practice and concrete examples", trait: "sensing", value: 2 },
    ]
  },
  {
    id: 8,
    text: "Your workspace is typically:",
    options: [
      { text: "Very organized with everything in its place", trait: "judging", value: 2 },
      { text: "Organized enough to find what you need", trait: "balanced", value: 1 },
      { text: "A creative mess that makes sense to you", trait: "perceiving", value: 2 },
    ]
  }
];
