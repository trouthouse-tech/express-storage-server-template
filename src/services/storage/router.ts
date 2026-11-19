import { Router } from 'express';
import { requireStorageDispatcherMiddleware } from './require-storage-dispatcher';
import { exportSeedHandler } from './routes/export-seed-handler';
import { importSeedHandler } from './routes/import-seed-handler';
import { storageHealthHandler } from './routes/health-handler';
import { invokeOperationHandler } from './routes/invoke-operation-handler';
import { storageMetaHandler } from './routes/meta-handler';
import { getDispatcherExposedEndpointsHandler } from './routes/get-dispatcher-exposed-endpoints-handler';
import { postDispatcherExposedEndpointHandler } from './routes/post-dispatcher-exposed-endpoint-handler';
import { patchDispatcherExposedEndpointHandler } from './routes/patch-dispatcher-exposed-endpoint-handler';
import { deleteDispatcherExposedEndpointHandler } from './routes/delete-dispatcher-exposed-endpoint-handler';

/**
 * Creates the storage HTTP router (canonical Postgres data plane).
 */
export const createStorageRouter = (): Router => {
  const router = Router();

  router.get('/health', storageHealthHandler);

  router.use(requireStorageDispatcherMiddleware);

  router.get('/dispatcher-exposed-endpoints', getDispatcherExposedEndpointsHandler);
  router.post('/dispatcher-exposed-endpoints', postDispatcherExposedEndpointHandler);
  router.patch('/dispatcher-exposed-endpoints/:id', patchDispatcherExposedEndpointHandler);
  router.delete('/dispatcher-exposed-endpoints/:id', deleteDispatcherExposedEndpointHandler);
  router.get('/meta', storageMetaHandler);
  router.post('/seed/export', exportSeedHandler);
  router.post('/seed/import', importSeedHandler);
  router.post('/v1/invoke', invokeOperationHandler);

  return router;
};
