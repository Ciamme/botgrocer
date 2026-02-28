import { 
  pgTable, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  jsonb, 
  uuid, 
  decimal,
  primaryKey,
  foreignKey,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Database Schema for BotGrocer
 * 
 * This schema defines all database tables and their relationships.
 * We use JSONB extensively for flexibility and future evolution.
 */

// ============================================
// Core Tables
// ============================================

/**
 * Users Table
 * 
 * Stores both human users and AI agents.
 * Uses JSONB for flexible metadata storage.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  
  // User type: 'human' or 'agent'
  type: text('type').notNull().default('human'),
  
  // Authentication
  passwordHash: text('password_hash'),
  apiKey: text('api_key').unique(),
  apiKeyHash: text('api_key_hash'),
  
  // Agent-specific fields
  agentModel: text('agent_model'),
  agentProvider: text('agent_provider'),
  agentCapabilities: jsonb('agent_capabilities').$type<string[]>().default([]),
  
  // Flexible metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Credits and balance
  credits: decimal('credits', { precision: 20, scale: 8 }).default('1000'),
  
  // Status
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  isBanned: boolean('is_banned').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  
  // Indexes
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  usernameIdx: uniqueIndex('users_username_idx').on(table.username),
  apiKeyIdx: uniqueIndex('users_api_key_idx').on(table.apiKey),
  typeIdx: index('users_type_idx').on(table.type),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
}));

/**
 * Products Table
 * 
 * Stores products available in the marketplace.
 * Uses JSONB for flexible product attributes.
 */
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: text('sku').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // Product type: 'api', 'compute', 'data', 'model', 'service'
  type: text('type').notNull(),
  category: text('category').notNull(),
  
  // Pricing
  price: decimal('price', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').default('USD'),
  isRecurring: boolean('is_recurring').default(false),
  billingPeriod: text('billing_period'), // 'monthly', 'yearly', etc.
  
  // Inventory
  stock: integer('stock').default(-1), // -1 for unlimited
  isDigital: boolean('is_digital').default(true),
  
  // Product specifications
  specifications: jsonb('specifications').$type<Record<string, any>>().default({}),
  
  // AI Agent compatibility
  agentCompatible: boolean('agent_compatible').default(true),
  requiredAgentCapabilities: jsonb('required_agent_capabilities').$type<string[]>().default([]),
  
  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Status
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  
  // Indexes
}, (table) => ({
  skuIdx: uniqueIndex('products_sku_idx').on(table.sku),
  typeIdx: index('products_type_idx').on(table.type),
  categoryIdx: index('products_category_idx').on(table.category),
  priceIdx: index('products_price_idx').on(table.price),
  publishedIdx: index('products_published_idx').on(table.isPublished),
  createdAtIdx: index('products_created_at_idx').on(table.createdAt),
}));

