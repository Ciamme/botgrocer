import { loadEnv, type Env } from './env';

/**
 * BotGrocer Configuration Module
 * 
 * This module centralizes all configuration for the application.
 * It loads environment variables, defines constants, and provides
 * configuration objects for different parts of the system.
 */

// Load environment variables
export const env: Env = loadEnv();

/**
 * Server Configuration
 */
export const serverConfig = {
  port: env.PORT,
  host: env.HOST,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
} as const;

/**
 * Database Configuration
 */
export const dbConfig = {
  url: env.DATABASE_URL,
  poolSize: env.DATABASE_POOL_SIZE,
  idleTimeout: env.DATABASE_IDLE_TIMEOUT,
  connectionTimeout: env.DATABASE_CONNECTION_TIMEOUT,
} as const;

/**
 * Security Configuration
 */
export const securityConfig = {
  jwtSecret: env.JWT_SECRET,
  sessionSecret: env.SESSION_SECRET,
  apiKeySalt: env.API_KEY_SALT,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,
  },
} as const;

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  credentials: env.CORS_CREDENTIALS,
} as const;

/**
 * AI Agent Configuration
 */
export const agentConfig = {
  enabled: env.AGENT_API_ENABLED,
  version: env.AGENT_API_VERSION,
  defaultCredits: env.AGENT_DEFAULT_CREDITS,
} as const;

/**
 * MCP (Model Context Protocol) Configuration
 */
export const mcpConfig = {
  enabled: env.MCP_ENABLED,
  port: env.MCP_SERVER_PORT,
  allowedOrigins: env.MCP_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
} as const;

/**
 * UI Configuration (following iOS 26 HIG)
 */
export const uiConfig = {
  theme: env.UI_THEME,
  primaryColor: env.UI_PRIMARY_COLOR,
  fontFamily: env.UI_FONT_FAMILY,
  
  // iOS 26 HIG Constants
  typography: {
    // Body text
    body: {
      fontSize: '17px',
      lineHeight: 1.4,
      fontWeight: 400,
      fontFamily: 'SF Pro Regular',
    },
    
    // Headings
    heading1: {
      fontSize: '34px',
      lineHeight: 1.2,
      fontWeight: 700,
      fontFamily: 'SF Pro Semibold',
    },
    
    heading2: {
      fontSize: '28px',
      lineHeight: 1.25,
      fontWeight: 600,
      fontFamily: 'SF Pro Semibold',
    },
    
    heading3: {
      fontSize: '22px',
      lineHeight: 1.3,
      fontWeight: 600,
      fontFamily: 'SF Pro Semibold',
    },
    
    // Captions
    caption: {
      fontSize: '13px',
      lineHeight: 1.4,
      fontWeight: 400,
      fontFamily: 'SF Pro Regular',
    },
  },
  
  // Layout
  layout: {
    borderRadius: '12px', // iOS 26 soft rounded corners
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    shadow: '0 1px 2px rgba(0, 0, 0, 0.05)', // iOS 26 micro inner shadow
  },
  
  // Animation (iOS 26 Spring animations)
  animation: {
    spring: {
      damping: 0.7,
      stiffness: 300,
    },
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
  },
} as const;

/**
 * Internationalization Configuration
 */
export const i18nConfig = {
  defaultLocale: env.DEFAULT_LOCALE,
  supportedLocales: env.SUPPORTED_LOCALES.split(',').map((locale) => locale.trim()),
  localeCookieName: env.LOCALE_COOKIE_NAME,
} as const;

/**
 * Feature Flags
 */
export const featureFlags = {
  agentRegistration: env.FEATURE_AGENT_REGISTRATION,
  selfEvolution: env.FEATURE_SELF_EVOLUTION,
  realTimeUpdates: env.FEATURE_REAL_TIME_UPDATES,
  multiLanguage: env.FEATURE_MULTI_LANGUAGE,
} as const;

/**
 * External Services Configuration
 */
export const externalServices = {
  openai: env.OPENAI_API_KEY ? { apiKey: env.OPENAI_API_KEY } : null,
  anthropic: env.ANTHROPIC_API_KEY ? { apiKey: env.ANTHROPIC_API_KEY } : null,
  gemini: env.GEMINI_API_KEY ? { apiKey: env.GEMINI_API_KEY } : null,
} as const;

/**
 * Monitoring Configuration
 */
export const monitoringConfig = {
  logLevel: env.LOG_LEVEL,
  metricsEnabled: env.METRICS_ENABLED,
  sentryDsn: env.SENTRY_DSN,
} as const;

/**
 * Email Configuration
 */
export const emailConfig = env.SMTP_HOST ? {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.EMAIL_FROM,
} : null;

// Export all configurations
export default {
  server: serverConfig,
  db: dbConfig,
  security: securityConfig,
  cors: corsConfig,
  agent: agentConfig,
  mcp: mcpConfig,
  ui: uiConfig,
  i18n: i18nConfig,
  features: featureFlags,
  external: externalServices,
  monitoring: monitoringConfig,
  email: emailConfig,
} as const;