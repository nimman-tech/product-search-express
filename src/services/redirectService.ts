import { executeQuery } from '../config/database.js';
import { RedirectClickData } from '../types/index.js';

/**
 * Persists an outbound redirect click into the database asynchronously.
 */
export async function recordRedirectClick(data: RedirectClickData): Promise<void> {
  const query = `
    INSERT INTO redirect_clicks (
      product_id,
      product_type,
      vendor,
      target_url,
      monetized_url,
      subid,
      referrer,
      user_agent,
      ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params: (string | number | boolean | null)[] = [
    data.productId ?? null,
    data.productType ?? null,
    data.vendor ?? null,
    data.targetUrl,
    data.monetizedUrl,
    data.subid ?? null,
    data.referrer ?? null,
    data.userAgent ?? null,
    data.ipAddress ?? null,
  ];

  await executeQuery(query, params);
}
