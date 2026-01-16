const LOCALHOST_ORIGIN = 'http://localhost:3000';

const ensureLeadingSlash = (pathname: string) => (pathname.startsWith('/') ? pathname : `/${pathname}`);

const stripQueryAndHash = (pathname: string) => {
  const [withoutHash] = pathname.split('#');
  const [withoutQuery] = withoutHash.split('?');
  return withoutQuery;
};

export const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    return new URL(envUrl);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL(LOCALHOST_ORIGIN);
};

export const absoluteUrl = (pathname: string) => {
  const base = getSiteUrl();
  const normalizedPath = ensureLeadingSlash(pathname);

  return `${base.origin}${normalizedPath}`;
};

export const canonicalUrl = (pathname: string) => {
  const normalizedPath = ensureLeadingSlash(stripQueryAndHash(pathname || '/'));

  return absoluteUrl(normalizedPath);
};

export const ogUrl = (pathname: string) => canonicalUrl(pathname);
