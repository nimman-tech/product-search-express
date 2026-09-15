import { getAllowedMerchantDomains, DEFAULT_ALLOWED_MERCHANT_DOMAINS } from '../redirect.js';

describe('redirectConfig - getAllowedMerchantDomains', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default fallback list when ALLOWED_MERCHANT_DOMAINS is not set', () => {
    delete process.env.ALLOWED_MERCHANT_DOMAINS;

    const domains = getAllowedMerchantDomains();
    expect(domains).toEqual(DEFAULT_ALLOWED_MERCHANT_DOMAINS);
  });

  it('should return default fallback list when ALLOWED_MERCHANT_DOMAINS is empty or whitespace', () => {
    process.env.ALLOWED_MERCHANT_DOMAINS = '   ';

    const domains = getAllowedMerchantDomains();
    expect(domains).toEqual(DEFAULT_ALLOWED_MERCHANT_DOMAINS);
  });

  it('should parse comma-separated domains, trim whitespace, and normalize lowercase', () => {
    process.env.ALLOWED_MERCHANT_DOMAINS = ' Amazon.IN , Flipkart.COM , myStore.io ';

    const domains = getAllowedMerchantDomains();
    expect(domains).toEqual(['amazon.in', 'flipkart.com', 'mystore.io']);
  });

  it('should filter out empty domain entries resulting from consecutive commas', () => {
    process.env.ALLOWED_MERCHANT_DOMAINS = 'amazon.in,,flipkart.com, ,';

    const domains = getAllowedMerchantDomains();
    expect(domains).toEqual(['amazon.in', 'flipkart.com']);
  });
});
