#!/usr/bin/env bun

/**
 * Database Seeding Script
 * 
 * This script seeds the database with initial data for development and testing.
 * It creates sample products, users, and other essential data.
 */

import { db, schema } from '../src/db';
import { logger } from '../src/utils/logger';
import { config } from '../src/config';

/**
 * Sample Products Data
 * 
 * These are example products that demonstrate the marketplace capabilities.
 */
const sampleProducts = [
  {
    sku: 'API-OPENAI-001',
    name: 'OpenAI API Access',
    description: 'Premium access to OpenAI GPT-4 API with 1M tokens per month',
    type: 'api',
    category: 'ai_services',
    price: '99.99',
    currency: 'USD',
    stock: -1,
    isDigital: true,
    specifications: {
      tokens_per_month: 1000000,
      model: 'gpt-4',
      rate_limit: '100 RPM',
      support_level: 'premium',
    },
    agentCompatible: true,
    requiredAgentCapabilities: ['api_access', 'text_generation'],
    tags: ['api', 'openai', 'gpt-4', 'premium'],
    isPublished: true,
    isFeatured: true,
  },
  {
    sku: 'COMPUTE-GPU-001',
    name: 'GPU Compute Time',
    description: '1 hour of NVIDIA A100 GPU compute for model training',
    type: 'compute',
    category: 'compute_resources',
    price: '4.99',
    currency: 'USD',
    stock: 100,
    isDigital: true,
    specifications: {
      gpu_type: 'NVIDIA A100',
      memory: '40GB',
      compute_hours: 1,
      storage: '500GB SSD',
    },
    agentCompatible: true,
    requiredAgentCapabilities: ['compute_access', 'model_training'],
    tags: ['gpu', 'compute', 'training', 'a100'],
    isPublished: true,
    isFeatured: true,
  },
  {
    sku: 'DATA-DATASET-001',
    name: 'Training Dataset',
    description: 'Curated dataset of 1M text samples for AI training',
    type: 'data',
    category: 'datasets',
    price: '49.99',
    currency: 'USD',
    stock: 50,
    isDigital: true,
    specifications: {
      samples: 1000000,
      format: 'jsonl',
      categories: ['text', 'code', 'conversation'],
      license: 'commercial',
    },
    agentCompatible: true,
    requiredAgentCapabilities: ['data_processing', 'model_training'],
    tags: ['dataset', 'training', 'text', 'curated'],
    isPublished: true,
  },
  {
    sku: 'MODEL-FINETUNE-001',
    name: 'Model Fine-tuning Service',
    description: 'Professional fine-tuning service for custom AI models',
    type: 'service',
    category: 'ai_services',
    price: '299.99',
    currency: 'USD',
    stock: 10,
    isDigital: true,
    specifications: {
      base_model: 'custom',
      training_steps: 10000,
      validation_data: 'included',
      support: 'email',
    },
    agentCompatible: false, // Requires human intervention
    requiredAgentCapabilities: [],
    tags: ['service', 'fine-tuning', 'custom', 'professional'],
    isPublished: true,
  },
  {
    sku: 'API-ANTHROPIC-001',
    name: 'Anthropic Claude API',
    description: 'Access to Anthropic Claude API with 500K tokens',
    type: 'api',
    category: 'ai_services',
    price: '79.99',
    currency: 'USD',
    stock: -1,
    isDigital: true,
    specifications: {
      tokens_per_month: 500000,
      model: 'claude-3-opus',
      rate_limit: '50 RPM',
      context_window: '200K',
    },
    agentCompatible: true,
    requiredAgentCapabilities: ['api_access', 'text_generation'],
    tags: ['api', 'anthropic', 'claude', 'llm'],
    isPublished: true,
  },
];

/**
 * Sample Users Data
 */
