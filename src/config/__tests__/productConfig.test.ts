import { getMinLaunchYear, DEFAULT_MIN_LAUNCH_YEAR } from '../product.js';
import { ProductType } from '../../types/index.js';

describe('productConfig - getMinLaunchYear', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default fallback when no env variables are set', () => {
    delete process.env.MIN_LAUNCH_YEAR;
    delete process.env.MIN_LAUNCH_YEAR_MOBILE;
    delete process.env.MIN_LAUNCH_YEAR_CAR;

    expect(getMinLaunchYear()).toBe(DEFAULT_MIN_LAUNCH_YEAR);
    expect(getMinLaunchYear(ProductType.MOBILE)).toBe(DEFAULT_MIN_LAUNCH_YEAR);
    expect(getMinLaunchYear(ProductType.CAR)).toBe(DEFAULT_MIN_LAUNCH_YEAR);
  });

  it('should return global MIN_LAUNCH_YEAR when category env var is not set', () => {
    process.env.MIN_LAUNCH_YEAR = '2018';
    delete process.env.MIN_LAUNCH_YEAR_MOBILE;

    expect(getMinLaunchYear()).toBe(2018);
    expect(getMinLaunchYear(ProductType.MOBILE)).toBe(2018);
  });

  it('should prioritize category-specific env variable over global MIN_LAUNCH_YEAR', () => {
    process.env.MIN_LAUNCH_YEAR = '2018';
    process.env.MIN_LAUNCH_YEAR_MOBILE = '2022';
    process.env.MIN_LAUNCH_YEAR_CAR = '2015';

    expect(getMinLaunchYear(ProductType.MOBILE)).toBe(2022);
    expect(getMinLaunchYear(ProductType.CAR)).toBe(2015);
    expect(getMinLaunchYear(ProductType.BIKE)).toBe(2018);
  });

  it('should handle invalid number env vars gracefully and fallback', () => {
    process.env.MIN_LAUNCH_YEAR_MOBILE = 'invalid';
    process.env.MIN_LAUNCH_YEAR = 'not-a-number';

    expect(getMinLaunchYear(ProductType.MOBILE)).toBe(DEFAULT_MIN_LAUNCH_YEAR);
  });
});
