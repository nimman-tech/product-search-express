import { Router } from 'express';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import redirectRoutes from './redirect.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/redirect', redirectRoutes);

export default router;
