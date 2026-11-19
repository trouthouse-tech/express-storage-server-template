/**
 * Returns true when a Postgres error indicates a missing relation/table.
 */
export const isMissingTableError = (error: { code?: string; message?: string }): boolean => {
  if (error.code === '42P01') {
    return true;
  }
  const msg = error.message?.toLowerCase() ?? '';
  return msg.includes('does not exist') || msg.includes('relation');
};
