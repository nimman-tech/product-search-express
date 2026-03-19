import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    API Version 1 Health Check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'UP',
    version: '1.0.0',
    service: 'product-search-express-v1',
    timestamp: new Date().toISOString(),
  });
});

export default router;
