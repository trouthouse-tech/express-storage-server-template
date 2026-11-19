import type { Pool } from 'pg';
import * as dispatcherExposedEndpoints from '../../data/dispatcher-exposed-endpoints';

export type StorageOperationHandler = (pool: Pool, args: unknown[]) => Promise<unknown>;

/**
 * One entry per src/data/{table} barrel. Every exported function becomes an invoke operation
 * with the same name. Add each new table's barrel here (storage restarts to pick it up).
 */
const modules: Record<string, unknown>[] = [dispatcherExposedEndpoints];

/**
 * Builds the whitelisted storage operation map (data-layer functions only).
 */
export const buildStorageOperationRegistry = (): Record<string, StorageOperationHandler> => {
  const registry: Record<string, StorageOperationHandler> = {};

  for (const mod of modules) {
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value !== 'function') {
        continue;
      }
      if (registry[name]) {
        throw new Error(`Duplicate storage operation: ${name}`);
      }
      const fn = value as (pool: Pool, ...fnArgs: unknown[]) => Promise<unknown>;
      registry[name] = (pool, args) => fn(pool, ...args);
    }
  }

  return registry;
};