/**
 * Orders Table
 * 
 * Stores purchase orders from users/agents.
 */
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').unique().notNull(),
  
  // Customer
  userId: uuid('user_id').references(() => users.id),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  
  // Order details
  totalAmount: decimal('total_amount', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').default('USD'),
  
  // Shipping/Billing (for physical goods)
  shippingAddress: jsonb('shipping_address').$type<Record<string, any>>(),
  billingAddress: jsonb('billing_address').$type<Record<string, any>>(),
  
  // Payment
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  paymentId: text('payment_id'),
  
  // Order status
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'cancelled'
  fulfillmentStatus: text('fulfillment_status').default('unfulfilled'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
  completedAt: timestamp('completed_at'),
  
  // Indexes
}, (table) => ({
  orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
  userIdIdx: index('orders_user_id_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

/**
 * Order Items Table
 * 
 * Stores individual items within an order.
 */
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  
  // Item details
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 20, scale: 8 }).notNull(),
  totalPrice: decimal('total_price', { precision: 20, scale: 8 }).notNull(),
  
  // Product snapshot at time of purchase
  productSnapshot: jsonb('product_snapshot').$type<Record<string, any>>().notNull(),
  
  // Fulfillment
  fulfillmentStatus: text('fulfillment_status').default('unfulfilled'),
  deliveredAt: timestamp('delivered_at'),
  
  // Digital delivery
  downloadUrl: text('download_url'),
  accessToken: text('access_token'),
  accessExpiresAt: timestamp('access_expires_at'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Indexes
}, (table) => ({
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
  productIdIdx: index('order_items_product_id_idx').on(table.productId),
}));

// ============================================
// AI Agent Specific Tables
// ============================================

/**
 * Agent Sessions Table
 * 
 * Stores active sessions for AI agents.
 */
export const agentSessions = pgTable('agent_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => users.id).notNull(),
  
  // Session details
  sessionToken: text('session_token').unique().notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // Capabilities and context
  capabilities: jsonb('capabilities').$type<string[]>().default([]),
  context: jsonb('context').$type<Record<string, any>>().default({}),
  
  // Activity tracking
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  requestCount: integer('request_count').default(0),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  
  // Indexes
}, (table) => ({
  agentIdIdx: index('agent_sessions_agent_id_idx').on(table.agentId),
  sessionTokenIdx: uniqueIndex('agent_sessions_token_idx').on(table.sessionToken),
  isActiveIdx: index('agent_sessions_active_idx').on(table.isActive),
}));

/**
 * Agent Actions Table
 * 
 * Logs actions performed by AI agents for audit and learning.
 */
export const agentActions = pgTable('agent_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => users.id).notNull(),
  sessionId: uuid('session_id').references(() => agentSessions.id),
  
  // Action details
  actionType: text('action_type').notNull(), // 'browse', 'search', 'purchase', 'review', etc.
  actionTarget: text('action_target'), // Product ID, page URL, etc.
  
  // Action data
  input: jsonb('input').$type<Record<string, any>>(),
  output: jsonb('output').$type<Record<string, any>>(),
  result: text('result'), // 'success', 'failure', 'partial'
  
  // Performance metrics
  responseTime: integer('response_time'), // in milliseconds
  tokensUsed: integer('tokens_used'),
  
  // Learning feedback
  feedbackScore: integer('feedback_score'), // 1-5
  feedbackComment: text('feedback_comment'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Indexes
}, (table) => ({
  agentIdIdx: index('agent_actions_agent_id_idx').on(table.agentId),
  actionTypeIdx: index('agent_actions_type_idx').on(table.actionType),
  createdAtIdx: index('agent_actions_created_at_idx').on(table.createdAt),
}));

// ============================================
// Self-Evolution Tables
// ============================================

/**
 * Evolution Logs Table
 * 
 * Logs system evolution events for transparency and rollback.
 */
export const evolutionLogs = pgTable('evolution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Evolution details
  evolutionType: text('evolution_type').notNull(), // 'schema', 'api', 'ui', 'feature'
  description: text('description').notNull(),
  
  // Changes
  changes: jsonb('changes').$type<Record<string, any>>().notNull(),
  previousState: jsonb('previous_state').$type<Record<string, any>>(),
  newState: jsonb('new_state').$type<Record<string, any>>(),
  
  // Trigger
  triggeredBy: uuid('triggered_by').references(() => users.id),
  triggerType: text('trigger_type'), // 'manual', 'automatic', 'agent_request'
  triggerData: jsonb('trigger_data').$type<Record<string, any>>(),
  
  // Status
  status: text('status').default('pending'), // 'pending', 'applied', 'failed', 'rolled_back'
  error: text('error'),
  
  // Impact analysis
  affectedTables: jsonb('affected_tables').$type<string[]>().default([]),
  estimatedImpact: text('estimated_impact'), // 'low', 'medium', 'high'
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  appliedAt: timestamp('applied_at'),
  
  // Indexes
}, (table) => ({
  evolutionTypeIdx: index('evolution_logs_type_idx').on(table.evolutionType),
  statusIdx: index('evolution_logs_status_idx').on(table.status),
  createdAtIdx: index('evolution_logs_created_at_idx').on(table.createdAt),
}));

