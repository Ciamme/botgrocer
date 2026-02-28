#!/usr/bin/env bun

/**
 * BotGrocer - AI Agent Marketplace
 * 
 * Main application entry point.
 * 
 * This is a production-grade AI agent marketplace built with:
 * - Bun runtime for maximum performance
 * - TypeScript for type safety
 * - PostgreSQL with JSONB for flexibility
 * - Elysia.js for API development
 * - Drizzle ORM for database operations
 * 
 * The system supports both human users and AI agents,
 * with self-evolution capabilities and MCP integration.
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from './config';
import { db, healthCheck } from './db';
import { logger } from './utils/logger';
import { apiRouter } from './api';
import { mcpServer } from './mcp';

/**
 * Application Bootstrap
 * 
 * Initializes and starts the BotGrocer server.
 */
async function bootstrap() {
  logger.info('🚀 Starting BotGrocer AI Agent Marketplace...');
  logger.info(`🌍 Environment: ${config.server.nodeEnv}`);
  logger.info(`⚙️  Configuration loaded: ${Object.keys(config).length} modules`);
  
  // Check database connection
  logger.info('🔍 Checking database connection...');
  const dbHealthy = await healthCheck();
  if (!dbHealthy) {
    logger.error('❌ Database connection failed. Exiting...');
    process.exit(1);
  }
  logger.info('✅ Database connection established');
  
  // Get initial statistics
  try {
    const stats = await db.getStats();
    logger.info(`📊 Database stats: ${stats.totalUsers} users, ${stats.totalProducts} products, ${stats.totalOrders} orders`);
  } catch (error) {
    logger.warn('⚠️ Could not fetch initial database statistics');
  }
  
  // Create main Elysia application
  const app = new Elysia({
    // Application metadata
    name: 'BotGrocer',
    version: '1.0.0',
    
    // Request/Response logging
    request: {
      logger: config.server.isDevelopment,
    },
    
    // Error handling
    error: ({ code, error, set }) => {
      logger.error(`❌ Request error: ${code}`, error);
      
      // Return structured error response
      set.status = code === 'NOT_FOUND' ? 404 : 500;
      return {
        success: false,
        error: {
          code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    },
  })
  
  // Add CORS middleware
  .use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  }))
  
  // Add Swagger documentation (development only)
  .use(swagger({
    documentation: {
      info: {
        title: 'BotGrocer API',
        description: 'The first marketplace for AI agents - Complete API documentation',
        version: '1.0.0',
        contact: {
          name: 'BotGrocer Team',
          url: 'https://botgrocer.com',
        },
      },
      tags: [
        { name: 'Products', description: 'Product management endpoints' },
        { name: 'Orders', description: 'Order processing endpoints' },
        { name: 'Users', description: 'User and agent management' },
        { name: 'Agent API', description: 'Specialized endpoints for AI agents' },
        { name: 'MCP', description: 'Model Context Protocol tools' },
        { name: 'System', description: 'System health and monitoring' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for agent authentication',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for user authentication',
          },
        },
      },
    },
    path: '/docs',
    exclude: config.server.isProduction ? ['*'] : [],
  }))
  
  // Health check endpoint
  .get('/health', async () => {
    const dbHealthy = await healthCheck();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
      uptime: process.uptime(),
    };
  })
  
  // System information endpoint
  .get('/system/info', () => ({
    name: 'BotGrocer',
    version: '1.0.0',
    description: 'AI Agent Marketplace',
    environment: config.server.nodeEnv,
    features: {
      agentApi: config.agent.enabled,
      mcp: config.mcp.enabled,
      selfEvolution: config.features.selfEvolution,
      multiLanguage: config.features.multiLanguage,
    },
    database: {
      type: 'PostgreSQL',
      jsonbSupport: true,
    },
    runtime: {
      name: 'Bun',
      version: Bun.version,
    },
  }))
  
  // Mount API routes
  .use(apiRouter)
  
  // Global error handler
  .onError(({ code, error, set }) => {
    // Log all errors
    logger.error(`Global error handler: ${code}`, error);
    
    // Set appropriate status code
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        break;
      case 'VALIDATION':
        set.status = 400;
        break;
      case 'PARSE':
        set.status = 400;
        break;
      default:
        set.status = 500;
    }
    
    // Return error response
    return {
      success: false,
      error: {
        code,
        message: error.message,
        ...(config.server.isDevelopment && { stack: error.stack }),
      },
    };
  })
  
  // Global response transformer
  .mapResponse(({ response, set }) => {
    // Add security headers
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'DENY';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    
    // Add CORS headers
    set.headers['Access-Control-Allow-Origin'] = config.cors.origin.join(', ');
    set.headers['Access-Control-Allow-Credentials'] = config.cors.credentials.toString();
    
    return response;
  });
  
  // Start MCP server if enabled
  if (config.mcp.enabled) {
    try {
      await mcpServer.start();
      logger.info(`🤖 MCP server started on port ${config.mcp.port}`);
    } catch (error) {
      logger.error('❌ Failed to start MCP server:', error);
    }
  }
  
  // Start main server
  app.listen({
    port: config.server.port,
    hostname: config.server.host,
  });
  
  logger.info(`✅ BotGrocer server started on http://${config.server.host}:${config.server.port}`);
  logger.info(`📚 API Documentation: http://${config.server.host}:${config.server.port}/docs`);
  logger.info(`🤖 MCP Server: ${config.mcp.enabled ? `http://${config.server.host}:${config.mcp.port}` : 'disabled'}`);
  
  // Handle graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  /**
   * Graceful shutdown handler
   */
  async function gracefulShutdown() {
    logger.info('🛑 Received shutdown signal, starting graceful shutdown...');
    
    // Close MCP server
    if (config.mcp.enabled) {
      await mcpServer.stop();
      logger.info('✅ MCP server stopped');
    }
    
    // Close database connection
    await db.close();
    
    // Exit process
    logger.info('👋 BotGrocer shutdown complete');
    process.exit(0);
  }
  
  return app;
}

// Start the application
bootstrap().catch((error) => {
  logger.error('❌ Failed to start BotGrocer:', error);
  process.exit(1);
});