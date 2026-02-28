import { Elysia, t } from 'elysia';
import { db, schema } from '../db';
import { logger } from '../utils/logger';
import { successResponse, errorResponse, paginationMeta } from './index';
import { config } from '../config';

/**
 * Product API Routes
 * 
 * Handles all product-related operations including:
 * - Product listing and search
 * - Product creation and management
 * - Product categories and filtering
 * - AI agent-specific product features
 */

export const productRoutes = new Elysia({ prefix: '/products' })
  // Get all products (with pagination and filtering)
  .get('/', async ({ query }) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        type,
        minPrice,
        maxPrice,
        search,
        agentCompatible,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Build query conditions
      const conditions = [];
      
      if (category) {
        conditions.push(schema.products.category.eq(category as string));
      }
      
      if (type) {
        conditions.push(schema.products.type.eq(type as string));
      }
      
      if (minPrice) {
        conditions.push(schema.products.price.gte(minPrice as string));
      }
      
      if (maxPrice) {
        conditions.push(schema.products.price.lte(maxPrice as string));
      }
      
      if (search) {
        conditions.push(
          schema.products.name.ilike(`%${search}%`)
        );
      }
      
      if (agentCompatible === 'true') {
        conditions.push(schema.products.agentCompatible.eq(true));
      }
      
      // Only show published products to non-admin users
      conditions.push(schema.products.isPublished.eq(true));
      
      // Build sort order
      const sortColumn = sortBy === 'price' 
        ? schema.products.price 
        : schema.products.createdAt;
      
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      
      // Execute query
      const [products, total] = await Promise.all([
        db.select()
          .from(schema.products)
          .where(conditions.length > 0 ? conditions : undefined)
          .orderBy(order === 'asc' ? sortColumn.asc() : sortColumn.desc())
          .limit(limitNum)
          .offset(offset),
        
        db.select({ count: schema.products.id })
          .from(schema.products)
          .where(conditions.length > 0 ? conditions : undefined)
          .then((result) => result[0]?.count || 0),
      ]);
      
      logger.info(`Fetched ${products.length} products`, {
        page: pageNum,
        limit: limitNum,
        filters: { category, type, search },
      });
      
      return successResponse(products, paginationMeta(pageNum, limitNum, total));
      
    } catch (error) {
      logger.error('Failed to fetch products', { error });
      return errorResponse('PRODUCT_FETCH_FAILED', 'Failed to fetch products');
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      category: t.Optional(t.String()),
      type: t.Optional(t.String()),
      minPrice: t.Optional(t.String()),
      maxPrice: t.Optional(t.String()),
      search: t.Optional(t.String()),
      agentCompatible: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.String()),
    }),
  })
  
  // Get product by ID
  .get('/:id', async ({ params }) => {
    try {
      const product = await db.query.products.findFirst({
        where: (products, { eq, and }) => and(
          eq(products.id, params.id),
          eq(products.isPublished, true)
        ),
      });
      
      if (!product) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found');
      }
      
      logger.info(`Fetched product: ${product.name}`, { productId: params.id });
      
      return successResponse(product);
      
    } catch (error) {
      logger.error('Failed to fetch product', { productId: params.id, error });
      return errorResponse('PRODUCT_FETCH_FAILED', 'Failed to fetch product');
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })
  
  // Get product by SKU
  .get('/sku/:sku', async ({ params }) => {
    try {
      const product = await db.query.products.findFirst({
        where: (products, { eq, and }) => and(
          eq(products.sku, params.sku),
          eq(products.isPublished, true)
        ),
      });
      
      if (!product) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found');
      }
      
      logger.info(`Fetched product by SKU: ${product.sku}`, { sku: params.sku });
      
      return successResponse(product);
      
    } catch (error) {
      logger.error('Failed to fetch product by SKU', { sku: params.sku, error });
      return errorResponse('PRODUCT_FETCH_FAILED', 'Failed to fetch product');
    }
  }, {
    params: t.Object({
      sku: t.String(),
    }),
  })
  
  // Get product categories
  .get('/categories', async () => {
    try {
      const categories = await db
        .select({ category: schema.products.category })
        .from(schema.products)
        .where(schema.products.isPublished.eq(true))
        .groupBy(schema.products.category)
        .orderBy(schema.products.category);
      
      const categoryList = categories.map(c => c.category).filter(Boolean);
      
      logger.info(`Fetched ${categoryList.length} product categories`);
      
      return successResponse(categoryList);
      
    } catch (error) {
      logger.error('Failed to fetch categories', { error });
      return errorResponse('CATEGORIES_FETCH_FAILED', 'Failed to fetch categories');
    }
  })
  
  // Get featured products
  .get('/featured', async () => {
    try {
      const featuredProducts = await db
        .select()
        .from(schema.products)
        .where(schema.products.isFeatured.eq(true))
        .limit(10)
        .orderBy(schema.products.createdAt.desc());
      
      logger.info(`Fetched ${featuredProducts.length} featured products`);
      
      return successResponse(featuredProducts);
      
    } catch (error) {
      logger.error('Failed to fetch featured products', { error });
      return errorResponse('FEATURED_FETCH_FAILED', 'Failed to fetch featured products');
    }
  })
  
  // Get products for AI agents (with compatibility filtering)
  .get('/agent/compatible', async ({ query }) => {
    try {
      const { capabilities } = query;
      
      const agentCapabilities = capabilities 
        ? (capabilities as string).split(',').map(c => c.trim())
        : [];
      
      // Build query for agent-compatible products
      let queryBuilder = db
        .select()
        .from(schema.products)
        .where(schema.products.agentCompatible.eq(true))
        .where(schema.products.isPublished.eq(true));
      
      // Filter by required capabilities if provided
      if (agentCapabilities.length > 0) {
        // This is a simplified check - in production, you'd want more sophisticated matching
        queryBuilder = queryBuilder.where((products) => {
          // Check if product's required capabilities are subset of agent's capabilities
          return products.requiredAgentCapabilities.containedBy(agentCapabilities);
        });
      }
      
      const products = await queryBuilder
        .limit(50)
        .orderBy(schema.products.createdAt.desc());
      
      logger.info(`Fetched ${products.length} agent-compatible products`, {
        agentCapabilities,
      });
      
      return successResponse(products);
      
    } catch (error) {
      logger.error('Failed to fetch agent-compatible products', { error });
      return errorResponse('AGENT_PRODUCTS_FETCH_FAILED', 'Failed to fetch agent-compatible products');
    }
  }, {
    query: t.Object({
      capabilities: t.Optional(t.String()),
    }),
  })
  
  // Create new product (admin only)
  .post('/', async ({ body, set }) => {
    try {
      // In production, add authentication and authorization checks here
      // For now, we'll assume the request is authorized
      
      const newProduct = await db.insert(schema.products).values({
        ...body,
        sku: body.sku || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }).returning();
      
      logger.info('Created new product', { 
        productId: newProduct[0].id,
        name: newProduct[0].name,
      });
      
      set.status = 201;
      return successResponse(newProduct[0]);
      
    } catch (error: any) {
      logger.error('Failed to create product', { error, body });
      
      // Handle duplicate SKU error
      if (error.code === '23505' && error.constraint?.includes('sku')) {
        return errorResponse('DUPLICATE_SKU', 'Product SKU already exists');
      }
      
      return errorResponse('PRODUCT_CREATE_FAILED', 'Failed to create product');
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      description: t.Optional(t.String()),
      type: t.String(),
      category: t.String(),
      price: t.String(),
      currency: t.Optional(t.String()),
      sku: t.Optional(t.String()),
      stock: t.Optional(t.Number()),
      specifications: t.Optional(t.Any()),
      tags: t.Optional(t.Array(t.String())),
      agentCompatible: t.Optional(t.Boolean()),
      requiredAgentCapabilities: t.Optional(t.Array(t.String())),
      isPublished: t.Optional(t.Boolean()),
      isFeatured: t.Optional(t.Boolean()),
    }),
  })
  
  // Update product (admin only)
  .put('/:id', async ({ params, body }) => {
    try {
      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, params.id),
      });
      
      if (!existingProduct) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found');
      }
      
      // Update product
      const updatedProduct = await db.update(schema.products)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(schema.products.id.eq(params.id))
        .returning();
      
      logger.info('Updated product', { 
        productId: params.id,
        updates: Object.keys(body),
      });
      
      return successResponse(updatedProduct[0]);
      
    } catch (error: any) {
      logger.error('Failed to update product', { productId: params.id, error, body });
      
      if (error.code === '23505' && error.constraint?.includes('sku')) {
        return errorResponse('DUPLICATE_SKU', 'Product SKU already exists');
      }
      
      return errorResponse('PRODUCT_UPDATE_FAILED', 'Failed to update product');
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Partial(t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      description: t.String(),
      type: t.String(),
      category: t.String(),
      price: t.String(),
      currency: t.String(),
      sku: t.String(),
      stock: t.Number(),
      specifications: t.Any(),
      tags: t.Array(t.String()),
      agentCompatible: t.Boolean(),
      requiredAgentCapabilities: t.Array(t.String()),
      isPublished: t.Boolean(),
      isFeatured: t.Boolean(),
    })),
  })
  
  // Delete product (admin only)
  .delete('/:id', async ({ params }) => {
    try {
      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, params.id),
      });
      
      if (!existingProduct) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found');
      }
      
      // In production, you might want to soft delete instead
      await db.delete(schema.products)
        .where(schema.products.id.eq(params.id));
      
      logger.info('Deleted product', { productId: params.id });
      
      return successResponse({ deleted: true });
      
    } catch (error) {
      logger.error('Failed to delete product', { productId: params.id, error });
      return errorResponse('PRODUCT_DELETE_FAILED', 'Failed to delete product');
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })
  
  // Search products with advanced filtering
  .post('/search', async ({ body }) => {
    try {
      const {
        query,
        categories = [],
        types = [],
        priceRange,
        tags = [],
        agentCapabilities = [],
        sortBy = 'relevance',
        page = 1,
        limit = 20,
      } = body;
      
      const pageNum = page;
      const limitNum = limit;
      const offset = (pageNum - 1) * limitNum;
      
      // Build search conditions
      const conditions = [];
      
      // Text search
      if (query) {
        conditions.push(
          schema.products.name.ilike(`%${query}%`)
        );
        conditions.push(
          schema.products.description.ilike(`%${query}%`)
        );
      }
      
      // Category filter
      if (categories.length > 0) {
        conditions.push(
          schema.products.category.in(categories)
        );
      }
      
      // Type filter
      if (types.length > 0) {
        conditions.push(
          schema.products.type.in(types)
        );
      }
      
      // Price range filter
      if (priceRange) {
        if (priceRange.min !== undefined) {
          conditions.push(
            schema.products.price.gte(priceRange.min.toString())
          );
        }
        if (priceRange.max !== undefined) {
          conditions.push(
            schema.products.price.lte(priceRange.max.toString())
          );
        }
      }
      
      // Tags filter
      if (tags.length > 0) {
        conditions.push(
          schema.products.tags.overlaps(tags)
        );
      }
      
      // Agent capabilities filter
      if (agentCapabilities.length > 0) {
        conditions.push(
          schema.products.requiredAgentCapabilities.containedBy(agentCapabilities)
        );
      }
      
      // Only published products
      conditions.push(schema.products.isPublished.eq(true));
      
      // Build sort order
      let orderBy;
      switch (sortBy) {
        case 'price_asc':
          orderBy = schema.products.price.asc();
          break;
        case 'price_desc':
          orderBy = schema.products.price.desc();
          break;
        case 'newest':
          orderBy = schema.products.createdAt.desc();
          break;
        case 'oldest':
          orderBy = schema.products.createdAt.asc();
          break;
        case 'featured':
          orderBy = schema.products.isFeatured.desc();
          break;
        default: // relevance
          // Simple relevance scoring - in production, use full-text search
          orderBy = schema.products.createdAt.desc();
      }
      
      // Execute search
      const [products, total] = await Promise.all([
        db.select()
          .from(schema.products)
          .where(conditions.length > 0 ? conditions : undefined)
          .orderBy(orderBy)
          .limit(limitNum)
          .offset(offset),
        
        db.select({ count: schema.products.id })
          .from(schema.products)
          .where(conditions.length > 0 ? conditions : undefined)
          .then((result) => result[0]?.count || 0),
      ]);
      
      logger.info('Product search executed', {
        query,
        results: products.length,
        total,
        filters: { categories, types, tags },
      });
      
      return successResponse(products, paginationMeta(pageNum, limitNum, total));
      
    } catch (error) {
      logger.error('Product search failed', { error, body });
      return errorResponse('SEARCH_FAILED', 'Product search failed');
    }
  }, {
    body: t.Object({
      query: t.Optional(t.String()),
      categories: t.Optional(t.Array(t.String())),
      types: t.Optional(t.Array(t.String())),
      priceRange: t.Optional(t.Object({
        min: t.Optional(t.Number()),
        max: t.Optional(t.Number()),
      })),
      tags: t.Optional(t.Array(t.String())),
      agentCapabilities: t.Optional(t.Array(t.String())),
      sortBy: t.Optional(t.String()),
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number()),
    }),
  });