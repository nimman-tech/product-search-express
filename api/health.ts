/**
 * GET /api/health - Health Check Endpoint
 * Public endpoint to verify service is running
 * Vercel Function - no authentication required
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { HealthData } from '../../src/types/index.js';

/**
 * Handler for GET /api/health
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'];
  const origin = req.headers.origin as string;

  if (corsOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  // Return health status
  const healthData: HealthData = {
    status: 'UP',
    others: {
      version: '1.0.0',
      service: 'product-search-express',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(200).json(healthData);
}
