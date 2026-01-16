import { cookies } from 'next/headers';
import { GUEST_SESSION_COOKIE_NAME, verifyGuestSessionCookie } from './guest-session';
import { ANONYMOUS_USER_ID_HEADER } from './constants';

type OrderAuthorizationTarget = {
  user_id?: string | null;
  email?: string | null;
};

export const isAuthorizedForOrder = async (request: Request, order: OrderAuthorizationTarget): Promise<boolean> => {
  const headerUserId = request.headers.get(ANONYMOUS_USER_ID_HEADER);
  if (headerUserId && order.user_id && order.user_id === headerUserId) {
    return true;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
  const session = verifyGuestSessionCookie(sessionValue);
  if (!session || !order.email) {
    return false;
  }

  return session.email.toLowerCase() === order.email.toLowerCase();
};