// ============================================
// MCP (Model Context Protocol) Tables
// ============================================

/**
 * MCP Tools Table
 * 
 * Stores available MCP tools for AI agents.
 */
export const mcpTools = pgTable('mcp_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  description: text('description').notNull(),
  
  // Tool specification
  inputSchema: jsonb('input_schema').$type<Record<string, any>>().notNull(),
  outputSchema: jsonb('output_schema').$type<Record<string, any>>().notNull(),
  
  // Execution
  handlerType: text('handler_type').notNull(), // 'function', 'api', 'database'
  handlerConfig: jsonb('handler_config').$type<Record<string, any>>().notNull(),
  
  // Permissions
  requiredPermissions: jsonb('required_permissions').$type<string[]>().default([]),
  allowedAgentTypes: jsonb('allowed_agent_types').$type<string[]>().default(['*']),
  
  // Status
  isActive: boolean('is_active').default(true),
  isDeprecated: boolean('is_deprecated').default(false),
  
  // Versioning
  version: text('version').default('1.0.0'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Indexes
}, (table) => ({
  nameIdx: uniqueIndex('mcp_tools_name_idx').on(table.name),
  isActiveIdx: index('mcp_tools_active_idx').on(table.isActive),
}));

/**
 * MCP Tool Executions Table
 * 
 * Logs MCP tool executions for audit and learning.
 */
export const mcpToolExecutions = pgTable('mcp_tool_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: uuid('tool_id').references(() => mcpTools.id).notNull(),
  agentId: uuid('agent_id').references(() => users.id).notNull(),
  sessionId: uuid('session_id').references(() => agentSessions.id),
  
  // Execution details
  input: jsonb('input').$type<Record<string, any>>().notNull(),
  output: jsonb('output').$type<Record<string, any>>(),
  error: text('error'),
  
  // Performance
  executionTime: integer('execution_time').notNull(), // in milliseconds
  tokensUsed: integer('tokens_used'),
  
  // Status
  status: text('status').notNull(), // 'success', 'error', 'timeout'
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Indexes
}, (table) => ({
  toolIdIdx: index('mcp_tool_executions_tool_id_idx').on(table.toolId),
  agentIdIdx: index('mcp_tool_executions_agent_id_idx').on(table.agentId),
  statusIdx: index('mcp_tool_executions_status_idx').on(table.status),
  createdAtIdx: index('mcp_tool_executions_created_at_idx').on(table.createdAt),
}));

// ============================================
// Table Relationships
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  agentSessions: many(agentSessions),
  agentActions: many(agentActions),
  evolutionLogs: many(evolutionLogs),
  mcpToolExecutions: many(mcpToolExecutions),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const agentSessionsRelations = relations(agentSessions, ({ one, many }) => ({
  agent: one(users, {
    fields: [agentSessions.agentId],
    references: [users.id],
  }),
  actions: many(agentActions),
  toolExecutions: many(mcpToolExecutions),
}));

export const agentActionsRelations = relations(agentActions, ({ one }) => ({
  agent: one(users, {
    fields: [agentActions.agentId],
    references: [users.id],
  }),
  session: one(agentSessions, {
    fields: [agentActions.sessionId],
    references: [agentSessions.id],
  }),
}));

export const mcpToolsRelations = relations(mcpTools, ({ many }) => ({
  executions: many(mcpToolExecutions),
}));

export const mcpToolExecutionsRelations = relations(mcpToolExecutions, ({ one }) => ({
  tool: one(mcpTools, {
    fields: [mcpToolExecutions.toolId],
    references: [mcpTools.id],
  }),
  agent: one(users, {
    fields: [mcpToolExecutions.agentId],
    references: [users.id],
  }),
  session: one(agentSessions, {
    fields: [mcpToolExecutions.sessionId],
    references: [agentSessions.id],
  }),
}));

// ============================================
// Zod Schemas for Validation
// ============================================

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

// Export all tables
export * from './schema';