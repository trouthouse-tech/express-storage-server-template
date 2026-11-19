import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import { processInvokeOperation } from '../process-invoke-operation';

type InvokeBody = {
  operation?: string;
  args?: unknown[];
};

const INVOKE_ROUTE = 'POST /api/storage/v1/invoke';

const summarizeInvokeData = (data: unknown): string => {
  if (Array.isArray(data)) {
    return `arrayLength=${data.length}`;
  }
  if (data !== null && typeof data === 'object') {
    return `objectKeys=${Object.keys(data as object).length}`;
  }
  return `type=${typeof data}`;
};

/**
 * POST /api/storage/v1/invoke — run whitelisted data-layer operation.
 */
export const invokeOperationHandler = async (req: Request, res: Response): Promise<void> => {
  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  const body = req.body as InvokeBody;
  const operation = body.operation?.trim();
  if (!operation) {
    console.log(`📥 ${INVOKE_ROUTE} (missing operation)`);
    console.log(`❌ ${INVOKE_ROUTE} status=400 error=operation is required`);
    res.status(400).json({ success: false, error: 'operation is required' });
    return;
  }

  const args = Array.isArray(body.args) ? body.args : [];
  console.log(`📥 ${INVOKE_ROUTE} operation=${operation} argCount=${args.length}`);

  try {
    const result = await processInvokeOperation({ pool, operation, args });
    if (!result.ok) {
      console.log(
        `❌ ${INVOKE_ROUTE} operation=${operation} status=${result.status} error=${result.error}`,
      );
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }

    console.log(
      `📤 ${INVOKE_ROUTE} operation=${operation} status=200 ${summarizeInvokeData(result.data)}`,
    );
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.log(`❌ ${INVOKE_ROUTE} operation=${operation} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
