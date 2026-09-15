import { Request, Response } from 'express';
import { isAllowedDomain, handleRedirect, ALLOWED_MERCHANT_DOMAINS } from '../redirect.js';

describe('Redirect Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.CUELINKS_CHANNEL_ID = 'TEST_CHANNEL_123';
    process.env.CUELINKS_BASE_URL = 'https://linksredirect.com/';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isAllowedDomain', () => {
    it('should allow valid merchant domains and subdomains', () => {
      expect(isAllowedDomain('https://www.amazon.in/dp/B09G9BL5CP')).toBe(true);
      expect(isAllowedDomain('https://amazon.in/product/123')).toBe(true);
      expect(isAllowedDomain('https://amzn.to/abc1234')).toBe(true);
      expect(isAllowedDomain('https://www.flipkart.com/item/123')).toBe(true);
      expect(isAllowedDomain('https://fkrt.it/xyz')).toBe(true);
      expect(isAllowedDomain('https://www.tatacliq.com/p/123')).toBe(true);
      expect(isAllowedDomain('https://www.myntra.com/shoes/123')).toBe(true);
      expect(isAllowedDomain('https://www.ajio.com/clothing/123')).toBe(true);
      expect(isAllowedDomain('https://www.croma.com/tv/123')).toBe(true);
      expect(isAllowedDomain('https://www.reliancedigital.in/laptop/123')).toBe(true);
      expect(isAllowedDomain('https://www.jiomart.com/grocery/123')).toBe(true);
      expect(isAllowedDomain('https://www.vijaysales.com/ac/123')).toBe(true);
    });

    it('should reject untrusted or malicious domains', () => {
      expect(isAllowedDomain('https://malicious-site.com')).toBe(false);
      expect(isAllowedDomain('https://evilamazon.in')).toBe(false);
      expect(isAllowedDomain('https://amazon.in.attacker.com')).toBe(false);
      expect(isAllowedDomain('https://flipkart.com.fake.org')).toBe(false);
      expect(isAllowedDomain('not-a-valid-url')).toBe(false);
      expect(isAllowedDomain('')).toBe(false);
    });

    it('should verify all entries in ALLOWED_MERCHANT_DOMAINS are recognized', () => {
      for (const domain of ALLOWED_MERCHANT_DOMAINS) {
        expect(isAllowedDomain(`https://${domain}/test`)).toBe(true);
        expect(isAllowedDomain(`https://sub.${domain}/test`)).toBe(true);
      }
    });

    it('should allow custom domains when ALLOWED_MERCHANT_DOMAINS env var is set', () => {
      process.env.ALLOWED_MERCHANT_DOMAINS = 'customshop.com,anotherstore.in';
      expect(isAllowedDomain('https://customshop.com/item/1')).toBe(true);
      expect(isAllowedDomain('https://sub.anotherstore.in/item/2')).toBe(true);
      expect(isAllowedDomain('https://amazon.in/test')).toBe(false);
    });
  });

  describe('handleRedirect', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let setHeaderMock: jest.Mock;
    let redirectMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      setHeaderMock = jest.fn();
      redirectMock = jest.fn();

      mockRes = {
        status: statusMock,
        setHeader: setHeaderMock,
        redirect: redirectMock,
      };
    });

    it('should return 400 if url query param is missing', () => {
      mockReq = {
        query: {},
      };

      handleRedirect(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Missing target URL parameter' });
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('should return 403 if target domain is untrusted', () => {
      mockReq = {
        query: {
          url: 'https://attacker.com/malicious-link',
        },
      };

      handleRedirect(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Redirect to untrusted domain is not permitted',
      });
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('should successfully redirect to Cuelinks monetized URL with cid and default subid', () => {
      mockReq = {
        query: {
          url: 'https://www.amazon.in/dp/B09G9BL5CP',
        },
      };

      handleRedirect(mockReq as Request, mockRes as Response);

      expect(setHeaderMock).toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      );
      expect(setHeaderMock).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        'https://linksredirect.com/?cid=TEST_CHANNEL_123&url=https%3A%2F%2Fwww.amazon.in%2Fdp%2FB09G9BL5CP&subid=screener'
      );
    });

    it('should fallback to CUELINKS_PUB_ID if CUELINKS_CHANNEL_ID is not provided', () => {
      delete process.env.CUELINKS_CHANNEL_ID;
      process.env.CUELINKS_PUB_ID = 'TEST_PUB_FALLBACK';

      mockReq = {
        query: {
          url: 'https://www.amazon.in/dp/B09G9BL5CP',
        },
      };

      handleRedirect(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledWith(
        302,
        'https://linksredirect.com/?cid=TEST_PUB_FALLBACK&url=https%3A%2F%2Fwww.amazon.in%2Fdp%2FB09G9BL5CP&subid=screener'
      );
    });

    it('should sanitize custom subid parameter', () => {
      mockReq = {
        query: {
          url: 'https://www.flipkart.com/item/123',
          subid:
            'test<script>alert(1)</script>_click-123_very_long_string_that_exceeds_fifty_characters_limit',
        },
      };

      handleRedirect(mockReq as Request, mockRes as Response);

      const expectedSubId = 'testscriptalert1script_click-123_very_long_string_'.slice(0, 50);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `https://linksredirect.com/?cid=TEST_CHANNEL_123&url=https%3A%2F%2Fwww.flipkart.com%2Fitem%2F123&subid=${expectedSubId}`
      );
    });
  });
});
