/**
 * Error Handler Unit Tests
 * Testing custom error classes and handler functions
 */

import {
  APIError,
  handleError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createDatabaseError,
} from '../errorHandler';

describe('APIError', () => {
  it('should create error with all properties', () => {
    const error = new APIError(400, 'TEST_ERROR', 'Test message', { field: 'test' });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.details).toEqual({ field: 'test' });
    expect(error.name).toBe('APIError');
  });

  it('should create error without details', () => {
    const error = new APIError(500, 'SERVER_ERROR', 'Server error message');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.message).toBe('Server error message');
    expect(error.details).toBeUndefined();
  });

  it('should capture stack trace', () => {
    const error = new APIError(400, 'TEST', 'Test');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('APIError');
  });
});

describe('createValidationError', () => {
  it('should create validation error', () => {
    const error = createValidationError('email', 'Invalid email format');

    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toContain('email');
    expect(error.details).toEqual({
      field: 'email',
      reason: 'Invalid email format',
    });
  });

  it('should create validation error with special characters', () => {
    const error = createValidationError('field123-test', 'Reason with !@#$');

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect((error.details as Record<string, unknown>).field).toBe('field123-test');
    expect((error.details as Record<string, unknown>).reason).toBe('Reason with !@#$');
  });
});

describe('createAuthError', () => {
  it('should create auth error', () => {
    const error = createAuthError('Invalid credentials');

    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Invalid credentials');
  });

  it('should create auth error with long message', () => {
    const longMsg = 'Token verification failed: ' + 'x'.repeat(100);
    const error = createAuthError(longMsg);

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe(longMsg);
  });
});

describe('createNotFoundError', () => {
  it('should create not found error', () => {
    const error = createNotFoundError('User');

    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toContain('User');
  });

  it('should create not found error for various resources', () => {
    const resources = ['Product', 'Order', 'Account', 'Article'];

    resources.forEach((resource) => {
      const error = createNotFoundError(resource);
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain(resource);
    });
  });
});

describe('createDatabaseError', () => {
  it('should create database error with message only', () => {
    const error = createDatabaseError('Connection timeout');

    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.message).toBe('Database operation failed');
    expect(error.details).toEqual({ message: 'Connection timeout' });
  });

  it('should create database error with additional details', () => {
    const error = createDatabaseError('Query failed', { query: 'SELECT *', errno: 1234 });

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.details).toEqual({
      message: 'Query failed',
      query: 'SELECT *',
      errno: 1234,
    });
  });

  it('should create database error with nested details', () => {
    const details = {
      table: 'users',
      operation: 'INSERT',
      constraint: { key: 'email', value: 'test@example.com' },
    };
    const error = createDatabaseError('Constraint violation', details);

    expect(error.details).toEqual({
      message: 'Constraint violation',
      ...details,
    });
  });
});

describe('handleError - APIError', () => {
  let mockRes: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle APIError correctly', () => {
    const error = new APIError(422, 'INPUT_INVALID', 'Invalid input', { field: 'username' });
    handleError(error, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid input',
      code: 'INPUT_INVALID',
      details: { field: 'username' },
    });
  });

  it('should handle APIError without details', () => {
    const error = new APIError(403, 'FORBIDDEN', 'Access denied');
    handleError(error, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Access denied',
      code: 'FORBIDDEN',
    });
  });
});

describe('handleError - SyntaxError', () => {
  let mockRes: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle SyntaxError as bad request', () => {
    const error = new SyntaxError('Unexpected token }');
    handleError(error, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid request format',
      code: 'INVALID_REQUEST',
      details: 'Unexpected token }',
    });
  });
});

describe('handleError - Generic Error', () => {
  let mockRes: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong');
    handleError(error, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Something went wrong',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});

describe('handleError - Unknown Error', () => {
  let mockRes: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should handle unknown error type', () => {
    const error = 'string error';
    handleError(error, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('should handle null error', () => {
    handleError(null, mockRes as never);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
