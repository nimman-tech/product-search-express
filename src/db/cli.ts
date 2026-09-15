#!/usr/bin/env node
import { loadEnvironment } from '../config/env.js';
import { Migrator } from './migrator.js';
import { logger } from '../utils/logger.js';

// Load environment variables
loadEnvironment();

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';

  const migrator = new Migrator();

  switch (command) {
    case 'up':
    case 'migrate': {
      logger.info('--- Running Database Migrations ---');
      const applied = await migrator.migrateUp();
      if (applied.length > 0) {
        logger.info(`Successfully executed ${applied.length} migration(s).`);
      } else {
        logger.info('No pending migrations to run.');
      }
      break;
    }

    case 'status': {
      logger.info('--- Database Migration Status ---');
      const statuses = await migrator.getStatus();
      if (statuses.length === 0) {
        logger.info('No migration files found.');
      } else {
        // eslint-disable-next-line no-console
        console.table(
          statuses.map((s) => ({
            Migration: s.name,
            Status: s.status.toUpperCase(),
            'Applied At': s.appliedAt || 'N/A',
          }))
        );
      }
      break;
    }

    case 'baseline': {
      const target = args[1];
      const isAll = target === '--all' || args.includes('--all');

      if (!target && !isAll) {
        logger.error('Error: Please specify target migration name or use --all');
        logger.info('Usage: npm run db:migrate:baseline <migration_name|--all>');
        process.exit(1);
      }

      logger.info(`--- Baselining Migrations (${isAll ? 'ALL' : target}) ---`);
      const baselined = await migrator.baseline(isAll ? undefined : target, isAll);
      logger.info(`Baselined ${baselined.length} migration(s).`);
      break;
    }

    case 'create':
    case 'new': {
      const description = args.slice(1).join('_');
      if (!description) {
        logger.error('Error: Please provide a description for the new migration.');
        logger.info('Usage: npm run db:migrate:create <description>');
        process.exit(1);
      }

      const fileName = migrator.createMigration(description);
      logger.info(`Generated migration: database/migrations/${fileName}`);
      break;
    }

    default:
      logger.info(`
Available Commands:
  up / migrate             - Apply all pending migrations (default)
  status                   - Show status of all migrations
  baseline <name | --all>  - Mark migration(s) as applied without running SQL
  create <description>     - Generate a new migration file
      `);
      break;
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Migration command failed:', err);
    process.exit(1);
  });
