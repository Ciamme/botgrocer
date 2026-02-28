import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import * as schema from './schema';

/**
 * Database Connection Module
 * 
 * This module provides the database connection and query builder
 * for the entire application. It uses Drizzle ORM with PostgreSQL.
 */

// Create PostgreSQL connection
const connection = postgres(config.db.url, {
  max: config.db.poolSize,
  idle_timeout: config.db.idleTimeout,
  connect_timeout: config.db.connectionTimeout,
  
  // Connection hooks
  onnotice: (notice) => {
    if (config.server.isDevelopment) {
      console.log(`📝 PostgreSQL Notice: ${notice.message}`);
    }
  },
  
  onparameter: (key, value) => {
    if (config.server.isDevelopment) {
      console.log(`🔧 PostgreSQL Parameter: ${key} = ${value}`);
    }
  },
  
  // Transform snake_case to camelCase
  transform: {
    column: (col) => col,
    value: (val) => val,
    row: (row) => row,
  },
});

/**
 * Drizzle ORM Database Instance
 * 
 * This is the main database query builder with full type safety.
 * It includes all table schemas and relationships.
 */
export const db = drizzle(connection, { 
  schema,
  logger: config.server.isDevelopment,
});

/**
 * Database Types
 * 
 * Export TypeScript types for database operations.
 */
export type Database = typeof db;
export type NewUser = typeof schema.users.$inferInsert;
export type User = typeof schema.users.$inferSelect;
export type NewProduct = typeof schema.products.$inferInsert;
export type Product = typeof schema.products.$inferSelect;
export type NewOrder = typeof schema.orders.$inferInsert;
export type Order = typeof schema.orders.$inferSelect;

/**
 * Health Check
 * 
 * Checks if the database connection is healthy.
 * 
 * @returns Promise<boolean> True if connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await connection`SELECT 1 as health`;
    return result[0]?.health === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

/**
 * Close Database Connection
 * 
 * Gracefully closes the database connection.
 * Should be called during application shutdown.
 */
export async function close(): Promise<void> {
  try {
    await connection.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

/**
 * Execute Raw SQL Query
 * 
 * Utility function for executing raw SQL queries when needed.
 * Use with caution and prefer using Drizzle ORM when possible.
 * 
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function rawQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await connection.unsafe<T[]>(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Raw SQL query failed:', error);
    throw error;
  }
}

/**
 * Transaction Helper
 * 
 * Executes a function within a database transaction.
 * 
 * @param callback - Function to execute within transaction
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (tx: Database) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

/**
 * Database Statistics
 * 
 * Returns basic database statistics for monitoring.
 * 
 * @returns Database statistics object
 */
export async function getStats(): Promise<{
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  activeAgents: number;
  databaseSize: string;
}> {
  try {
    const [
      usersCount,
      productsCount,
      ordersCount,
      activeAgentsCount,
      dbSize
    ] = await Promise.all([
      db.select({ count: schema.users.id }).from(schema.users),
      db.select({ count: schema.products.id }).from(schema.products),
      db.select({ count: schema.orders.id }).from(schema.orders),
      db.select({ count: schema.agentSessions.id })
        .from(schema.agentSessions)
        .where(schema.agentSessions.isActive),
      rawQuery<{ size: string }>(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `),
    ]);
    
    return {
      totalUsers: usersCount[0]?.count || 0,
      totalProducts: productsCount[0]?.count || 0,
      totalOrders: ordersCount[0]?.count || 0,
      activeAgents: activeAgentsCount[0]?.count || 0,
      databaseSize: dbSize[0]?.size || '0 bytes',
    };
  } catch (error) {
    console.error('❌ Failed to get database statistics:', error);
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      activeAgents: 0,
      databaseSize: 'unknown',
    };
  }
}

// Export schema for convenience
export { schema };