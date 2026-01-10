const ANONYMOUS_USER_COOKIE = 'traitharbor_anon_user_id';
const ANONYMOUS_USER_STORAGE_KEY = 'traitharbor:anon-user-id';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const isBrowser = typeof window !== 'undefined';

const readCookieValue = () => {
  if (!isBrowser) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ANONYMOUS_USER_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookieValue = (value: string) => {
  if (!isBrowser) return;
  document.cookie = `${ANONYMOUS_USER_COOKIE}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
};

const readLocalStorageValue = () => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(ANONYMOUS_USER_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read anonymous user id from local storage.', error);
    return null;
  }
};

const writeLocalStorageValue = (value: string) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(ANONYMOUS_USER_STORAGE_KEY, value);
  } catch (error) {
    console.warn('Unable to persist anonymous user id to local storage.', error);
  }
};

const generateAnonymousUserId = () => {
  if (!isBrowser) return null;
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return null;
};

export const getAnonymousUserId = (): string | null => {
  if (!isBrowser) return null;
  return readCookieValue() ?? readLocalStorageValue();
};

export const getOrCreateAnonymousUserId = (): string | null => {
  if (!isBrowser) return null;

  const existing = getAnonymousUserId();
  if (existing) {
    writeCookieValue(existing);
    writeLocalStorageValue(existing);
    return existing;
  }

  const generated = generateAnonymousUserId();
  if (!generated) return null;

  writeCookieValue(generated);
  writeLocalStorageValue(generated);
  return generated;
};

export const clearAnonymousUserId = () => {
  if (!isBrowser) return;
  document.cookie = `${ANONYMOUS_USER_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  try {
    window.localStorage.removeItem(ANONYMOUS_USER_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear anonymous user id from local storage.', error);
  }
};
