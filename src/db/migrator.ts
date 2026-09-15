import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Client } from '@libsql/client';
import { getDatabaseClient } from '../config/database.js';
import { logger } from '../utils/logger.js';

export interface AppliedMigration {
  id: number;
  name: string;
  checksum: string;
  applied_at: string;
}

export interface MigrationFile {
  name: string;
  filePath: string;
  checksum: string;
  sql: string;
}

export interface MigrationStatus {
  name: string;
  status: 'applied' | 'pending';
  appliedAt?: string;
  checksum?: string;
}

export interface MigratorOptions {
  migrationsDir?: string;
  client?: Client;
  logger?: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string, ...args: unknown[]) => void;
  };
}

const defaultLogger = {
  info: (msg: string): void => logger.info(`[Migrator] ${msg}`),
  warn: (msg: string): void => logger.warn(`[Migrator] ${msg}`),
  error: (msg: string, ...args: unknown[]): void => logger.error(`[Migrator] ${msg}`, ...args),
};

export class Migrator {
  private migrationsDir: string;
  private client: Client;
  private logger: typeof defaultLogger;

  constructor(options: MigratorOptions = {}) {
    this.migrationsDir =
      options.migrationsDir || path.resolve(process.cwd(), 'database/migrations');
    this.client = options.client || getDatabaseClient();
    this.logger = options.logger || defaultLogger;
  }

