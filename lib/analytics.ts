export type AnalyticsEventName =
  | 'quiz_view'
  | 'quiz_start'
  | 'quiz_25'
  | 'quiz_50'
  | 'quiz_75'
  | 'quiz_complete'
  | 'paywall_view';

export type QuizEventName = Exclude<AnalyticsEventName, 'paywall_view'>;

type EventPayload = Record<string, unknown> | undefined;

const isBrowser = typeof window !== 'undefined';

export function trackQuizEvent(name: QuizEventName, payload?: EventPayload) {
  return trackEvent(name, payload);
}

export function trackEvent(name: AnalyticsEventName, payload?: EventPayload) {
  if (!isBrowser) return;

  window.dispatchEvent(new CustomEvent('analytics', { detail: { event: name, payload } }));

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, payload ?? {});
  }
}
