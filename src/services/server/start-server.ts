import type { Express } from 'express';

type ServerConfig = {
  port: number;
  environment: string;
  host?: string;
};

/**
 * Starts the Express HTTP listener.
 */
export const startServer = (app: Express, config: ServerConfig): void => {
  const { port, environment, host = '0.0.0.0' } = config;

  app.listen(port, host, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚀 Storage Express');
    console.log('='.repeat(50));
    console.log(`Environment: ${environment}`);
    console.log(`Listening: http://${host}:${port}`);
    console.log(`Health: http://${host}:${port}/api/health`);
    console.log(`Storage: http://${host}:${port}/api/storage/health`);
    console.log('='.repeat(50));
    console.log('');
  });
};
