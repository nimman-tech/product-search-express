import request from 'supertest';

// Mock Firebase config
jest.mock('../../config/firebase.js', () => ({
  initializeFirebase: jest.fn(),
  getFirebaseAuth: jest.fn(),
  verifyToken: jest.fn(async (token: string) => {
    if (token === 'valid-test-token') {
      return {
        uid: 'test-user-id',
        email: 'test@example.com',
        roles: ['user'],
      };
    }
    throw new Error('Decoding Firebase ID token failed');
  }),
}));

// Mock database config
jest.mock('../../config/database.js', () => ({
  initializeDatabase: jest.fn(),
  getDatabaseClient: jest.fn(),
  closeDatabase: jest.fn(),
  executeQuery: jest.fn(async (query: string, _params: unknown[] = []) => {
    // Return empty vendor listings for purchase URLs queries
    if (query.includes('product_vendor_listings')) {
      return [];
    }

    // Default mock data matching standard product query
    return [
      {
        id: 1,
        brand: 'Tesla',
        model: 'Model 3',
        variant: 'Performance',
        year: 2023,
        price: 45000,
        body_type: 'Sedan',
      },
      {
        id: 2,
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        variant: 'Max',
        year: 2023,
        price: 1199,
        series: 'Pro',
      },
    ];
  }),
  executeQueryOne: jest.fn(async () => {
    return { count: 100 };
  }),
}));

import app from '../../index.js';
import * as dbModule from '../../config/database.js';

const mockExecuteQuery = dbModule.executeQuery as jest.MockedFunction<typeof dbModule.executeQuery>;
const mockExecuteQueryOne = dbModule.executeQueryOne as jest.MockedFunction<
  typeof dbModule.executeQueryOne
>;

