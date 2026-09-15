import { recordRedirectClick } from '../redirectService.js';
import { executeQuery } from '../../config/database.js';

jest.mock('../../config/database.js', () => ({
  executeQuery: jest.fn(),
}));

describe('redirectService - recordRedirectClick', () => {
  const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should insert redirect click into database with all provided fields', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);

    await recordRedirectClick({
      productId: '123',
      productType: 'mobile',
      vendor: 'Amazon',
      targetUrl: 'https://amazon.in/dp/B123',
      monetizedUrl:
        'https://linksredirect.com/?cid=123&url=https%3A%2F%2Famazon.in%2Fdp%2FB123&subid=screener',
      subid: 'screener',
      referrer: 'https://nimman.in/mobiles',
      userAgent: 'Mozilla/5.0 TestBrowser',
      ipAddress: '192.168.1.1',
    });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO redirect_clicks'),
      [
        '123',
        'mobile',
        'Amazon',
        'https://amazon.in/dp/B123',
        'https://linksredirect.com/?cid=123&url=https%3A%2F%2Famazon.in%2Fdp%2FB123&subid=screener',
        'screener',
        'https://nimman.in/mobiles',
        'Mozilla/5.0 TestBrowser',
        '192.168.1.1',
      ]
    );
  });

  it('should handle missing optional fields as null', async () => {
    mockExecuteQuery.mockResolvedValueOnce([]);

    await recordRedirectClick({
      targetUrl: 'https://flipkart.com/item/456',
      monetizedUrl:
        'https://linksredirect.com/?cid=123&url=https%3A%2F%2Fflipkart.com%2Fitem%2F456&subid=screener',
    });

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO redirect_clicks'),
      [
        null,
        null,
        null,
        'https://flipkart.com/item/456',
        'https://linksredirect.com/?cid=123&url=https%3A%2F%2Fflipkart.com%2Fitem%2F456&subid=screener',
        null,
        null,
        null,
        null,
      ]
    );
  });
});
