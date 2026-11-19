import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { setupEarlyMiddleware, setupErrorHandling } from './src/services/middleware';
import { createHealthRouter } from './src/services/health';
import { createStorageRouter } from './src/services/storage';
import { initManagedClients } from './src/services/managed';
import { startServer } from './src/services/server';

const PORT = Number(process.env.PORT) || 3080;
const BIND_HOST = process.env.STORAGE_BIND_HOST?.trim() || '127.0.0.1';
const app = express();

/**
 * Bootstraps the storage Express server (Postgres + invoke API).
 */
const bootstrap = async (): Promise<void> => {
  await initManagedClients();

  setupEarlyMiddleware(app);

  app.use('/', createHealthRouter());
  app.use('/api/health', createHealthRouter());
  app.use('/api/storage', createStorageRouter());

  setupErrorHandling(app);

  startServer(app, {
    port: PORT,
    host: BIND_HOST,
    environment: process.env.NODE_ENV || 'development',
  });
};

void bootstrap();

export default app;
