import { describe, expect, it } from 'vitest';
import { timingSafeEquals } from '../lib/signature';

describe('timingSafeEquals', () => {
  it('returns true for matching hex strings', () => {
    expect(timingSafeEquals('deadbeef', 'deadbeef')).toBe(true);
  });

  it('returns false for different hex strings of the same length', () => {
    expect(timingSafeEquals('deadbeef', 'deafbeef')).toBe(false);
  });

  it('returns false for different hex strings with different lengths', () => {
    expect(timingSafeEquals('deadbeef', 'deadbeef00')).toBe(false);
  });
});
