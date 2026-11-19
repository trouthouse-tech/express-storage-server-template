import type { Request, Response } from 'express';

/**
 * GET /api/storage/health — public liveness for LAN probes.
 */
export const storageHealthHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: { service: process.env.STORAGE_SERVICE_NAME?.trim() || 'storage', canonical: true },
  });
};
