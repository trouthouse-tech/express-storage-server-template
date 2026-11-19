/**
 * Normalizes an Express header value to a single string.
 */
export const readSingleHeader = (value: string | string[] | undefined): string | null => {
  if (value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
