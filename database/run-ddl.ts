/// <reference types="node" />

import dotenv from 'dotenv';
import { executeQuery } from '../src/config/database.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: ['.env.local', '.env'] });

async function runDdl() {
  const ddlPath = path.resolve(process.cwd(), 'database/product_vendor_listings.ddl');
  const ddl = fs.readFileSync(ddlPath, 'utf-8');
  const statements = ddl.split(';').filter((s) => s.trim().length > 0);
  for (const s of statements) {
    if (s.trim()) {
      console.log('Executing:', s.trim());
      await executeQuery(s.trim());
    }
  }
}

runDdl()
  .then(() => {
    console.log('DDL execution completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error executing DDL:', err);
    process.exit(1);
  });
