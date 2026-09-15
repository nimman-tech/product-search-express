import { Request, Response } from 'express';
import { createHealthRouter, createHealthHandler } from '../health.js';

describe('Health Route Factory', () => {
  it('should create health router with default options', () => {
    const router = createHealthRouter();
    expect(router).toBeDefined();
  });

  it('should respond with configured version and service', () => {
    const handler = createHealthHandler({
      version: '1.2.3',
      service: 'custom-service',
    });

    const mockReq = {} as Request;
    let responseData: unknown;
    const mockRes = {
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
      }),
    } as unknown as Response;

    handler(mockReq, mockRes, () => {});

    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(responseData).toMatchObject({
      status: 'UP',
      version: '1.2.3',
      service: 'custom-service',
    });
    expect((responseData as { timestamp: string }).timestamp).toBeDefined();
  });
});
