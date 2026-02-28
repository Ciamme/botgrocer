import { Elysia } from 'elysia';
import { requestLogger } from '../utils/logger';
import { config } from '../config';

/**
 * API Router Module
 * 
 * This module organizes all API routes into a hierarchical structure.
 * Each route group is imported from its own module for maintainability.
 */

// Import route modules
import { productRoutes } from './products';
import { orderRoutes } from './orders';
import { userRoutes } from './users';
import { agentRoutes } from './agents';
import { mcpRoutes } from './mcp';
import { systemRoutes } from './system';

/**
 * Main API Router
 * 
 * Combines all route modules with proper versioning and middleware.
 */
export const apiRouter = new Elysia({ prefix: '/api' })
  // Add request logging middleware
  .use(requestLogger)
  
  // API versioning middleware
  .onTransform(({ set }) => {
    set.headers['X-API-Version'] = '1.0.0';
    set.headers['X-Service-Name'] = 'BotGrocer';
  })
  
  // Global API documentation
  .get('/', () => ({
    name: 'BotGrocer API',
    version: '1.0.0',
    description: 'The first marketplace API for AI agents',
    documentation: '/docs',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      agents: '/api/agents',
      mcp: '/api/mcp',
      system: '/api/system',
    },
    features: {
      agentApi: config.agent.enabled,
      mcp: config.mcp.enabled,
      selfEvolution: config.features.selfEvolution,
    },
  }))
  
  // Mount route modules
  .use(productRoutes)
  .use(orderRoutes)
  .use(userRoutes)
  .use(agentRoutes)
  .use(mcpRoutes)
  .use(systemRoutes)
  
  // 404 handler for API routes
  .all('*', ({ set }) => {
    set.status = 404;
    return {
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: 'API endpoint not found',
        suggestion: 'Check the API documentation at /docs',
      },
    };
  });

/**
 * API Response Types
 * 
 * Standardized response formats for all API endpoints.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  timestamp: string;
}

/**
 * Success Response Helper
 * 
 * Creates a standardized success response.
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error Response Helper
 * 
 * Creates a standardized error response.
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Pagination Helper
 * 
 * Creates pagination metadata for list responses.
 */
export function paginationMeta(
  page: number,
  limit: number,
  total: number
): ApiResponse['meta'] {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    hasMore: page < totalPages,
    totalPages,
  };
}

/**
 * API Rate Limiting Middleware
 * 
 * Basic rate limiting for API endpoints.
 * In production, use a more sophisticated solution like Redis.
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (context: any) => {
    const ip = context.request.headers.get('x-forwarded-for') || 
               context.request.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // First request or window expired
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return;
    }
    
    if (userRequests.count >= maxRequests) {
      context.set.status = 429;
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Increment request count
    userRequests.count++;
  };
};

// Export route modules for individual use
export { productRoutes, orderRoutes, userRoutes, agentRoutes, mcpRoutes, systemRoutes };