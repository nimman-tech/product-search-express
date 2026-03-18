/**
 * Error handling utilities and custom error classes
 */

import { Response } from 'express';
import { VercelResponse } from '@vercel/node';
import { ErrorResponse } from '../types/index.js';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle and respond with errors
 */
export function handleError(err: unknown, res: Response | VercelResponse): void {
  console.error('Error:', err);

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown;

  if (err instanceof APIError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    code = 'INVALID_REQUEST';
    message = 'Invalid request format';
    details = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const errorResponse: ErrorResponse = {
    error: message,
    code,
  };

  if (details) {
    (errorResponse as Record<string, unknown>).details = details;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Validation error helper
 */
export function createValidationError(field: string, reason: string): APIError {
  return new APIError(400, 'VALIDATION_ERROR', `Validation failed for field: ${field}`, {
    field,
    reason,
  });
}

/**
 * Authentication error helper
 */
export function createAuthError(message: string): APIError {
  return new APIError(401, 'UNAUTHORIZED', message);
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string): APIError {
  return new APIError(404, 'NOT_FOUND', `${resource} not found`);
}

/**
 * Database error helper
 */
export function createDatabaseError(message: string, details?: unknown): APIError {
  const errorDetails: Record<string, unknown> = { message };
  if (details) {
    Object.assign(errorDetails, details);
  }
  return new APIError(500, 'DATABASE_ERROR', 'Database operation failed', errorDetails);
}
