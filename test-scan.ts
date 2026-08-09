import { scanProduct } from './src/services/productService.js';
import { ProductType } from './src/types/index.js';
import { closeDatabase } from './src/config/database.js';

async function test() {
  const req = {
    product: ProductType.MOBILE,
    columns: ['make', 'model'],
    limit: 1,
  };
  const res = await scanProduct(req as any);
  console.dir(res, { depth: null });
  await closeDatabase();
}

test().catch(console.error);
