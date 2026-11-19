import type { Pool } from 'pg';

/**
 * Deletes a dispatcher exposed endpoint row by id.
 */
export const deleteDispatcherExposedEndpoint = async (pool: Pool, id: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM dispatcher_exposed_endpoints WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};
