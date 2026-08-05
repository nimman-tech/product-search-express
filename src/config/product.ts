/**
 * Product configuration and launch year threshold settings
 */

import { ProductType } from '../types/index.js';

export const DEFAULT_MIN_LAUNCH_YEAR = 2020;

/**
 * Get minimum launch year for product queries based on fallback hierarchy:
 * 1. Category-specific env variable (e.g. MIN_LAUNCH_YEAR_MOBILE)
 * 2. Global env variable (MIN_LAUNCH_YEAR)
 * 3. Application default constant (2020)
 */
export function getMinLaunchYear(productType?: ProductType): number {
  if (productType) {
    const categoryEnvKey = `MIN_LAUNCH_YEAR_${productType.toUpperCase()}`;
    const categoryYear = process.env[categoryEnvKey];
    if (categoryYear) {
      const parsed = parseInt(categoryYear, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const globalYear = process.env.MIN_LAUNCH_YEAR;
  if (globalYear) {
    const parsed = parseInt(globalYear, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return DEFAULT_MIN_LAUNCH_YEAR;
}
