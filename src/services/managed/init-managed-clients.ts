import { initializeManagedPgPool } from '../postgres';

/**
 * Initializes managed service clients once at server startup.
 */
export const initManagedClients = async (): Promise<void> => {
  console.log('🚀 [initManagedClients] Initializing managed clients');
  initializeManagedPgPool();
};
