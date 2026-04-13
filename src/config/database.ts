/**
 * SQLite / Turso Database Configuration
 * Uses @libsql/client which supports:
 *  - Remote Turso:  libsql://<db>.turso.io  (requires TURSO_AUTH_TOKEN)
 *  - Local HTTP:    http://127.0.0.1:<port>  (local sqld / turso dev server)
 *  - Local file:    file:<path>              (e.g. file:./local.db or file:/abs/path.db)
 */

import { createClient, Client } from '@libsql/client';

let dbClient: Client | null = null;

/**
 * Returns true for URLs that point to a local SQLite instance and therefore
 * do not require an auth token:
 *  - file:  → embedded SQLite file  (file:./db.sqlite, file:/abs/path.db)
 *  - http://127.0.0.1 → local sqld / turso dev server
 */
function isLocalUrl(url: string): boolean {
  return url.startsWith('file:') || /^https?:\/\/127\.0\.0\.1(:\d+)?/.test(url);
}

/**
 * Initialize database connection.
 *
 * Supported URL formats (via TURSO_CONNECTION_URL or SQLITE_DB_PATH):
 *  - libsql://<db>.turso.io   – remote Turso  (TURSO_AUTH_TOKEN required)
 *  - http://127.0.0.1:<port>  – local turso dev server  (no token needed)
 *  - file:<path>              – embedded SQLite file     (no token needed)
 */
export function initializeDatabase(): Client {
  if (dbClient) {
    return dbClient;
  }

  // Use local db if SQLITE_DB_PATH is set, otherwise use remote Turso
  const url = process.env.SQLITE_DB_PATH || process.env.TURSO_CONNECTION_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL or SQLITE_DB_PATH environment variable is not set');
  }

  if (!isLocalUrl(url) && !token) {
    throw new Error(
      'TURSO_AUTH_TOKEN environment variable is required for remote Turso connections'
    );
  }

  try {
    dbClient = createClient({
      url,
      authToken: token ?? undefined,
    });

    const connectionType = isLocalUrl(url) ? 'local SQLite' : 'remote Turso';
    console.info(`Database connection initialized successfully (${connectionType}): ${url}`);
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
