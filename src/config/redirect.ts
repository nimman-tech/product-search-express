/**
 * Redirect & Merchant Whitelist Configuration
 */

/**
 * Hardcoded default fallback list for allowed merchant domains.
 * Used when the ALLOWED_MERCHANT_DOMAINS environment variable is not defined or empty.
 */
export const DEFAULT_ALLOWED_MERCHANT_DOMAINS: readonly string[] = [
  'amazon.in',
  'amzn.to',
  'flipkart.com',
  'fkrt.it',
  'tatacliq.com',
  'myntra.com',
  'ajio.com',
  'croma.com',
  'reliancedigital.in',
  'jiomart.com',
  'vijaysales.com',
] as const;

/**
 * Parses allowed merchant domains from the environment variable (comma-separated),
 * with fallback to DEFAULT_ALLOWED_MERCHANT_DOMAINS.
 */
export function getAllowedMerchantDomains(): string[] {
  const envDomains = process.env.ALLOWED_MERCHANT_DOMAINS;

  if (!envDomains || envDomains.trim() === '') {
    return [...DEFAULT_ALLOWED_MERCHANT_DOMAINS];
  }

  const parsed = envDomains
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...DEFAULT_ALLOWED_MERCHANT_DOMAINS];
}
