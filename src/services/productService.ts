/**
 * Product Search Service
 * Builds dynamic queries for product search with filtering, sorting, and pagination
 */

import {
  SearchRequest,
  SearchResponse,
  ProductItem,
  ProductType,
  ProductTypeTableMap,
  Condition,
  Operation,
  OperationMap,
  SortOrderMap,
} from '../types/index.js';
import { ColumnMapperFactory, ColumnMapper } from '../mappers/columnMapper.js';
import { executeQuery, executeQueryOne } from '../config/database.js';
import { APIError, createValidationError, createDatabaseError } from '../utils/errorHandler.js';
import { getMinLaunchYear } from '../config/product.js';

/**
 * Validate search request
 */
function validateSearchRequest(req: SearchRequest): void {
  // Validate product type
  if (!req.product || !Object.values(ProductType).includes(req.product)) {
    throw createValidationError('product', 'Invalid or missing product type');
  }

  // Validate columns
  if (!req.columns || req.columns.length === 0) {
    throw createValidationError('columns', 'At least one column is required');
  }

  // Validate limit
  if (req.limit !== undefined) {
    if (req.limit < 1 || req.limit > 200) {
      throw createValidationError('limit', 'Limit must be between 1 and 200');
    }
  }

  // Validate offset
  if (req.offset !== undefined && req.offset < 0) {
    throw createValidationError('offset', 'Offset must be >= 0');
  }
}

/**
 * Build WHERE clause from conditions
 */
function buildWhereClause(
  conditions: Condition[] | undefined,
  mapper: ColumnMapper
): { clause: string; params: (string | number | boolean | null)[] } {
  if (!conditions || conditions.length === 0) {
    return { clause: '', params: [] };
  }

  const parts: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  for (const condition of conditions) {
    const dbColumn = mapper.mapColumn(condition.f);
    const operation = OperationMap[condition.o];

    if (condition.o === Operation.IN) {
      // Handle IN operation
      if (!Array.isArray(condition.v)) {
        throw createValidationError(
          'conditions',
          `IN operation requires array value for field '${condition.f}'`
        );
      }

      const placeholders = condition.v.map(() => '?').join(',');
      parts.push(`${dbColumn} IN (${placeholders})`);
      params.push(...(condition.v as (string | number | boolean)[]));
    } else {
      // Handle other operations
      parts.push(`${dbColumn} ${operation} ?`);
      params.push(condition.v as string | number | boolean | null);
    }
  }

  const clause = parts.join(' AND ');
  return { clause, params };
}

/**
 * Build ORDER BY clause from sort specifications
 */
function buildOrderByClause(sortSpecs: unknown[] | undefined, mapper: ColumnMapper): string {
  if (!sortSpecs || sortSpecs.length === 0) {
    return '';
  }

  const parts = sortSpecs
    .map((sort: unknown) => {
      const sortObj = sort as { sortBy: string; order: string };
      const dbColumn = mapper.mapColumn(sortObj.sortBy);
      const order = SortOrderMap[sortObj.order as keyof typeof SortOrderMap];
      return `${dbColumn} ${order}`;
    })
    .filter(Boolean);

  return parts.length > 0 ? `ORDER BY ${parts.join(', ')}` : '';
}

/**
 * Build LIMIT and OFFSET clause
 */
function buildLimitOffsetClause(limit: number = 20, offset: number = 0): string {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Main product search function
 */
export async function scanProduct(request: SearchRequest): Promise<SearchResponse> {
  // Validate request
  validateSearchRequest(request);

  // Get mapper for product type
  const mapper = ColumnMapperFactory.getMapper(request.product);

  // Validate that requested columns exist
  if (!mapper.validateColumns(request.columns)) {
    const invalidCols = request.columns.filter((col) => {
      try {
        mapper.mapColumn(col);
        return false;
      } catch {
        return true;
      }
    });
    throw createValidationError(
      'columns',
      `Invalid columns: ${invalidCols.join(', ')}. Valid columns: ${mapper.getAllColumns().join(', ')}`
    );
  }

  try {
    const tableName = ProductTypeTableMap[request.product];

    // Map columns from API names to DB names
    const dbColumns = request.columns.map((col) => mapper.mapColumn(col));

    // Build conditions including automatic min launch year threshold
    const minLaunchYear = getMinLaunchYear(request.product);
    const effectiveConditions: Condition[] = [
      {
        f: 'year',
        o: Operation.G,
        v: minLaunchYear,
      },
      ...(request.conditions || []),
    ];

    // Build WHERE clause
    const { clause: whereClause, params: whereParams } = buildWhereClause(
      effectiveConditions,
      mapper
    );

    // Build ORDER BY clause
    const orderByClause = buildOrderByClause(request.sort, mapper);

    // Build LIMIT and OFFSET
    const limitOffsetClause = buildLimitOffsetClause(request.limit, request.offset);

    // Build SELECT query with results
    let selectQuery = `SELECT id, ${dbColumns.join(', ')} FROM ${tableName}`;
    if (whereClause) {
      selectQuery += ` WHERE ${whereClause}`;
    }
    if (orderByClause) {
      selectQuery += ` ${orderByClause}`;
    }
    selectQuery += ` ${limitOffsetClause}`;

    // Build COUNT query for total
    let countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
    if (whereClause) {
      countQuery += ` WHERE ${whereClause}`;
    }

    // Execute both queries
    const [resultsRaw, countRaw] = await Promise.all([
      executeQuery<Record<string, unknown>>(selectQuery, whereParams),
      executeQueryOne<{ count: number }>(countQuery, whereParams),
    ]);

    const total = countRaw?.count ?? 0;

    // Convert results to ProductItem format
    const data: ProductItem[] = resultsRaw.map((row) => {
      const values = request.columns.map((col) => {
        const dbCol = mapper.mapColumn(col);
        const val = row[dbCol];
        return mapper.normalizeValue(col, val === undefined ? null : val);
      }) as (string | number | boolean | null)[];

      return {
        i: row.id as string | number,
        v: values,
      };
    });

    return {
      total,
      data,
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw createDatabaseError(
      'Failed to search products',
      error instanceof Error ? error.message : undefined
    );
  }
}
