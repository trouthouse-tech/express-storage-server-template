import { timingSafeEqual } from 'crypto';

/**
 * Constant-time comparison for shared secrets.
 */
export const safeEqualSecret = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
};
