export type QuizState = {
  answers: Record<string, number>;
  currentPage: number;
  itemCount: number;
};

const QUIZ_STATE_KEY = 'bigfive:quiz-state';

const isBrowser = typeof window !== 'undefined';

const REPORT_TTL_SECONDS = 60 * 60 * 24;

const getReportBucket = () => {
  if (typeof process === 'undefined') return 'reports';
  return process.env.SUPABASE_REPORTS_BUCKET ?? 'reports';
};

export const getReportPath = (orderId: string) => `orders/${orderId}.pdf`;

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

export async function getReportSignedUrl(orderId: string): Promise<string | null> {
  const storage = await getReportStorageClient();
  const path = getReportPath(orderId);
  const { data, error } = await storage.createSignedUrl(path, REPORT_TTL_SECONDS);

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
