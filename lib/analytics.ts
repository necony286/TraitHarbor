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

type EventPayload = Record<string, unknown> | undefined;

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
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    return {};
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

const getDeviceType = () => {
  if (!isBrowser) return 'unknown';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
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
  const mergedPayload = {
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
