import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAnonymousUserId, getOrCreateAnonymousUserId } from '../lib/anonymous-user';

const COOKIE_NAME = 'bigfive_anon_user_id';

const clearCookie = () => {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
};

describe('anonymous user id', () => {
  beforeEach(() => {
    clearCookie();
    window.localStorage.clear();
  });

  it('creates and persists a user id', () => {
    const randomSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');

    const value = getOrCreateAnonymousUserId();

    expect(value).toBe('11111111-1111-1111-1111-111111111111');
    expect(document.cookie).toContain(`${COOKIE_NAME}=11111111-1111-1111-1111-111111111111`);
    expect(window.localStorage.getItem('bigfive:anon-user-id')).toBe('11111111-1111-1111-1111-111111111111');

    randomSpy.mockRestore();
  });

  it('reuses an existing cookie value', () => {
    document.cookie = `${COOKIE_NAME}=22222222-2222-2222-2222-222222222222; Path=/`;

    const value = getOrCreateAnonymousUserId();

    expect(value).toBe('22222222-2222-2222-2222-222222222222');
    expect(getAnonymousUserId()).toBe('22222222-2222-2222-2222-222222222222');
    expect(window.localStorage.getItem('bigfive:anon-user-id')).toBe('22222222-2222-2222-2222-222222222222');
  });
});
