/// <reference types="jest" />

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
      isBooleanColumn: jest.fn(() => false),
      normalizeValue: jest.fn((_col: string, value: unknown) => value),
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

function createDefaultMapper() {
  return {
    mapColumn: jest.fn((col: string) => col),
    isBooleanColumn: jest.fn(() => false),
    normalizeValue: jest.fn((_col: string, value: unknown) => value),
    getAllColumns: jest.fn(() => ['id', 'brand', 'model', 'year', 'price']),
    validateColumns: jest.fn((_cols: string[]) => true),
  };
}

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

      const validTypes = [ProductType.CAR, ProductType.MOBILE];
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
        isBooleanColumn: jest.fn(() => false),
        normalizeValue: jest.fn((_col: string, value: unknown) => value),
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
        isBooleanColumn: jest.fn(() => false),
        normalizeValue: jest.fn((_col: string, value: unknown) => value),
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
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockExecuteQueryOne.mockReset();
    mockGetMapper.mockReset();
    mockGetMapper.mockImplementation(() => createDefaultMapper());
  });

  it('should return response with total and data properties', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    const response = await scanProduct({
      product: ProductType.CAR,
      columns: ['brand'],
    });

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('data');
    expect(typeof response.total).toBe('number');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should normalize boolean-like database values before returning data', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([
        {
          id: 1,
          feature_sunroof: 1,
          feature_wireless_charger: 0,
        } as Record<string, unknown>,
      ])
      .mockResolvedValueOnce([]); // purchase URLs query
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    (mockGetMapper as jest.Mock).mockReturnValueOnce({
      mapColumn: jest.fn(
        (col: string) =>
          ({
            'l.a': 'feature_sunroof',
            'l.c': 'feature_wireless_charger',
          })[col] ?? col
      ),
      isBooleanColumn: jest.fn((col: string) => ['l.a', 'l.c'].includes(col)),
      normalizeValue: jest.fn((col: string, value: unknown) => {
        if (['l.a', 'l.c'].includes(col)) {
          return Boolean(value);
        }
        return value;
      }),
      getAllColumns: jest.fn(() => ['l.a', 'l.c']),
      validateColumns: jest.fn(() => true),
    });

    const response = await scanProduct({
      product: ProductType.CAR,
      columns: ['l.a', 'l.c'],
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].v).toEqual([true, false]);
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

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE year > ?'),
      [2020]
    );
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

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), [
      expect.any(Number),
    ]);
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

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), [
      expect.any(Number),
    ]);
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

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('ASC'), [
      expect.any(Number),
    ]);
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

    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('DESC'), [
      expect.any(Number),
    ]);
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

describe('scanProduct - Automatic Launch Year Filter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should automatically append default year > 2020 condition', async () => {
    delete process.env.MIN_LAUNCH_YEAR;
    delete process.env.MIN_LAUNCH_YEAR_CAR;
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    await scanProduct({
      product: ProductType.CAR,
      columns: ['brand'],
    });

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE year > ?'),
      [2020]
    );
  });

  it('should use category-specific MIN_LAUNCH_YEAR_MOBILE when configured', async () => {
    process.env.MIN_LAUNCH_YEAR = '2019';
    process.env.MIN_LAUNCH_YEAR_MOBILE = '2022';
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    await scanProduct({
      product: ProductType.MOBILE,
      columns: ['brand'],
    });

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE year > ?'),
      [2022]
    );
  });
});
describe('scanProduct - Purchase URLs', () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockExecuteQueryOne.mockReset();
    mockGetMapper.mockReset();
    mockGetMapper.mockImplementation(() => createDefaultMapper());
  });

  it('should not query purchase URLs when results are empty', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 0 });

    await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    // Only the SELECT query should have been called, not the URLs query
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('product_vendor_listings'),
      expect.anything()
    );
  });

  it('should query purchase URLs when results are non-empty', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([{ id: 1, brand: 'Toyota' } as Record<string, unknown>])
      .mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('product_vendor_listings'),
      ['car', '1']
    );
  });

  it('should pass the correct product_type in the URL query', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([{ id: 10, brand: 'Honda' } as Record<string, unknown>])
      .mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    await scanProduct({ product: ProductType.BIKE, columns: ['brand'] });

    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('product_vendor_listings'),
      ['bike', '10']
    );
  });

  it('should attach purchase URLs to the matching product item', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([{ id: 42, brand: 'Samsung' } as Record<string, unknown>])
      .mockResolvedValueOnce([
        { product_id: '42', vendor: 'Amazon', url: 'https://amazon.com/p/42' },
      ] as Record<string, unknown>[]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    const response = await scanProduct({ product: ProductType.MOBILE, columns: ['brand'] });

    expect(response.data[0].u).toEqual([{ vendor: 'Amazon', url: 'https://amazon.com/p/42' }]);
  });

  it('should attach multiple vendor URLs to the same product item', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([{ id: 5, brand: 'BMW' } as Record<string, unknown>])
      .mockResolvedValueOnce([
        { product_id: '5', vendor: 'Vendor A', url: 'https://a.com/5' },
        { product_id: '5', vendor: 'Vendor B', url: 'https://b.com/5' },
      ] as Record<string, unknown>[]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    const response = await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    expect(response.data[0].u).toHaveLength(2);
    expect(response.data[0].u).toEqual([
      { vendor: 'Vendor A', url: 'https://a.com/5' },
      { vendor: 'Vendor B', url: 'https://b.com/5' },
    ]);
  });

  it('should not set u property when no purchase URLs exist for a product', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([{ id: 99, brand: 'Ford' } as Record<string, unknown>])
      .mockResolvedValueOnce([]); // no URLs in DB
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 1 });

    const response = await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    expect(response.data[0].u).toBeUndefined();
  });

  it('should attach URLs to correct items in a multi-row result set', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([
        { id: 1, brand: 'Toyota' } as Record<string, unknown>,
        { id: 2, brand: 'Honda' } as Record<string, unknown>,
        { id: 3, brand: 'Suzuki' } as Record<string, unknown>,
      ])
      .mockResolvedValueOnce([
        { product_id: '1', vendor: 'Shop1', url: 'https://shop1.com/1' },
        { product_id: '3', vendor: 'Shop2', url: 'https://shop2.com/3' },
      ] as Record<string, unknown>[]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 3 });

    const response = await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    expect(response.data).toHaveLength(3);
    expect(response.data[0].u).toEqual([{ vendor: 'Shop1', url: 'https://shop1.com/1' }]); // id=1
    expect(response.data[1].u).toBeUndefined(); // id=2
    expect(response.data[2].u).toEqual([{ vendor: 'Shop2', url: 'https://shop2.com/3' }]); // id=3
  });

  it('should include all product IDs as placeholders in the URL query', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([
        { id: 10, brand: 'A' } as Record<string, unknown>,
        { id: 20, brand: 'B' } as Record<string, unknown>,
      ])
      .mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 2 });

    await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    // Second call should pass product_type + both ids
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('product_vendor_listings'),
      ['car', '10', '20']
    );
  });

  it('should include product_id IN clause covering all returned product IDs', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce([
        { id: 7, brand: 'X' } as Record<string, unknown>,
        { id: 8, brand: 'Y' } as Record<string, unknown>,
      ])
      .mockResolvedValueOnce([]);
    mockExecuteQueryOne.mockResolvedValueOnce({ count: 2 });

    await scanProduct({ product: ProductType.CAR, columns: ['brand'] });

    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/product_id IN \(\?,\?\)/),
      expect.anything()
    );
  });
});
