export type QuizState = {
  answers: Record<string, number>;
  currentPage: number;
  itemCount: number;
};

const QUIZ_STATE_KEY = 'bigfive:quiz-state';

const isBrowser = typeof window !== 'undefined';

export function loadQuizState(expectedItemCount: number): QuizState | null {
  if (!isBrowser) return null;

  const raw = window.localStorage.getItem(QUIZ_STATE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as QuizState;
    if (parsed.itemCount !== expectedItemCount) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Unable to read quiz state', error);
    return null;
  }
}

export function saveQuizState(state: QuizState) {
  if (!isBrowser) return;
  window.localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
}

export function clearQuizState() {
  if (!isBrowser) return;
  window.localStorage.removeItem(QUIZ_STATE_KEY);
}
