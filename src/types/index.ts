/**
 * =============================================================================
 * Product Search API Types
 * TypeScript interfaces derived from Java model classes
 * =============================================================================
 */

/**
 * Product types supported by the API
 * Maps to database table names
 */
export enum ProductType {
  CAR = 'car',
  BIKE = 'bike',
  MOBILE = 'mobile',
}

export const ProductTypeTableMap: Record<ProductType, string> = {
  [ProductType.CAR]: 'cars',
  [ProductType.BIKE]: 'bikes',
  [ProductType.MOBILE]: 'mobiles',
};

/**
 * Filter operations for conditions
 */
export enum Operation {
  E = 'E', // Equals (=)
  EG = 'EG', // Greater than or equal (>=)
  ES = 'ES', // Less than or equal (<=)
  S = 'S', // Less than (<)
  G = 'G', // Greater than (>)
  IN = 'IN', // In list (IN)
}

export const OperationMap: Record<Operation, string> = {
  [Operation.E]: '=',
  [Operation.EG]: '>=',
  [Operation.ES]: '<=',
  [Operation.S]: '<',
  [Operation.G]: '>',
  [Operation.IN]: 'IN',
};

/**
 * Sort order for results
 */
export enum SortOrder {
  A = 'A', // Ascending (ASC)
  D = 'D', // Descending (DESC)
}

export const SortOrderMap: Record<SortOrder, string> = {
  [SortOrder.A]: 'ASC',
  [SortOrder.D]: 'DESC',
};

export type ScalarValue = string | number | boolean | null;
export type FilterValue = string | number | boolean;

/**
 * Filter condition with field, operation, and value
 */
export interface Condition {
  f: string; // Field name
  o: Operation; // Operation (E, EG, ES, S, G, IN)
  v: FilterValue | FilterValue[]; // Value (can be array for IN operation)
}

/**
 * Sort specification
 */
export interface Sort {
  sortBy: string; // Column name to sort by
  order: SortOrder; // Sort order (A for ASC, D for DESC)
}

/**
 * Product search request
 */
export interface SearchRequest {
  product: ProductType; // Product type (car, bike, mobile)
  columns: string[]; // Required: at least 1 column
  conditions?: Condition[]; // Optional filter conditions
  sort?: Sort[]; // Optional sorting
  limit?: number; // Optional limit (default: 20, max: 200)
  offset?: number; // Optional offset (default: 0, min: 0)
}

/**
 * Single product item in search results
 */
export interface ProductItem {
  i: string | number; // Item ID
  v: ScalarValue[]; // Column values in requested order
}

/**
 * Product search response
 */
export interface SearchResponse {
  total: number; // Total count of matching records
  data: ProductItem[]; // Result items
}

/**
 * Health check response
 */
export interface HealthData {
  status: string; // Status string (e.g., "UP")
  others?: Record<string, string>; // Additional metadata
}

/**
 * API Error Response
 */
export interface ErrorResponse {
  error: string; // Error message
  code: string; // Error code
  details?: unknown; // Additional error details
  [key: string]: unknown;
}

/**
 * Firebase token claims
 */
export interface FirebaseTokenClaims {
  uid: string;
  email?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Request context with authenticated user info
 */
export interface RequestContext {
  uid: string; // Firebase user ID
  email?: string;
  roles?: string[];
}