  /**
   * Calculates SHA-256 checksum for a file's content
   */
  public calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
  }

  /**
   * Splits a multi-statement SQL script into individual executable statements
   */
  public splitSqlStatements(sql: string): string[] {
    // Remove comments
    const cleaned = sql
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
      .replace(/--.*$/gm, ''); // remove single-line comments

    return cleaned
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Ensures the _schema_migrations tracking table exists
   */
  public async ensureMigrationsTable(): Promise<void> {
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Fetches all applied migrations from the database
   */
  public async getAppliedMigrations(): Promise<AppliedMigration[]> {
    await this.ensureMigrationsTable();
    const result = await this.client.execute(
      'SELECT id, name, checksum, applied_at FROM _schema_migrations ORDER BY id ASC'
    );
    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      checksum: String(row.checksum),
      applied_at: String(row.applied_at),
    }));
  }

  /**
   * Reads all .sql migration files in the migrations directory
   */
  public getMigrationFiles(): MigrationFile[] {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
      return [];
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return files.map((fileName) => {
      const filePath = path.join(this.migrationsDir, fileName);
      const sql = fs.readFileSync(filePath, 'utf-8');
      const checksum = this.calculateChecksum(sql);
      return {
        name: fileName,
        filePath,
        checksum,
        sql,
      };
    });
  }

  /**
   * Auto-detects if legacy tables exist when _schema_migrations is empty.
   * If existing tables are found, automatically baselines existing initial migrations.
   */
  public async autoBaselineIfLegacyDetected(): Promise<string[]> {
    const applied = await this.getAppliedMigrations();
    if (applied.length > 0) {
      return [];
    }

    // Check existing tables in SQLite
    const tablesResult = await this.client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_schema_migrations'"
    );
    const existingTableNames = tablesResult.rows.map((r) => String(r.name).toLowerCase());

    const hasLegacyTables = ['cars', 'mobiles', 'product_vendor_listings'].some((tbl) =>
      existingTableNames.includes(tbl)
    );

    if (!hasLegacyTables) {
      return [];
    }

    this.logger.info(
      `Detected pre-existing database tables (${existingTableNames.join(', ')}). Auto-baselining initial migrations...`
    );

    const files = this.getMigrationFiles();
    const baselinedNames: string[] = [];

    // Baseline migrations up to redirect_clicks if redirect_clicks also exists, or up to 0004
    for (const file of files) {
      const lowerName = file.name.toLowerCase();
      const shouldBaseline =
        (lowerName.includes('versions') && existingTableNames.includes('versions')) ||
        (lowerName.includes('cars') && existingTableNames.includes('cars')) ||
        (lowerName.includes('mobiles') && existingTableNames.includes('mobiles')) ||
        (lowerName.includes('product_vendor_listings') &&
          existingTableNames.includes('product_vendor_listings')) ||
        (lowerName.includes('redirect_clicks') && existingTableNames.includes('redirect_clicks'));

      if (shouldBaseline) {
        await this.client.execute({
          sql: 'INSERT INTO _schema_migrations (name, checksum) VALUES (?, ?)',
          args: [file.name, file.checksum],
        });
        baselinedNames.push(file.name);
        this.logger.info(`Auto-baselined migration: ${file.name}`);
      }
    }

    return baselinedNames;
  }

  /**
   * Marks specified migration(s) as applied without executing SQL (baseline)
   */
  public async baseline(target?: string, markAll = false): Promise<string[]> {
    await this.ensureMigrationsTable();
    const files = this.getMigrationFiles();

    const toBaseline: MigrationFile[] = [];

    if (markAll) {
      toBaseline.push(...files);
    } else if (target) {
      const targetIndex = files.findIndex((f) => f.name === target || f.name.startsWith(target));
      if (targetIndex === -1) {
        throw new Error(`Target migration '${target}' not found in migrations directory.`);
      }
      for (let i = 0; i <= targetIndex; i++) {
        toBaseline.push(files[i]);
      }
    } else {
      throw new Error('Please specify a target migration name or use --all.');
    }

    const recorded: string[] = [];
    for (const file of toBaseline) {
      await this.client.execute({
        sql: `INSERT INTO _schema_migrations (name, checksum) 
              VALUES (?, ?) 
              ON CONFLICT(name) DO UPDATE SET checksum = excluded.checksum`,
        args: [file.name, file.checksum],
      });
      recorded.push(file.name);
      this.logger.info(`Baselined migration (marked applied): ${file.name}`);
    }

    return recorded;
  }

  /**
   * Runs all pending migrations in sequential order
   */
  public async migrateUp(): Promise<string[]> {
    await this.ensureMigrationsTable();
    await this.autoBaselineIfLegacyDetected();

    const applied = await this.getAppliedMigrations();
    const appliedMap = new Map<string, AppliedMigration>(applied.map((a) => [a.name, a]));
    const files = this.getMigrationFiles();

    // 1. Verify checksum integrity for already applied migrations
    for (const file of files) {
      const appliedMigration = appliedMap.get(file.name);
      if (appliedMigration) {
        if (appliedMigration.checksum !== file.checksum) {
          throw new Error(
            `Migration checksum mismatch for '${file.name}'!\n` +
              `Applied checksum: ${appliedMigration.checksum}\n` +
              `Current checksum: ${file.checksum}\n` +
              `Applied migrations should never be modified. Please create a new migration instead.`
          );
        }
      }
    }

    // 2. Identify pending migrations
    const pendingFiles = files.filter((file) => !appliedMap.has(file.name));

    if (pendingFiles.length === 0) {
      this.logger.info('Database schema is up to date. No pending migrations.');
      return [];
    }

    this.logger.info(`Found ${pendingFiles.length} pending migration(s) to apply.`);

    const newlyApplied: string[] = [];

    // 3. Execute each pending migration sequentially
    for (const file of pendingFiles) {
      this.logger.info(`Applying migration: ${file.name}...`);
      const statements = this.splitSqlStatements(file.sql);

      // Execute SQL statements inside transaction
      const transaction = await this.client.transaction('write');
      try {
        for (const statement of statements) {
          await transaction.execute(statement);
        }

        await transaction.execute({
          sql: 'INSERT INTO _schema_migrations (name, checksum) VALUES (?, ?)',
          args: [file.name, file.checksum],
        });

        await transaction.commit();
        newlyApplied.push(file.name);
        this.logger.info(`Successfully applied: ${file.name}`);
      } catch (err) {
        await transaction.rollback();
        this.logger.error(`Failed to apply migration '${file.name}':`, err);
        throw err;
      }
    }

    this.logger.info(`Successfully applied ${newlyApplied.length} migration(s).`);
    return newlyApplied;
  }

  /**
   * Returns current migration status for all files
   */
  public async getStatus(): Promise<MigrationStatus[]> {
    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();
    const appliedMap = new Map<string, AppliedMigration>(applied.map((a) => [a.name, a]));
    const files = this.getMigrationFiles();

    return files.map((file) => {
      const app = appliedMap.get(file.name);
      return {
        name: file.name,
        status: app ? 'applied' : 'pending',
        appliedAt: app?.applied_at,
        checksum: file.checksum,
      };
    });
  }

  /**
   * Scaffolds a new migration file with sequential numbering
   */
  public createMigration(description: string): string {
    if (!description || description.trim().length === 0) {
      throw new Error('Migration description is required.');
    }

    const sanitizedDesc = description
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const files = this.getMigrationFiles();
    let nextNum = 1;

    if (files.length > 0) {
      const lastFile = files[files.length - 1].name;
      const match = lastFile.match(/^(\d+)_/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    const prefix = String(nextNum).padStart(4, '0');
    const fileName = `${prefix}_${sanitizedDesc}.sql`;
    const fullPath = path.join(this.migrationsDir, fileName);

    const template = `-- Migration: ${fileName}
-- Description: ${description}

-- Write your SQL migration statements below.
-- Remember to follow the Expand/Contract pattern for zero-downtime migrations.

`;

    fs.writeFileSync(fullPath, template, 'utf-8');
    this.logger.info(`Created new migration file: ${fullPath}`);
    return fileName;
  }
}
