/**
 * Firebase Authentication Middleware
 * Extracts and verifies JWT tokens from Authorization header
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/firebase.js';
import { RequestContext, FirebaseTokenClaims } from '../types/index.js';
import { createAuthError, handleError } from '../utils/errorHandler.js';

/**
 * Extend Express Request to include user context
 */
declare global {
  namespace Express {
    interface Request {
      user?: RequestContext;
    }
  }
}

/**
 * Authentication middleware
 * Verifies Firebase JWT token from Authorization header
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createAuthError('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw createAuthError('Invalid Authorization header format. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token with Firebase
    const decodedToken = (await verifyToken(token)) as FirebaseTokenClaams;

    // Extract user info from token
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      roles: (decodedToken.roles as string[]) || [],
    };

    next();
  } catch (error) {
    handleError(error, res);
  }
}

/**
 * Optional authentication middleware
 * Does not fail if token is missing or invalid, just skips authentication
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decodedToken = (await verifyToken(token)) as FirebaseTokenClaams;

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        roles: (decodedToken.roles as string[]) || [],
      };
    } catch (err) {
      // Token invalid but optional, continue without user
      console.warn('Optional authentication token verification failed:', err);
    }

    next();
  } catch (error) {
    handleError(error, res);
  }
}

/**
 * Require authentication middleware
 * Ensures user is authenticated, throws error if not
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    const error = createAuthError('Authentication required');
    handleError(error, res);
    return;
  }
  next();
}

/**
 * Type definition for decoded Firebase token
 */
interface FirebaseTokenClaams {
  uid: string;
  email?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}
