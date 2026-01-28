export type QuizState = {
  answers: Record<string, number>;
  currentPage: number;
  itemCount: number;
};

const QUIZ_STATE_KEY = 'traitharbor:quiz-state';

const isBrowser = typeof window !== 'undefined';

const REPORT_TTL_SECONDS = 60 * 60 * 24;
export const REPORT_TEMPLATE_VERSION = process.env.REPORT_TEMPLATE_VERSION ?? 'v1';

const getReportBucket = () => {
  if (typeof process === 'undefined') return 'reports';
  return process.env.SUPABASE_REPORTS_BUCKET ?? 'reports';
};

export const getReportPath = (orderId: string) =>
  `orders/${REPORT_TEMPLATE_VERSION}/${orderId}.pdf`;

export const getLegacyReportPath = (orderId: string) => `orders/${orderId}.pdf`;

const getReportStorageClient = async () => {
  const { getSupabaseAdminClient } = await import('./supabase');
  return getSupabaseAdminClient().storage.from(getReportBucket());
};

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

export async function getReportSignedUrl(orderId: string, ttlSeconds = REPORT_TTL_SECONDS): Promise<string | null> {
  const storage = await getReportStorageClient();
  const path = getReportPath(orderId);
  const { data, error } = await storage.createSignedUrl(path, ttlSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getReportSignedUrlForPath(path: string, ttlSeconds = REPORT_TTL_SECONDS): Promise<string | null> {
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
    upsert: true
  });

  if (error) {
    throw error;
  }
}
