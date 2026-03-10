/**
 * Local Development Server
 * Express app for development, uses the same handlers as Vercel Functions
 */

import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import { initializeDatabase } from './config/database.js';
import { getCorsConfig } from './config/cors.js';
import { authMiddleware } from './middleware/auth.js';
import { scanProduct } from './services/productService.js';
import { handleError } from './utils/errorHandler.js';
import { SearchRequest } from './types/index.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors(getCorsConfig()));

// Initialize Firebase and Database on startup
try {
  initializeFirebase();
  initializeDatabase();
  console.log('Firebase and Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize services:', error);
  process.exit(1);
}

/**
 * Health Check Endpoint (Public)
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    others: {
      version: '1.0.0',
      service: 'product-search-express',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Product Search Endpoint (Protected)
 */
app.post('/api/products/scan', authMiddleware, async (req, res) => {
  try {
    const searchRequest: SearchRequest = req.body;
    const result = await scanProduct(searchRequest);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Health check at root (for load balancers)
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    version: '1.0.0',
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    message: `${req.method} ${req.path} is not a valid endpoint`,
  });
});

/**
 * Error Handler (global)
 */
app.use((err: unknown, req: express.Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  handleError(err, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Product Search API running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Search endpoint: POST http://localhost:${PORT}/api/products/scan`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

export default app;
