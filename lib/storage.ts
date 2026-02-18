import type { QuizVariant } from './ipip';

export type QuizState = {
  answers: Record<string, number>;
  currentPage: number;
  itemCount: number;
};

const QUIZ_STATE_KEY_PREFIX = 'traitharbor:quiz-state';

const isBrowser = typeof window !== 'undefined';

const REPORT_TTL_SECONDS = 60 * 60 * 24;
export const REPORT_TEMPLATE_VERSION =
  process.env.REPORT_TEMPLATE_VERSION ?? 'v1';

const getReportBucket = () => {
  if (typeof process === 'undefined') return 'reports';
  return process.env.SUPABASE_REPORTS_BUCKET ?? 'reports';
};

const getQuizStateKey = (quizVariant: QuizVariant) =>
  quizVariant === 'ipip120'
    ? QUIZ_STATE_KEY_PREFIX
    : `${QUIZ_STATE_KEY_PREFIX}:${quizVariant}`;

const parseQuizState = (
  raw: string,
  expectedItemCount: number
): QuizState | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    if (
      !parsed ||
      typeof parsed.currentPage !== 'number' ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null
    ) {
      return null;
    }

    const itemCount =
      typeof parsed.itemCount === 'number'
        ? parsed.itemCount
        : expectedItemCount;

    if (itemCount !== expectedItemCount) {
      return null;
    }

    return {
      answers: parsed.answers as Record<string, number>,
      currentPage: parsed.currentPage,
      itemCount,
    };
  } catch (error) {
    console.warn('Unable to read quiz state', error);
    return null;
  }
};

export const getReportPath = (orderId: string) =>
  `orders/${REPORT_TEMPLATE_VERSION}/${orderId}.pdf`;

export const getLegacyReportPath = (orderId: string) => `orders/${orderId}.pdf`;

const getReportStorageClient = async () => {
  const { getSupabaseAdminClient } = await import('./supabase');
  return getSupabaseAdminClient().storage.from(getReportBucket());
};

export function loadQuizState(
  quizVariant: QuizVariant,
  expectedItemCount: number
): QuizState | null {
  if (!isBrowser) return null;

  const variantKey = getQuizStateKey(quizVariant);
  const raw = window.localStorage.getItem(variantKey);
  if (raw) {
    return parseQuizState(raw, expectedItemCount);
  }

  if (quizVariant === 'ipip120') {
    return null;
  }

  const legacyRaw = window.localStorage.getItem(QUIZ_STATE_KEY_PREFIX);
  if (!legacyRaw) {
    return null;
  }

  const parsedLegacyState = parseQuizState(legacyRaw, expectedItemCount);
  if (parsedLegacyState) {
    window.localStorage.setItem(variantKey, JSON.stringify(parsedLegacyState));
  }

  return parsedLegacyState;
}

export function saveQuizState(quizVariant: QuizVariant, state: QuizState) {
  if (!isBrowser) return;
  window.localStorage.setItem(
    getQuizStateKey(quizVariant),
    JSON.stringify(state)
  );
}

export function clearQuizState(quizVariant: QuizVariant) {
  if (!isBrowser) return;
  window.localStorage.removeItem(getQuizStateKey(quizVariant));
}

export async function getReportSignedUrl(
  orderId: string,
  ttlSeconds = REPORT_TTL_SECONDS
): Promise<string | null> {
  const storage = await getReportStorageClient();
  const path = getReportPath(orderId);
  const { data, error } = await storage.createSignedUrl(path, ttlSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getReportSignedUrlForPath(
  path: string,
  ttlSeconds = REPORT_TTL_SECONDS
): Promise<string | null> {
  const storage = await getReportStorageClient();
  const { data, error } = await storage.createSignedUrl(path, ttlSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function uploadReport(orderId: string, pdfBuffer: Uint8Array) {
  const storage = await getReportStorageClient();
  const path = getReportPath(orderId);
  const { error } = await storage.upload(path, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) {
    throw error;
  }
}
