import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { db, schema } from '../db';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * MCP (Model Context Protocol) Server
 * 
 * This server provides tools for AI agents to interact with the BotGrocer marketplace.
 * It follows the Anthropic MCP specification for tool calling.
 * 
 * @see https://spec.modelcontextprotocol.io/
 */

/**
 * MCP Tool Definition
 */
interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

/**
 * MCP Server Implementation
 */
export class McpServer {
  private server: Server;
  private transport?: StdioServerTransport;
  
  constructor() {
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'botgrocer-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    // Set up request handlers
    this.setupHandlers();
  }
  
  /**
   * Set up MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const tools = await this.getAvailableTools();
        return { tools };
      } catch (error) {
        logger.error('Failed to list MCP tools', { error });
        throw error;
      }
    });
    
    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        logger.info('MCP tool execution requested', { tool: name, args });
        
        const result = await this.executeTool(name, args);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error('MCP tool execution failed', { tool: name, error });
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
    
    // Handle server errors
    this.server.onerror = (error) => {
      logger.error('MCP server error:', error);
    };
  }
  
  /**
   * Get available MCP tools from database
   */
  private async getAvailableTools(): Promise<ToolSchema[]> {
    try {
      const tools = await db.select().from(schema.mcpTools).where(
        schema.mcpTools.isActive.eq(true)
      );
      
      return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));
    } catch (error) {
      logger.error('Failed to fetch MCP tools from database', { error });
      return [];
    }
  }
  
  /**
   * Execute MCP tool
   */
  private async executeTool(name: string, args: any): Promise<any> {
    // Get tool definition from database
    const tool = await db.query.mcpTools.findFirst({
      where: (tools, { eq }) => eq(tools.name, name),
    });
    
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    if (!tool.isActive) {
      throw new Error(`Tool is not active: ${name}`);
    }
    
    // Log tool execution
    const executionId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      let result: any;
      
      // Execute based on handler type
      switch (tool.handlerType) {
        case 'api':
          result = await this.executeApiTool(tool, args);
          break;
          
        case 'database':
          result = await this.executeDatabaseTool(tool, args);
          break;
          
        case 'function':
          result = await this.executeFunctionTool(tool, args);
          break;
          
        default:
          throw new Error(`Unsupported handler type: ${tool.handlerType}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Log successful execution
      await db.insert(schema.mcpToolExecutions).values({
        toolId: tool.id,
        agentId: args._agentId || 'unknown', // In production, get from auth
        input: args,
        output: result,
        executionTime,
        status: 'success',
        metadata: {
          executionId,
          handlerType: tool.handlerType,
        },
      });
      
      return result;
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      // Log failed execution
      await db.insert(schema.mcpToolExecutions).values({
        toolId: tool.id,
        agentId: args._agentId || 'unknown',
        input: args,
        error: error.message,
        executionTime,
        status: 'error',
        metadata: {
          executionId,
          handlerType: tool.handlerType,
          error: error.message,
        },
      });
      
      throw error;
    }
  }
  
  /**
   * Execute API-based tool
   */
  private async executeApiTool(tool: any, args: any): Promise<any> {
    const { endpoint, method = 'GET' } = tool.handlerConfig;
    
    // Replace path parameters
    let url = endpoint;
    if (args._pathParams) {
      for (const [key, value] of Object.entries(args._pathParams)) {
        url = url.replace(`:${key}`, value as string);
      }
    }
    
    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': args._apiKey || '',
      },
    };
    
    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const { _pathParams, _apiKey, _agentId, ...body } = args;
      requestOptions.body = JSON.stringify(body);
    }
    
    // Make API request
    const response = await fetch(`http://localhost:${config.server.port}${url}`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Execute database-based tool
   */
  private async executeDatabaseTool(tool: any, args: any): Promise<any> {
    const { query, operation } = tool.handlerConfig;
    
    switch (operation) {
      case 'select':
        return await db.rawQuery(query, args.params || []);
        
      case 'insert':
        const { table, data } = args;
        if (!table || !data) {
          throw new Error('Table name and data are required for insert operation');
        }
        // Note: In production, you'd want to validate table name and data structure
        return await db.insert(schema[table as keyof typeof schema] as any).values(data);
        
      case 'update':
        const { table: updateTable, data: updateData, where } = args;
        if (!updateTable || !updateData || !where) {
          throw new Error('Table name, data, and where clause are required for update operation');
        }
        return await db.update(schema[updateTable as keyof typeof schema] as any)
          .set(updateData)
          .where(where);
        
      default:
        throw new Error(`Unsupported database operation: ${operation}`);
    }
  }
  
  /**
   * Execute function-based tool
   */
  private async executeFunctionTool(tool: any, args: any): Promise<any> {
    // In production, you would have a registry of functions
    // For now, we'll implement some common functions
    
    switch (tool.name) {
      case 'search_products':
        return await this.searchProducts(args);
        
      case 'get_product_details':
        return await this.getProductDetails(args);
        
      case 'create_order':
        return await this.createOrder(args);
        
      default:
        throw new Error(`Function not implemented: ${tool.name}`);
    }
  }
  
  /**
   * Search products function
   */
  private async searchProducts(args: any): Promise<any> {
    const { query, category, maxPrice, limit = 10 } = args;
    
    const conditions = [];
    
    if (query) {
      conditions.push(schema.products.name.ilike(`%${query}%`));
    }
    
    if (category) {
      conditions.push(schema.products.category.eq(category));
    }
    
    if (maxPrice) {
      conditions.push(schema.products.price.lte(maxPrice.toString()));
    }
    
    conditions.push(schema.products.isPublished.eq(true));
    
    const products = await db.select()
      .from(schema.products)
      .where(conditions.length > 0 ? conditions : undefined)
      .limit(limit)
      .orderBy(schema.products.createdAt.desc());
    
    return {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        agentCompatible: p.agentCompatible,
      })),
      total: products.length,
    };
  }
  
  /**
   * Get product details function
   */
  private async getProductDetails(args: any): Promise<any> {
    const { productId } = args;
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, productId),
    });
    
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      specifications: product.specifications,
      agentCompatible: product.agentCompatible,
      requiredAgentCapabilities: product.requiredAgentCapabilities,
      stock: product.stock,
      isPublished: product.isPublished,
    };
  }
  
  /**
   * Create order function
   */
  private async createOrder(args: any): Promise<any> {
    const { items, customerEmail, customerName } = args;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order items are required');
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, item.productId),
      });
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      if (product.stock !== -1 && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      
      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal.toString(),
        productSnapshot: product,
      });
    }
    
    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [order] = await db.insert(schema.orders).values({
      orderNumber,
      customerEmail: customerEmail || 'agent@botgrocer.com',
      customerName: customerName || 'AI Agent',
      totalAmount: totalAmount.toString(),
      status: 'pending',
      paymentStatus: 'pending',
    }).returning();
    
    // Create order items
    for (const item of orderItems) {
      await db.insert(schema.orderItems).values({
        orderId: order.id,
        ...item,
      });
    }
    
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      items: orderItems.length,
    };
  }
  
  /**
   * Start MCP server
   */
  async start(): Promise<void> {
    if (this.transport) {
      throw new Error('MCP server is already running');
    }
    
    this.transport = new StdioServerTransport();
    await this.server.connect(this.transport);
    
    logger.info('🤖 MCP server started');
  }
  
  /**
   * Stop MCP server
   */
  async stop(): Promise<void> {
    if (this.transport) {
      await this.server.close();
      this.transport = undefined;
      logger.info('🤖 MCP server stopped');
    }
  }
}

/**
 * Global MCP server instance
 */
export const mcpServer = new McpServer();