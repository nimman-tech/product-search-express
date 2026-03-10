/**
 * Types Unit Tests
 * Testing enums, maps, and type definitions
 */

import {
  ProductType,
  ProductTypeTableMap,
  Operation,
  OperationMap,
  SortOrder,
  SortOrderMap,
} from '../index';

describe('ProductType Enum', () => {
  it('should have valid product type values', () => {
    expect(ProductType.CAR).toBe('car');
    expect(ProductType.BIKE).toBe('bike');
    expect(ProductType.MOBILE).toBe('mobile');
  });

  it('should have all enum values', () => {
    const types = Object.values(ProductType);
    expect(types).toContain('car');
    expect(types).toContain('bike');
    expect(types).toContain('mobile');
    expect(types.length).toBe(3);
  });
});

describe('ProductTypeTableMap', () => {
  it('should map product types to correct table names', () => {
    expect(ProductTypeTableMap[ProductType.CAR]).toBe('cars');
    expect(ProductTypeTableMap[ProductType.BIKE]).toBe('bikes');
    expect(ProductTypeTableMap[ProductType.MOBILE]).toBe('mobiles');
  });

  it('should have mapping for all product types', () => {
    Object.values(ProductType).forEach((type) => {
      expect(ProductTypeTableMap[type]).toBeDefined();
    });
  });

  it('should not have duplicate table names', () => {
    const tableNames = Object.values(ProductTypeTableMap);
    const uniqueTableNames = new Set(tableNames);
    expect(uniqueTableNames.size).toBe(tableNames.length);
  });
});

describe('Operation Enum', () => {
  it('should have valid operation values', () => {
    expect(Operation.E).toBe('E');
    expect(Operation.EG).toBe('EG');
    expect(Operation.ES).toBe('ES');
    expect(Operation.S).toBe('S');
    expect(Operation.G).toBe('G');
    expect(Operation.IN).toBe('IN');
  });

  it('should have all enum values', () => {
    const operations = Object.values(Operation);
    expect(operations.length).toBe(6);
  });
});

describe('OperationMap', () => {
  it('should map E to equals', () => {
    expect(OperationMap[Operation.E]).toBe('=');
  });

  it('should map EG to greater than or equal', () => {
    expect(OperationMap[Operation.EG]).toBe('>=');
  });

  it('should map ES to less than or equal', () => {
    expect(OperationMap[Operation.ES]).toBe('<=');
  });

  it('should map S to less than', () => {
    expect(OperationMap[Operation.S]).toBe('<');
  });

  it('should map G to greater than', () => {
    expect(OperationMap[Operation.G]).toBe('>');
  });

  it('should map IN to IN', () => {
    expect(OperationMap[Operation.IN]).toBe('IN');
  });

  it('should have mapping for all operations', () => {
    Object.values(Operation).forEach((op) => {
      expect(OperationMap[op]).toBeDefined();
    });
  });

  it('should not have duplicate SQL operators (except IN)', () => {
    const operators = Object.values(OperationMap).filter((op) => op !== 'IN');
    const uniqueOperators = new Set(operators);
    expect(uniqueOperators.size).toBe(operators.length);
  });
});

describe('SortOrder Enum', () => {
  it('should have valid sort order values', () => {
    expect(SortOrder.A).toBe('A');
    expect(SortOrder.D).toBe('D');
  });

  it('should have exactly two enum values', () => {
    const orders = Object.values(SortOrder);
    expect(orders.length).toBe(2);
  });
});

describe('SortOrderMap', () => {
  it('should map A to ASC', () => {
    expect(SortOrderMap[SortOrder.A]).toBe('ASC');
  });

  it('should map D to DESC', () => {
    expect(SortOrderMap[SortOrder.D]).toBe('DESC');
  });

  it('should have mapping for all sort orders', () => {
    Object.values(SortOrder).forEach((order) => {
      expect(SortOrderMap[order]).toBeDefined();
    });
  });

  it('should have correct SQL keywords', () => {
    expect(['ASC', 'DESC']).toContain(SortOrderMap[SortOrder.A]);
    expect(['ASC', 'DESC']).toContain(SortOrderMap[SortOrder.D]);
  });
});

describe('Type Consistency', () => {
  it('should maintain consistent enum key-value pairs', () => {
    // Verify that enum values are distinct
    const productTypes = Object.values(ProductType);
    expect(new Set(productTypes).size).toBe(productTypes.length);
  });

  it('should handle type coercion properly', () => {
    const productType: ProductType = ProductType.CAR;
    expect(ProductTypeTableMap[productType]).toBe('cars');
  });

  it('should work with string literals', () => {
    const carType: ProductType = 'car' as ProductType;
    expect(ProductTypeTableMap[carType]).toBe('cars');
  });

  it('should preserve operation semantics', () => {
    const operators = [
      { op: Operation.E, sql: '=' },
      { op: Operation.G, sql: '>' },
      { op: Operation.EG, sql: '>=' },
      { op: Operation.S, sql: '<' },
      { op: Operation.ES, sql: '<=' },
      { op: Operation.IN, sql: 'IN' },
    ];

    operators.forEach(({ op, sql }) => {
      expect(OperationMap[op]).toBe(sql);
    });
  });
});
