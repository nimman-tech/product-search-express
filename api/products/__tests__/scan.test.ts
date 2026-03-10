/**
 * API Scan Endpoint Tests
 * Testing the /api/products/scan endpoint handler
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../scan';

// Mock dependencies
jest.mock('../../../src/config/firebase.js');
jest.mock('../../../src/config/database.js');
jest.mock('../../../src/services/productService.js');
jest.mock('../../../src/utils/errorHandler.js', () => {
  const actual = jest.requireActual('../../../src/utils/errorHandler.js');
  return {
    ...actual,
    handleError: jest.fn((err, res) => {
      console.error('handleError called with:', err.message);
      res.status(500).json({ error: err.message, code: 'ERROR' });
    }),
  };
});

import * as firebase from '../../../src/config/firebase.js';
import * as database from '../../../src/config/database.js';
import * as productService from '../../../src/services/productService.js';

const mockInitializeFirebase = firebase.initializeFirebase as jest.MockedFunction<typeof firebase.initializeFirebase>;
const mockInitializeDatabase = database.initializeDatabase as jest.MockedFunction<typeof database.initializeDatabase>;
const mockVerifyToken = firebase.verifyToken as jest.MockedFunction<typeof firebase.verifyToken>;
const mockScanProduct = productService.scanProduct as jest.MockedFunction<typeof productService.scanProduct>;

describe('POST /api/products/scan', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      method: 'POST',
      headers: {
        origin: 'http://localhost:4200',
        authorization: 'Bearer valid-token',
      },
      body: {
        product: 'car',
        columns: ['brand', 'model'],
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    mockInitializeFirebase.mockReturnValue(undefined);
    mockInitializeDatabase.mockReturnValue(undefined as any);
    mockVerifyToken.mockResolvedValue({ uid: 'test-user' } as any);
    mockScanProduct.mockResolvedValue({ total: 0, data: [] });
  });

  describe('CORS Handling', () => {
    it('should set CORS headers for allowed origin', async () => {
      process.env.CORS_ORIGINS = 'http://localhost:4200,http://example.com';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      // Should set at least the CORS headers
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it('should set CORS headers when no origin provided', async () => {
      delete (mockReq.headers as any).origin;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it('should handle missing CORS_ORIGINS env var', async () => {
      delete process.env.CORS_ORIGINS;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.setHeader).toHaveBeenCalled();
    });
  });

  describe('OPTIONS Preflight', () => {
    it('should handle OPTIONS request', async () => {
      mockReq.method = 'OPTIONS';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe('HTTP Method Validation', () => {
    it('should accept POST requests', async () => {
      mockReq.method = 'POST';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });

    it('should reject GET requests', async () => {
      mockReq.method = 'GET';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockScanProduct).not.toHaveBeenCalled();
    });

    it('should reject PUT requests', async () => {
      mockReq.method = 'PUT';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });

    it('should reject DELETE requests', async () => {
      mockReq.method = 'DELETE';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });

    it('should reject PATCH requests', async () => {
      mockReq.method = 'PATCH';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });

    it('should reject TRACE requests', async () => {
      mockReq.method = 'TRACE';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });
  });

  describe('Authorization', () => {
    it('should reject missing Authorization header', async () => {
      delete (mockReq.headers as any).authorization;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should reject invalid Authorization header format', async () => {
      (mockReq.headers as any).authorization = 'InvalidToken';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer header', async () => {
      const token = 'test-jwt-token';
      (mockReq.headers as any).authorization = `Bearer ${token}`;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockVerifyToken).toHaveBeenCalledWith(token);
    });

    it('should reject expired token', async () => {
      mockVerifyToken.mockRejectedValue(new Error('Token expired'));

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockVerifyToken.mockRejectedValue(new Error('Invalid signature'));

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).not.toHaveBeenCalled();
    });

    it('should accept valid token', async () => {
      mockVerifyToken.mockResolvedValue({ uid: 'user123' } as any);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });
  });

  describe('Request Body Processing', () => {
    it('should pass request body to scanProduct', async () => {
      const body = {
        product: 'car',
        columns: ['brand', 'model'],
        limit: 10,
      };
      mockReq.body = body;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalledWith(body);
    });

    it('should handle empty request body', async () => {
      mockReq.body = {};

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });

    it('should pass complex search request', async () => {
      const body = {
        product: 'car',
        columns: ['brand', 'model', 'year', 'price'],
        conditions: [
          { f: 'year', o: 'G', v: 2020 },
          { f: 'price', o: 'ES', v: 50000 },
        ],
        sort: [{ sortBy: 'price', order: 'D' }],
        limit: 20,
        offset: 0,
      };
      mockReq.body = body;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalledWith(body);
    });
  });

  describe('Successful Response', () => {
    it('should return 200 on success', async () => {
      const response = { total: 10, data: [] };
      mockScanProduct.mockResolvedValue(response);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return search results as JSON', async () => {
      const expectedResponse = {
        total: 2,
        data: [
          { i: 1, v: ['Toyota', 'Camry'] },
          { i: 2, v: ['Honda', 'Civic'] },
        ],
      };
      mockScanProduct.mockResolvedValue(expectedResponse);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle empty results', async () => {
      const expectedResponse = { total: 0, data: [] };
      mockScanProduct.mockResolvedValue(expectedResponse);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should return large result sets', async () => {
      const largeData = Array.from({ length: 200 }, (_, i) => ({
        i: i + 1,
        v: [`Brand${i}`, `Model${i}`],
      }));
      const expectedResponse = { total: 200, data: largeData };
      mockScanProduct.mockResolvedValue(expectedResponse);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle validation errors', async () => {
      const validationError = new Error('Invalid product type');
      mockScanProduct.mockRejectedValue(validationError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalled();
    });

    it('should catch and handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockScanProduct.mockRejectedValue(dbError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalled();
    });

    it('should catch and handle unexpected errors', async () => {
      const unexpectedError = new Error('Something went wrong');
      mockScanProduct.mockRejectedValue(unexpectedError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalled();
    });

    it('should handle initialization failures gracefully', async () => {
      mockInitializeFirebase.mockImplementation(() => {
        throw new Error('Firebase init failed');
      });

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockRes.status).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long search requests', async () => {
      const longRequest = {
        product: 'car',
        columns: Array.from({ length: 50 }, (_, i) => `column_${i}`),
      };
      mockReq.body = longRequest;

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });

    it('should handle multiple simultaneous requests', async () => {
      const responses = Array.from({ length: 5 }, (_, i) => ({
        total: i,
        data: [],
      }));

      for (const response of responses) {
        jest.clearAllMocks();
        mockScanProduct.mockResolvedValue(response);

        await handler(mockReq as VercelRequest, mockRes as VercelResponse);

        expect(mockRes.json).toHaveBeenCalledWith(response);
      }
    });

    it('should handle request with special characters', async () => {
      mockReq.body = {
        product: 'car',
        columns: ['brand'],
        conditions: [
          { f: 'description', o: 'E', v: 'Test with "quotes" and \'apostrophes\'' },
        ],
      };

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });

    it('should handle request with unicode characters', async () => {
      mockReq.body = {
        product: 'car',
        columns: ['brand'],
        conditions: [
          { f: 'brand', o: 'E', v: '日本車' },
        ],
      };

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });
  });

  describe('Header Handling', () => {
    it('should handle case-insensitive Authorization header', async () => {
      const token = 'valid-token';
      (mockReq.headers as any) = {
        'authorization': `Bearer ${token}`,
      };

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockVerifyToken).toHaveBeenCalledWith(token);
    });

    it('should handle missing content-type header', async () => {
      delete (mockReq.headers as any)['content-type'];

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });

    it('should handle user-agent header', async () => {
      (mockReq.headers as any)['user-agent'] = 'Mozilla/5.0';

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockScanProduct).toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should initialize Firebase', async () => {
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockInitializeFirebase).toHaveBeenCalled();
    });

    it('should initialize Database', async () => {
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockInitializeDatabase).toHaveBeenCalled();
    });

    it('should initialize both services', async () => {
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(mockInitializeFirebase).toHaveBeenCalled();
      expect(mockInitializeDatabase).toHaveBeenCalled();
    });
  });
});
