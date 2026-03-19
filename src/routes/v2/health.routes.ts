import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/v2/health
 * @desc    API Version 2 Health Check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'UP',
    version: '2.0.0',
    service: 'product-search-express-v2',
    timestamp: new Date().toISOString(),
  });
});

export default router;
