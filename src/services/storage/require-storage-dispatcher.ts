import type { NextFunction, Request, Response } from 'express';
import { readSingleHeader } from '../../utils/http/read-single-header';
import { safeEqualSecret } from '../../utils/http/safe-equal-secret';

const STORAGE_SECRET_HEADER = 'x-storage-secret';

/**
 * Returns the configured dispatcher secret for storage routes.
 */
export const readStorageDispatcherSecret = (): string =>
  process.env.STORAGE_DISPATCHER_SECRET?.trim() ?? '';

/**
 * True when x-storage-secret matches STORAGE_DISPATCHER_SECRET.
 */
export const storageDispatcherSecretMatches = (req: Request): boolean => {
  const expected = readStorageDispatcherSecret();
  if (!expected) {
    return false;
  }
  const provided = readSingleHeader(req.headers[STORAGE_SECRET_HEADER]);
  if (!provided) {
    return false;
  }
  return safeEqualSecret(provided, expected);
};

/**
 * Express middleware — storage routes except public health.
 */
export const requireStorageDispatcherMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (storageDispatcherSecretMatches(req)) {
    next();
    return;
  }
  if (!readStorageDispatcherSecret()) {
    console.error('❌ [storage] STORAGE_DISPATCHER_SECRET is not set');
    res.status(500).json({ success: false, error: 'Storage auth is not configured' });
    return;
  }
  res.status(401).json({ success: false, error: 'Unauthorized' });
};
