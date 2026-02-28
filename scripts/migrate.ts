#!/usr/bin/env bun

/**
 * Database Migration Script
 * 
 * This script handles database migrations for the BotGrocer application.
 * It uses Drizzle Kit to generate and apply migrations.
 * 
 * Usage:
 *   bun run scripts/migrate.ts          # Apply all pending migrations
 *   bun run scripts/migrate.ts --reset  # Reset database and apply migrations
 *   bun run scripts/migrate.ts --seed   # Apply migrations and seed database
 */

import { execSync } from 'child_process';
import { config } from '../src/config';
import { logger } from '../src/utils/logger';

/**
 * Migration Options
 */
interface MigrationOptions {
  reset?: boolean;
  seed?: boolean;
  generate?: boolean;
}

/**
 * Main migration function
 */
async function migrate(options: MigrationOptions = {}) {
  logger.info('🚀 Starting database migration...');
  logger.info(`📊 Database: ${config.db.url.split('@')[1]?.split('/')[0] || 'configured'}`);
  
  try {
    // Generate migrations if requested
    if (options.generate) {
      logger.info('🔧 Generating migrations...');
      execSync('bun run db:generate', { stdio: 'inherit' });
      logger.info('✅ Migrations generated');
    }
    
    // Reset database if requested
    if (options.reset) {
      logger.warn('⚠️  Resetting database...');
      // In production, you would want more safeguards here
      // For now, we'll just drop and recreate the database
      execSync('bun run db:push --force', { stdio: 'inherit' });
      logger.info('✅ Database reset complete');
    }
    
    // Apply migrations
    logger.info('📦 Applying migrations...');
    execSync('bun run db:migrate', { stdio: 'inherit' });
    logger.info('✅ Migrations applied successfully');
    
    // Seed database if requested
    if (options.seed) {
      logger.info('🌱 Seeding database...');
      execSync('bun run db:seed', { stdio: 'inherit' });
      logger.info('✅ Database seeded successfully');
    }
    
    logger.info('🎉 Database migration completed successfully');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {};
  
  for (const arg of args) {
    if (arg === '--reset') options.reset = true;
    if (arg === '--seed') options.seed = true;
    if (arg === '--generate') options.generate = true;
  }
  
  return options;
}

// Run migration if this script is executed directly
if (import.meta.main) {
  const options = parseArgs();
  migrate(options).catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrate };