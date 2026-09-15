import { Router, Request, Response, RequestHandler } from 'express';

export interface HealthRouterOptions {
  version?: string;
  service?: string;
}

/**
 * Factory to create a Health Check request handler.
 */
export function createHealthHandler(options: HealthRouterOptions = {}): RequestHandler {
  const { version = '1.0.0', service = 'product-search-express' } = options;
  return (_req: Request, res: Response): void => {
    res.json({
      status: 'UP',
      version,
      service,
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * Factory to create a Health Check router with configurable version and service name.
 */
export function createHealthRouter(options: HealthRouterOptions = {}): Router {
  const router = Router();
  router.get('/', createHealthHandler(options));
  return router;
}

export default createHealthRouter;
