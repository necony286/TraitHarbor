export type AnalyticsEventName =
  | 'quiz_view'
  | 'quiz_start'
  | 'quiz_25'
  | 'quiz_50'
  | 'quiz_75'
  | 'quiz_complete'
  | 'paywall_view'
  | 'checkout_open'
  | 'purchase_success';

export type QuizEventName = Exclude<AnalyticsEventName, 'paywall_view' | 'checkout_open' | 'purchase_success'>;

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

type EventPayload = AnalyticsProps | undefined;

const isBrowser = typeof window !== 'undefined';
const UTM_STORAGE_KEY = 'bf_utm_props';

const UTM_PARAM_MAP = new Map<string, string>([
  ['utm_source', 'source'],
  ['utm_medium', 'medium'],
  ['utm_campaign', 'campaign'],
  ['ab_variant', 'ab_variant']
]);

const parseUtmParams = () => {
  if (!isBrowser) return {};
  const params = new URLSearchParams(window.location.search);
  const utmProps: Record<string, string> = {};

  UTM_PARAM_MAP.forEach((propKey, queryKey) => {
    const value = params.get(queryKey);
    if (value) {
      utmProps[propKey] = value;
    }
  });

  return utmProps;
};

const readStoredUtms = () => {
  if (!isBrowser) return {};
  try {
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    }
  } catch {
    // Ignore storage or parsing errors.
  }
  return {};
};

const persistUtms = (utmProps: Record<string, string>) => {
  if (!isBrowser) return;
  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmProps));
  } catch {
    // Ignore storage errors.
  }
};

const readBreakpoint = (name: string, fallback: number) => {
  if (!isBrowser) return fallback;
  const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getDeviceType = () => {
  if (!isBrowser) return 'unknown';
  const mobileMax = readBreakpoint('--breakpoint-mobile', 640);
  const tabletMax = readBreakpoint('--breakpoint-tablet', 900);
  const width = window.innerWidth;
  if (width < mobileMax) return 'mobile';
  if (width < tabletMax) return 'tablet';
  return 'desktop';
};

const getUtmProps = () => {
  const utmProps = parseUtmParams();
  const hasUtms = Object.keys(utmProps).length > 0;
  if (hasUtms) {
    persistUtms(utmProps);
    return utmProps;
  }
  return readStoredUtms();
};

export function trackQuizEvent(name: QuizEventName, payload?: EventPayload) {
  return trackEvent(name, payload);
}

export function trackEvent(name: AnalyticsEventName, payload?: EventPayload) {
  if (!isBrowser) return;

  const utmProps = getUtmProps();
  const device = getDeviceType();
  const mergedPayload: AnalyticsProps = {
    ...utmProps,
    ...(payload ?? {}),
    device: payload?.device ?? device
  };

  window.dispatchEvent(new CustomEvent('analytics', { detail: { event: name, payload: mergedPayload } }));

  if (window.plausible) {
    window.plausible(name, { props: mergedPayload });
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, mergedPayload);
  }
}
