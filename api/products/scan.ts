/**
 * POST /api/products/scan - Product Search Endpoint
 * Vercel Function for searching products with filters, sorting, and pagination
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { SearchRequest } from '../../src/types/index.js';
import { initializeFirebase } from '../../src/config/firebase.js';
import { initializeDatabase } from '../../src/config/database.js';
import { scanProduct } from '../../src/services/productService.js';
import { handleError, createAuthError } from '../../src/utils/errorHandler.js';
import { verifyToken } from '../../src/config/firebase.js';

/**
 * Handler for POST /api/products/scan
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'];
  const origin = req.headers.origin as string;

  if (corsOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  try {
    // Initialize Firebase and Database on first run
    initializeFirebase();
    initializeDatabase();

    // Verify authentication
    const authHeader = req.headers.authorization as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAuthError('Missing or invalid Authorization header. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7);

    try {
      await verifyToken(token);
    } catch (error) {
      throw createAuthError(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Get request body
    const searchRequest: SearchRequest = req.body;

    // Execute search
    const result = await scanProduct(searchRequest);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
}
