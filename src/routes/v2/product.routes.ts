import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { scanProduct } from '../../services/productService.js';
import { handleError } from '../../utils/errorHandler.js';
import { SearchRequest } from '../../types/index.js';

const router = Router();

/**
 * @route   POST /api/v2/products/scan
 * @desc    Scan and search for products (V2)
 * @access  Protected
 */
router.post('/scan', authMiddleware, async (req, res) => {
  try {
    const searchRequest: SearchRequest = req.body;
    // Core logic is currently shared with V1, but can diverge here in the future
    const result = await scanProduct(searchRequest);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
