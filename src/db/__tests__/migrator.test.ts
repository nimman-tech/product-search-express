import { Migrator } from '../migrator.js';
import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Migrator', () => {
  let tempDir: string;
  let dbPath: string;
  let dbClient: ReturnType<typeof createClient>;
  let migrator: Migrator;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrator-test-'));
    dbPath = path.join(tempDir, 'test.db');
    dbClient = createClient({
      url: `file:${dbPath}`,
    });
    migrator = new Migrator({
      migrationsDir: tempDir,
      client: dbClient,
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    });
  });

  afterEach(async () => {
    // Close the SQLite file handle first — on Windows, deleting a still-open
    // db file fails with EBUSY since open files can't be unlinked.
    dbClient.close();
    if (fs.existsSync(tempDir)) {
      // Best-effort cleanup only: on Windows the OS can hold onto the
      // SQLite/WAL file handle well after close() returns (longer for tests
      // that actually run migrations), so bound how long we wait rather than
      // let a lingering lock hang the suite. Each test gets its own unique
      // temp dir, so a leftover locked directory here doesn't affect other
      // tests or later runs.
      const cleanup = fs.promises
        .rm(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
        .catch(() => undefined);
      await Promise.race([cleanup, new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
  }, 10000);

  test('calculates sha256 checksum correctly', () => {
    const checksum1 = migrator.calculateChecksum('SELECT 1;');
    const checksum2 = migrator.calculateChecksum('SELECT 1;\n');
    expect(checksum1).toBe(checksum2);
    expect(checksum1.length).toBe(64);
  });

  test('splits SQL statements and strips comments', () => {
    const sql = `
      -- First comment
      CREATE TABLE test (id INT);
      /* Multi-line
         comment */
      INSERT INTO test VALUES (1);
    `;
    const statements = migrator.splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe('CREATE TABLE test (id INT)');
    expect(statements[1]).toBe('INSERT INTO test VALUES (1)');
  });

  test('creates _schema_migrations table and runs migrations', async () => {
    fs.writeFileSync(
      path.join(tempDir, '0001_initial.sql'),
      'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);'
    );
    fs.writeFileSync(
      path.join(tempDir, '0002_add_index.sql'),
      'CREATE INDEX idx_users_name ON users(name);'
    );

    const applied = await migrator.migrateUp();
    expect(applied).toEqual(['0001_initial.sql', '0002_add_index.sql']);

    const appliedRecords = await migrator.getAppliedMigrations();
    expect(appliedRecords).toHaveLength(2);
    expect(appliedRecords[0].name).toBe('0001_initial.sql');
    expect(appliedRecords[1].name).toBe('0002_add_index.sql');

    // Re-running migrateUp should be a no-op
    const reApplied = await migrator.migrateUp();
    expect(reApplied).toEqual([]);
  });

  test('detects checksum tampering on previously applied migrations', async () => {
    const file1 = path.join(tempDir, '0001_initial.sql');
    fs.writeFileSync(file1, 'CREATE TABLE users (id INTEGER PRIMARY KEY);');

    await migrator.migrateUp();

    // Tamper with migration file 1
    fs.writeFileSync(file1, 'CREATE TABLE users (id INTEGER PRIMARY KEY, modified TEXT);');

    await expect(migrator.migrateUp()).rejects.toThrow(
      /Migration checksum mismatch for '0001_initial.sql'/
    );
  });

  test('baselines existing migrations without running SQL', async () => {
    fs.writeFileSync(
      path.join(tempDir, '0001_initial.sql'),
      'INVALID SQL SYNTAX THAT WOULD CRASH IF EXECUTED'
    );

    const baselined = await migrator.baseline('0001_initial.sql');
    expect(baselined).toEqual(['0001_initial.sql']);

    const appliedRecords = await migrator.getAppliedMigrations();
    expect(appliedRecords).toHaveLength(1);
    expect(appliedRecords[0].name).toBe('0001_initial.sql');

    // Status shows it as applied
    const status = await migrator.getStatus();
    expect(status[0].status).toBe('applied');
  });

  test('auto-baselines when pre-existing legacy tables are detected', async () => {
    // Manually create existing table in SQLite
    await dbClient.execute('CREATE TABLE cars (id TEXT PRIMARY KEY);');

    fs.writeFileSync(path.join(tempDir, '0001_create_cars.sql'), 'CREATE TABLE cars (id TEXT);');
    fs.writeFileSync(path.join(tempDir, '0002_create_other.sql'), 'CREATE TABLE other (id TEXT);');

    const applied = await migrator.migrateUp();
    // 0001 was auto-baselined, 0002 was executed
    expect(applied).toEqual(['0002_create_other.sql']);

    const status = await migrator.getStatus();
    expect(status.find((s) => s.name === '0001_create_cars.sql')?.status).toBe('applied');
    expect(status.find((s) => s.name === '0002_create_other.sql')?.status).toBe('applied');
  });

  test('scaffolds new migration files sequentially', () => {
    const file1 = migrator.createMigration('add user email');
    expect(file1).toBe('0001_add_user_email.sql');
    expect(fs.existsSync(path.join(tempDir, file1))).toBe(true);

    const file2 = migrator.createMigration('add_user_avatar');
    expect(file2).toBe('0002_add_user_avatar.sql');
    expect(fs.existsSync(path.join(tempDir, file2))).toBe(true);
  });
});
