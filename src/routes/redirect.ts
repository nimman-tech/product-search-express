import { Router, Request, Response } from 'express';
import { getAllowedMerchantDomains, DEFAULT_ALLOWED_MERCHANT_DOMAINS } from '../config/redirect.js';
import { recordRedirectClick } from '../services/redirectService.js';
import { logger } from '../utils/logger.js';

const router = Router();

export { DEFAULT_ALLOWED_MERCHANT_DOMAINS };
export const ALLOWED_MERCHANT_DOMAINS = DEFAULT_ALLOWED_MERCHANT_DOMAINS;

/**
 * Checks if the target URL's hostname belongs to an allowed merchant domain.
 */
export function isAllowedDomain(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname.toLowerCase();
    const allowedDomains = getAllowedMerchantDomains();
    return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * GET /api/redirect or /api/v1/redirect
 *
 * Query Params:
 *  - url: Original vendor product URL (required, encoded)
 *  - subid: Tracking SubID (optional, e.g. "modal_click")
 *  - product / product_id: Product identifier (optional)
 *  - product_type / type: Product category (optional, e.g. "mobile", "car")
 *  - vendor: Merchant/Vendor name (optional)
 */
export const handleRedirect = (req: Request, res: Response): void => {
  const targetUrl = req.query.url as string;
  const subId = (req.query.subid as string) || 'screener';

  // 1. Validate URL presence
  if (!targetUrl) {
    res.status(400).json({ error: 'Missing target URL parameter' });
    return;
  }

  // 2. Open Redirect Protection: Whitelist check
  if (!isAllowedDomain(targetUrl)) {
    res.status(403).json({ error: 'Redirect to untrusted domain is not permitted' });
    return;
  }

  // 3. Sanitize SubID (alphanumeric, dashes, underscores only; max 50 chars)
  const sanitizedSubId = subId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);

  const channelId = process.env.CUELINKS_CHANNEL_ID || process.env.CUELINKS_PUB_ID || '';
  const cuelinksBase = process.env.CUELINKS_BASE_URL || 'https://linksredirect.com/';

  // 4. Construct Cuelinks affiliate link
  const cuelinksParams = new URLSearchParams({
    cid: channelId,
    url: targetUrl,
    subid: sanitizedSubId,
  });

  const monetizedUrl = `${cuelinksBase}?${cuelinksParams.toString()}`;

  // 5. Prevent browser/CDN caching of outbound redirects
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  // 6. Execute 302 Temporary Redirect
  res.redirect(302, monetizedUrl);

  // 7. Asynchronously record click to DB (fire-and-forget)
  const productId = (req.query.product_id as string) || (req.query.product as string) || null;
  const productType = (req.query.product_type as string) || (req.query.type as string) || null;
  const vendor = (req.query.vendor as string) || null;
  const referrer =
    (req.headers?.['referer'] as string) || (req.headers?.['referrer'] as string) || null;
  const userAgent = (req.headers?.['user-agent'] as string) || null;
  const ipAddress = (req.headers?.['x-forwarded-for'] as string) || req.ip || null;

  recordRedirectClick({
    productId,
    productType,
    vendor,
    targetUrl,
    monetizedUrl,
    subid: sanitizedSubId,
    referrer,
    userAgent,
    ipAddress,
  }).catch((err) => {
    logger.error('Failed to record redirect click in database:', err);
  });
};

router.get(['/', '/redirect'], handleRedirect);

export default router;
