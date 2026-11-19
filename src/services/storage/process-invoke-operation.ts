import type { Pool } from 'pg';
import { buildStorageOperationRegistry } from './build-storage-operation-registry';

const registry = buildStorageOperationRegistry();

export type ProcessInvokeOperationInput = {
  pool: Pool;
  operation: string;
  args: unknown[];
};

export type ProcessInvokeOperationResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; status: 400 | 404 };

/**
 * Runs a whitelisted data-layer operation against the canonical Postgres pool.
 */
export const processInvokeOperation = async (
  input: ProcessInvokeOperationInput,
): Promise<ProcessInvokeOperationResult> => {
  const handler = registry[input.operation];
  if (!handler) {
    return { ok: false, error: `Unknown operation: ${input.operation}`, status: 404 };
  }

  try {
    const data = await handler(input.pool, input.args);
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return { ok: false, error: message, status: 400 };
  }
};
