import type { Config } from 'drizzle-kit';
import { loadEnv } from './src/config/env';

// Load environment variables
const env = loadEnv();

/**
 * Drizzle Kit Configuration
 * 
 * This configuration file defines how Drizzle ORM should generate
 * SQL migrations and manage the database schema.
 * 
 * @see https://orm.drizzle.team/docs/kit-overview
 */
export default {
  // Database connection string
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  
  // Migration settings
  verbose: true,
  strict: true,
  
  // Generate TypeScript types
  introspect: {
    casing: 'preserve',
  },
  
  // Migration naming convention
  migrations: {
    prefix: 'timestamp',
    schema: 'public',
    table: '__drizzle_migrations',
  },
} satisfies Config;