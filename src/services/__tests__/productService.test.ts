/**
 * Product Service Unit Tests
 * Testing search validation, query building, and response formatting
 */

import { ProductType, Operation, SortOrder, SearchRequest } from '../../types/index';
import { APIError } from '../../utils/errorHandler';

// Mock the database module
jest.mock('../../config/database.js', () => ({
  executeQuery: jest.fn(),
  executeQueryOne: jest.fn(),
  initializeDatabase: jest.fn(),
}));

// Mock the column mapper
jest.mock('../../mappers/columnMapper.js', () => ({
  ColumnMapperFactory: {
    getMapper: jest.fn(() => ({
      mapColumn: jest.fn((col: string) => col),
      getAllColumns: jest.fn(() => ['id', 'brand', 'model', 'year', 'price']),
      validateColumns: jest.fn((_cols: string[]) => true),
    })),
  },
}));

// Import after mocking
import { scanProduct } from '../productService';
import * as dbModule from '../../config/database';
import { ColumnMapperFactory } from '../../mappers/columnMapper';

const mockExecuteQuery = dbModule.executeQuery as jest.MockedFunction<typeof dbModule.executeQuery>;
const mockExecuteQueryOne = dbModule.executeQueryOne as jest.MockedFunction<
  typeof dbModule.executeQueryOne
>;
const mockGetMapper = ColumnMapperFactory.getMapper as jest.MockedFunction<
  typeof ColumnMapperFactory.getMapper
>;

describe('scanProduct - Request Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Type Validation', () => {
    it('should reject missing product type', async () => {
      const request = {
        columns: ['brand'],
      } as unknown as SearchRequest;

      await expect(scanProduct(request)).rejects.toThrow(APIError);
    });

    it('should reject invalid product type', async () => {
      const request = {
        product: 'invalid' as ProductType,
        columns: ['brand'],
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });

    it('should accept valid product types', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const validTypes = [ProductType.CAR, ProductType.BIKE, ProductType.MOBILE];
      for (const type of validTypes) {
        jest.clearAllMocks();
        mockExecuteQuery.mockResolvedValueOnce([]);
        mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

        const request: SearchRequest = {
          product: type,
          columns: ['brand'],
        };

        await expect(scanProduct(request)).resolves.toBeDefined();
      }
    });
  });

  describe('Columns Validation', () => {
    it('should reject missing columns', async () => {
      const request = {
        product: ProductType.CAR,
      } as unknown as SearchRequest;

      await expect(scanProduct(request)).rejects.toThrow(APIError);
    });

    it('should reject empty columns array', async () => {
      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: [],
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });

    it('should accept single column', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    });

    it('should accept multiple columns', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand', 'model', 'year'],
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    });

    it('should reject invalid columns', async () => {
      // Mock getMapper to return a mapper that validates columns as false
      (mockGetMapper as jest.Mock).mockReturnValueOnce({
        mapColumn: jest.fn((col: string) => col),
        getAllColumns: jest.fn(() => ['id', 'brand', 'model']),
        validateColumns: jest.fn(() => false),
      });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['invalid_col'],
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });

    it('should reject mix of valid and invalid columns', async () => {
      // Mock getMapper to return a mapper that validates columns as false
      (mockGetMapper as jest.Mock).mockReturnValueOnce({
        mapColumn: jest.fn((col: string) => col),
        getAllColumns: jest.fn(() => ['id', 'brand', 'model']),
        validateColumns: jest.fn(() => false),
      });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand', 'invalid'],
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });
  });

  describe('Limit Validation', () => {
    it('should accept default when limit not specified', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    });

    it('should reject limit < 1', async () => {
      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        limit: 0,
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });

    it('should reject limit > 200', async () => {
      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        limit: 201,
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });

    it('should accept limit between 1 and 200', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      for (const limit of [1, 50, 100, 200]) {
        jest.clearAllMocks();
        mockExecuteQuery.mockResolvedValueOnce([]);
        mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

        const request: SearchRequest = {
          product: ProductType.CAR,
          columns: ['brand'],
          limit,
        };

        await expect(scanProduct(request)).resolves.toBeDefined();
      }
    });
  });

  describe('Offset Validation', () => {
    it('should accept offset 0', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        offset: 0,
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    });

    it('should accept positive offsets', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        offset: 100,
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    });

    it('should reject negative offset', async () => {
      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        offset: -1,
      };

      await expect(scanProduct(request)).rejects.toThrow();
    });
  });
});

describe('scanProduct - Response Formatting', () => {
  it('should return response with total and data properties', async () => {
    const response = await scanProduct({
      product: ProductType.CAR,
      columns: ['brand'],
    });

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('data');
    expect(typeof response.total).toBe('number');
    expect(Array.isArray(response.data)).toBe(true);
  });
});

describe('scanProduct - Conditions Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute without conditions', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('FROM cars'), []);
  });

  it('should execute with single condition', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      conditions: [
        {
          f: 'year',
          o: Operation.G,
          v: 2020,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it('should execute with multiple conditions', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      conditions: [
        {
          f: 'year',
          o: Operation.EG,
          v: 2020,
        },
        {
          f: 'price',
          o: Operation.ES,
          v: 30000,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it('should handle IN operation correctly', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      conditions: [
        {
          f: 'brand',
          o: Operation.IN,
          v: ['Toyota', 'Honda', 'BMW'],
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it('should reject IN operation with non-array value', async () => {
    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      conditions: [
        {
          f: 'brand',
          o: Operation.IN,
          v: 'Toyota', // Should be array
        },
      ],
    };

    await expect(scanProduct(request)).rejects.toThrow();
  });

  it('should handle all comparison operations', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const operations = [Operation.E, Operation.G, Operation.EG, Operation.S, Operation.ES];

    for (const op of operations) {
      jest.clearAllMocks();
      mockExecuteQuery.mockResolvedValueOnce([]);
      mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

      const request: SearchRequest = {
        product: ProductType.CAR,
        columns: ['brand'],
        conditions: [
          {
            f: 'year',
            o: op,
            v: 2020,
          },
        ],
      };

      await expect(scanProduct(request)).resolves.toBeDefined();
    }
  });
});

describe('scanProduct - Sorting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute without sort', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it('should execute with single sort', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      sort: [
        {
          sortBy: 'year',
          order: SortOrder.D,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), []);
  });

  it('should execute with multiple sorts', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      sort: [
        {
          sortBy: 'year',
          order: SortOrder.D,
        },
        {
          sortBy: 'price',
          order: SortOrder.A,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), []);
  });

  it('should handle ascending sort', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      sort: [
        {
          sortBy: 'price',
          order: SortOrder.A,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ASC'), []);
  });

  it('should handle descending sort', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand'],
      sort: [
        {
          sortBy: 'price',
          order: SortOrder.D,
        },
      ],
    };

    await scanProduct(request);

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('DESC'), []);
  });
});

describe('scanProduct - Database Error Handling', () => {
  it('should handle errors from invalid requests', async () => {
    const request: Partial<SearchRequest> = {
      product: ProductType.CAR,
      // Missing required 'columns' property
    } as unknown as SearchRequest;

    await expect(scanProduct(request as SearchRequest)).rejects.toThrow();
  });
});

describe('scanProduct - Integration Tests', () => {
  it('should handle complete search request with all options', async () => {
    const request: SearchRequest = {
      product: ProductType.CAR,
      columns: ['brand', 'model', 'year'],
      conditions: [
        {
          f: 'year',
          o: Operation.EG,
          v: 2020,
        },
      ],
      sort: [
        {
          sortBy: 'price',
          order: SortOrder.D,
        },
      ],
      limit: 10,
      offset: 0,
    };

    const response = await scanProduct(request);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('data');
    expect(typeof response.total).toBe('number');
    expect(Array.isArray(response.data)).toBe(true);
  });
});
