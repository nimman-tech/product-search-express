/**
 * CORS (Cross-Origin Resource Sharing) configuration
 */

import { CorsOptions } from 'cors';

/**
 * Parse CORS origins from environment variable
 */
function parseCorsOrigins(): string[] {
  const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:4200';
  return corsOriginsEnv.split(',').map((origin) => origin.trim());
}

/**
 * Get CORS configuration options
 */
export function getCorsConfig(): CorsOptions {
  const allowedOrigins = parseCorsOrigins();

  return {
    origin: (origin, callback): void => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600, // 1 hour
  };
}

/**
 * Get allowed origins for logging/debugging
 */
export function getAllowedOrigins(): string[] {
  return parseCorsOrigins();
}
