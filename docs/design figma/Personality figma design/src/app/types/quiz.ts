export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    trait: string;
    value: number;
  }[];
}

export interface PersonalityResult {
  type: string;
  title: string;
  description: string;
  traits: string[];
  color: string;
}
