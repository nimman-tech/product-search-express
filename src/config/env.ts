import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Loads environment variables from local candidate env files (.env.local, .env.dev, .env)
 * when not running in Vercel (where variables are injected by the platform).
 */
export function loadEnvironment(): void {
  if (process.env.VERCEL) {
    return;
  }

  const envFiles = ['.env.local', '.env.dev', '.env'];
  for (const envFile of envFiles) {
    try {
      const envPath = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
      }
    } catch {
      // Silently ignore missing or unreadable local env files
    }
  }
}
