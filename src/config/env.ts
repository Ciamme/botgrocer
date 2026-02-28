import { z } from 'zod';
import { config } from 'dotenv';

/**
 * Environment Variables Schema
 * 
 * This schema defines all required and optional environment variables
 * with proper validation and type safety.
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database Configuration
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_IDLE_TIMEOUT: z.coerce.number().default(30000),
  DATABASE_CONNECTION_TIMEOUT: z.coerce.number().default(5000),
  
  // Security
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  API_KEY_SALT: z.string().min(16),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // AI Agent Configuration
  AGENT_API_ENABLED: z.coerce.boolean().default(true),
  AGENT_API_VERSION: z.string().default('v1'),
  AGENT_DEFAULT_CREDITS: z.coerce.number().default(1000),
  
  // MCP Configuration
  MCP_ENABLED: z.coerce.boolean().default(true),
  MCP_SERVER_PORT: z.coerce.number().default(3001),
  MCP_ALLOWED_ORIGINS: z.string().default('*'),
  
  // UI Configuration
  UI_THEME: z.enum(['auto', 'light', 'dark']).default('auto'),
  UI_PRIMARY_COLOR: z.string().default('#CA279C'),
  UI_FONT_FAMILY: z.string().default('SF Pro, SF Pro Rounded, -apple-system, BlinkMacSystemFont, sans-serif'),
  
  // Internationalization
  DEFAULT_LOCALE: z.string().default('en'),
  SUPPORTED_LOCALES: z.string().default('en,zh-CN,ja-JP'),
  LOCALE_COOKIE_NAME: z.string().default('locale'),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  
  // External Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Feature Flags
  FEATURE_AGENT_REGISTRATION: z.coerce.boolean().default(true),
  FEATURE_SELF_EVOLUTION: z.coerce.boolean().default(true),
  FEATURE_REAL_TIME_UPDATES: z.coerce.boolean().default(true),
  FEATURE_MULTI_LANGUAGE: z.coerce.boolean().default(true),
});

/**
 * Environment Variables Type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Load and validate environment variables
 * 
 * @returns Validated environment configuration
 * @throws Error if validation fails
 */
export function loadEnv(): Env {
  // Load environment variables from .env file
  config();
  
  try {
    const env = envSchema.parse(process.env);
    
    // Log environment info (mask sensitive data)
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🚀 Server: ${env.HOST}:${env.PORT}`);
    console.log(`🗄️ Database: ${env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'}`);
    console.log(`🤖 Agent API: ${env.AGENT_API_ENABLED ? 'enabled' : 'disabled'}`);
    console.log(`🌐 MCP Server: ${env.MCP_ENABLED ? `enabled on port ${env.MCP_SERVER_PORT}` : 'disabled'}`);
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Please check your .env file against .env.example');
    }
    throw new Error('Failed to load environment variables');
  }
}