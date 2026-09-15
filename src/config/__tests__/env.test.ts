import { loadEnvironment } from '../env.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
}));

describe('loadEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('does not load .env files when running on Vercel', () => {
    process.env.VERCEL = '1';
    loadEnvironment();
    expect(dotenv.config).not.toHaveBeenCalled();
  });

  test('loads existing candidate .env files when not on Vercel', () => {
    delete process.env.VERCEL;
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      return filePath.endsWith('.env.local');
    });

    loadEnvironment();

    expect(dotenv.config).toHaveBeenCalledTimes(1);
    expect(dotenv.config).toHaveBeenCalledWith(
      expect.objectContaining({
        path: expect.stringContaining('.env.local'),
      })
    );
  });

  test('gracefully handles missing files without throwing', () => {
    delete process.env.VERCEL;
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    expect(() => loadEnvironment()).not.toThrow();
    expect(dotenv.config).not.toHaveBeenCalled();
  });
});
