import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { scanProduct } from '../services/productService.js';
import { handleError } from '../utils/errorHandler.js';
import { SearchRequest } from '../types/index.js';

const router = Router();

/**
 * @route   POST /products/scan
 * @desc    Scan and search for products
 * @access  Protected
 */
router.post('/scan', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const searchRequest: SearchRequest = req.body;
    const result = await scanProduct(searchRequest);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
