import { describe, expect, it } from 'vitest';
import { timingSafeEquals } from '../lib/signature';

describe('timingSafeEquals', () => {
  it('returns true for matching hex strings', () => {
    expect(timingSafeEquals('deadbeef', 'deadbeef')).toBe(true);
  });

  it('returns false for empty strings', () => {
    expect(timingSafeEquals('', '')).toBe(false);
  });

  it('handles mixed-case hex strings correctly', () => {
    expect(timingSafeEquals('DEADBEEF', 'deadbeef')).toBe(true);
    expect(timingSafeEquals('DeAdBeEf', 'deadbeef')).toBe(true);
  });

  it('returns false for different hex strings of the same length', () => {
    expect(timingSafeEquals('deadbeef', 'deafbeef')).toBe(false);
  });

  it('returns false for different hex strings with different lengths', () => {
    expect(timingSafeEquals('deadbeef', 'deadbeef00')).toBe(false);
    expect(timingSafeEquals('deadbeef', '')).toBe(false);
  });

  it('returns false for odd-length hex strings', () => {
    expect(timingSafeEquals('a', 'a')).toBe(false);
    expect(timingSafeEquals('abc', 'abc')).toBe(false);
    expect(timingSafeEquals('deadbeef', 'deadbeef0')).toBe(false);
  });

  it('returns false for strings with non-hex characters', () => {
    expect(timingSafeEquals('deadbeefgg', 'deadbeefgg')).toBe(false);
    expect(timingSafeEquals('deadbeef', 'deadbefg')).toBe(false);
  });
});
