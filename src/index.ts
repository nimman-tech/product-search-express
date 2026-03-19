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
import { handleError } from './utils/errorHandler.js';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

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
  console.info('Firebase and Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize services:', error);
  process.exit(1);
}

import v1Routes from './routes/v1/index.js';

/**
 * Mount API Routes
 */
// Explicit V1 routes
app.use('/api/v1', v1Routes);

// Explicit V2 routes. Its same as v1 for now. But keep the structure for future
// app.use('/api/v2', v2Routes);

// Default unversioned /api/* routes map to the latest (V2)
app.use('/api', v1Routes);

/**
 * Root Health check (for load balancers)
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    version: '1.0.0', // Service version
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
app.use((err: unknown, req: express.Request, res: Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  handleError(err, res);
});

// Start server
app.listen(PORT, () => {
  console.info(`[INFO] Server starting on port ${PORT}`);
  console.info(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.info(`[INFO] Health check available at: http://localhost:${PORT}/api/health`);
  console.info(
    `[INFO] Product scan endpoint available at: POST http://localhost:${PORT}/api/products/scan`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

export default app;