describe('Screener API Integration Tests (Postman Collection Converted)', () => {
  const validToken = 'valid-test-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Checks', () => {
    it('GET /health - should return 200 with UP status', async () => {
      const response = await request(app)
        .get('/health')
        .set('x-vercel-protection-bypass', 'test-bypass-secret');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
    });

    it('GET /api/v1/health - should return 200 with UP status and version', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('UP');
      expect(response.body.version).toBeDefined();
    });
  });

  describe('Authentication Middleware', () => {
    it('POST /api/products/scan - should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .post('/api/products/scan')
        .send({
          product: 'car',
          columns: ['a', 'b'],
          limit: 10,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
      expect(response.body.error).toContain('Missing Authorization header');
    });

    it('POST /api/products/scan - should return 401 when Authorization header format is invalid', async () => {
      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', 'InvalidFormat')
        .send({
          product: 'car',
          columns: ['a', 'b'],
          limit: 10,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
      expect(response.body.error).toContain('Expected: Bearer <token>');
    });

    it('POST /api/products/scan - should return 401 when token is invalid', async () => {
      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          product: 'car',
          columns: ['a', 'b'],
          limit: 10,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
      expect(response.body.error).toContain('Token verification failed');
    });
  });

  describe('Product Scan Tests', () => {
    it('Scan cars with condition - should return 200 with filtered items and total', async () => {
      const mockCarRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Tesla',
        model: `Model ${i + 1}`,
        variant: 'Long Range',
        year: 2023,
        price: 50000 + i * 1000,
        z: 'val',
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockCarRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 42 });

      const requestBody = {
        product: 'car',
        columns: ['a', 'b', 'c', 'd', 'e', 'f', 'z'],
        limit: 10,
        sort: [
          {
            sortBy: 'model',
            order: 'A',
          },
        ],
        conditions: [
          {
            f: 'make',
            o: 'E',
            v: 'Tesla',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan mobiles with condition - should return 200 with filtered items', async () => {
      const mockMobileRows = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        brand: 'Samsung',
        model: `Galaxy S${i + 20}`,
        price: 6000 + i * 100,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockMobileRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 75 });

      const requestBody = {
        product: 'mobile',
        columns: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        limit: 15,
        sort: [
          {
            sortBy: 'model',
            order: 'A',
          },
        ],
        conditions: [
          {
            f: 'price',
            o: 'G',
            v: 5000,
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan cars with IN condition - should return 200', async () => {
      const mockCarRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Tesla',
        model: `Model X ${i}`,
        body_type: 'SUV',
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockCarRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 35 });

      const requestBody = {
        product: 'car',
        columns: ['a', 'g.a', 'b', 'c', 'd', 'e', 'f', 'z'],
        limit: 10,
        sort: [
          {
            sortBy: 'model',
            order: 'A',
          },
        ],
        conditions: [
          {
            f: 'make',
            o: 'E',
            v: 'Tesla',
          },
          {
            f: 'g.a',
            o: 'IN',
            v: ['SUV', 'MUV'],
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan mobiles with IN condition - should return 200', async () => {
      const mockMobileRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Apple',
        model: `iPhone 15 Pro Max ${i}`,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockMobileRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 50 });

      const requestBody = {
        product: 'mobile',
        columns: ['a', 'b', 'c', 'd', 'e', 'f'],
        limit: 10,
        sort: [
          {
            sortBy: 'model',
            order: 'A',
          },
        ],
        conditions: [
          {
            f: 'make',
            o: 'E',
            v: 'Apple',
          },
          {
            f: 'c',
            o: 'IN',
            v: ['Ultra', 'Max'],
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan cars without condition - should return 200', async () => {
      const mockCarRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Honda',
        model: `Civic ${i}`,
        variant: 'EX',
        year: 2022,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockCarRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 80 });

      const requestBody = {
        product: 'car',
        columns: ['make', 'model', 'variant', 'year'],
        limit: 10,
        sort: [
          {
            sortBy: 'make',
            order: 'A',
          },
          {
            sortBy: 'model',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan mobiles without condition - should return 200', async () => {
      const mockMobileRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Google',
        model: `Pixel ${i + 6}`,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockMobileRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 60 });

      const requestBody = {
        product: 'mobile',
        columns: ['a', 'b'],
        limit: 10,
        sort: [
          {
            sortBy: 'a',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan with unknown column - should return 400 validation error', async () => {
      const requestBody = {
        product: 'mobile',
        columns: ['wrong', 'column', 'names'],
        limit: 10,
        sort: [
          {
            sortBy: 'make',
            order: 'A',
          },
          {
            sortBy: 'model',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed for field: columns');
    });

    it('Scan with too high limit - should return 400 validation error', async () => {
      const requestBody = {
        product: 'car',
        columns: ['a', 'b'],
        limit: 300,
        sort: [
          {
            sortBy: 'make',
            order: 'A',
          },
          {
            sortBy: 'model',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed for field: limit');
    });

    it('Scan with offset - should return 200', async () => {
      const mockCarRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 51,
        brand: 'Ford',
        model: `Mustang ${i}`,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockCarRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 120 });

      const requestBody = {
        product: 'car',
        columns: ['a', 'b'],
        limit: 10,
        offset: 50,
        sort: [
          {
            sortBy: 'make',
            order: 'A',
          },
          {
            sortBy: 'model',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });

    it('Scan with no product - should return 400 validation error', async () => {
      const requestBody = {
        columns: ['a', 'b'],
        limit: 10,
        sort: [
          {
            sortBy: 'make',
            order: 'A',
          },
          {
            sortBy: 'model',
            order: 'D',
          },
        ],
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed for field: product');
    });

    it('Scan with no sort no condition - should return 200', async () => {
      const mockCarRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        brand: 'Toyota',
        model: `Corolla ${i}`,
      }));

      mockExecuteQuery.mockResolvedValueOnce(mockCarRows);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 90 });

      const requestBody = {
        product: 'car',
        columns: ['a', 'b'],
        limit: 10,
      };

      const response = await request(app)
        .post('/api/products/scan')
        .set('Authorization', `Bearer ${validToken}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(requestBody.limit);
      expect(response.body.total).toBeGreaterThan(requestBody.limit);
    });
  });
});
