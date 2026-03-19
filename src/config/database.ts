/**
 * Turso SQLite Database Configuration
 * Uses @libsql/client for serverless SQLite with connection pooling
 */

import { createClient, Client } from '@libsql/client';

let dbClient: Client | null = null;

/**
 * Initialize database connection
 */
export function initializeDatabase(): Client {
  if (dbClient) {
    return dbClient;
  }

  const tursoUrl = process.env.TURSO_CONNECTION_URL;
  const localDbUrl = process.env.SQLITE_DB_PATH;
  const token = process.env.TURSO_AUTH_TOKEN;
  const url = tursoUrl || localDbUrl;

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL or SQLITE_DB_PATH environment variable is not set');
  }

  if (tursoUrl && !token) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is required for Turso');
  }

  try {
    dbClient = createClient({
      url,
      authToken: token ?? undefined,
    });

    console.info('Database connection initialized successfully');
    return dbClient;
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
}

/**
 * Get database client instance
 */
export function getDatabaseClient(): Client {
  if (!dbClient) {
    return initializeDatabase();
  }
  return dbClient;
}

/**
 * Execute a parameterized query
 */
export async function executeQuery<T = unknown[]>(
  query: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  try {
    const client = getDatabaseClient();
    const result = await client.execute({
      sql: query,
      args: params,
    });

    // Cast result rows to desired type
    return result.rows as T[];
  } catch (error) {
    console.error('Database query failed:', { query, params, error });
    throw error;
  }
}

/**
 * Execute a query that returns a single row
 */
export async function executeQueryOne<T = unknown>(
  query: string,
  params: (string | number | null)[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a query that returns a count
 */
export async function executeQueryCount(
  query: string,
  params: (string | number | null)[] = []
): Promise<number> {
  const result = await executeQueryOne<{ count: number }>(query, params);
  return result?.count ?? 0;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbClient) {
    try {
      await (dbClient as never as { close: () => Promise<void> }).close?.();
      dbClient = null;
      console.info('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}