const sampleUsers = [
  {
    email: 'admin@botgrocer.com',
    username: 'admin',
    displayName: 'System Administrator',
    type: 'human',
    isVerified: true,
    isActive: true,
    credits: '10000',
  },
  {
    email: 'agent@deepseek.com',
    username: 'deepseek_agent',
    displayName: 'DeepSeek AI Agent',
    type: 'agent',
    agentModel: 'DeepSeek-V3',
    agentProvider: 'DeepSeek',
    agentCapabilities: ['api_access', 'text_generation', 'data_processing', 'compute_access'],
    isVerified: true,
    isActive: true,
    credits: '5000',
  },
  {
    email: 'user@example.com',
    username: 'example_user',
    displayName: 'Example User',
    type: 'human',
    isVerified: true,
    isActive: true,
    credits: '1000',
  },
];

/**
 * Main seeding function
 */
async function seed() {
  logger.info('🌱 Starting database seeding...');
  
  try {
    // Check if database already has data
    const existingProducts = await db.select({ count: schema.products.id })
      .from(schema.products);
    const existingUsers = await db.select({ count: schema.users.id })
      .from(schema.users);
    
    const hasProducts = existingProducts[0]?.count > 0;
    const hasUsers = existingUsers[0]?.count > 0;
    
    if (hasProducts || hasUsers) {
      logger.warn('⚠️  Database already contains data. Skipping seeding.');
      return;
    }
    
    // Seed users
    logger.info('👥 Seeding users...');
    for (const userData of sampleUsers) {
      await db.insert(schema.users).values(userData);
    }
    logger.info(`✅ Seeded ${sampleUsers.length} users`);
    
    // Seed products
    logger.info('📦 Seeding products...');
    for (const productData of sampleProducts) {
      await db.insert(schema.products).values(productData);
    }
    logger.info(`✅ Seeded ${sampleProducts.length} products`);
    
    // Create sample MCP tools
    logger.info('🔧 Seeding MCP tools...');
    await db.insert(schema.mcpTools).values([
      {
        name: 'search_products',
        description: 'Search for products in the marketplace',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            category: { type: 'string' },
            maxPrice: { type: 'number' },
          },
          required: [],
        },
        outputSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
        handlerType: 'api',
        handlerConfig: {
          endpoint: '/api/products/search',
          method: 'POST',
        },
        requiredPermissions: ['read_products'],
        allowedAgentTypes: ['*'],
      },
      {
        name: 'create_order',
        description: 'Create a new order for products',
        inputSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number' },
                },
                required: ['productId', 'quantity'],
              },
            },
          },
          required: ['items'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            orderId: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
          },
        },
        handlerType: 'api',
        handlerConfig: {
          endpoint: '/api/orders',
          method: 'POST',
        },
        requiredPermissions: ['create_orders'],
        allowedAgentTypes: ['agent'],
      },
      {
        name: 'get_product_details',
        description: 'Get detailed information about a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
          },
          required: ['productId'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            specifications: { type: 'object' },
            agentCompatible: { type: 'boolean' },
          },
        },
        handlerType: 'api',
        handlerConfig: {
          endpoint: '/api/products/:productId',
          method: 'GET',
        },
        requiredPermissions: ['read_products'],
        allowedAgentTypes: ['*'],
      },
    ]);
    logger.info('✅ Seeded 3 MCP tools');
    
    // Create sample evolution log
    logger.info('🔄 Seeding evolution log...');
    await db.insert(schema.evolutionLogs).values({
      evolutionType: 'initial_seed',
      description: 'Initial database seeding with sample data',
      changes: {
        tables: ['users', 'products', 'mcp_tools'],
        records: sampleUsers.length + sampleProducts.length + 3,
      },
      previousState: { empty: true },
      newState: { seeded: true },
      triggerType: 'manual',
      status: 'applied',
      affectedTables: ['users', 'products', 'mcp_tools'],
      estimatedImpact: 'low',
    });
    logger.info('✅ Seeded evolution log');
    
    logger.info('🎉 Database seeding completed successfully');
    
    // Display summary
    const stats = await db.getStats();
    logger.info('📊 Seeding Summary:', {
      totalUsers: stats.totalUsers,
      totalProducts: stats.totalProducts,
      totalOrders: stats.totalOrders,
      activeAgents: stats.activeAgents,
      databaseSize: stats.databaseSize,
    });
    
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this script is executed directly
if (import.meta.main) {
  seed().catch((error) => {
    logger.error('Seeding failed:', error);
    process.exit(1);
  });
}

export { seed };