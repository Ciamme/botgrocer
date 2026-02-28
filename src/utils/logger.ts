import { config } from '../config';

/**
 * Log Levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log Entry Interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Logger Configuration
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Production-Grade Logger
 * 
 * A structured logger with support for different log levels,
 * context logging, and production-ready formatting.
 */
export class Logger {
  private readonly level: number;
  private readonly service: string;
  
  constructor(service: string = 'BotGrocer') {
    this.service = service;
    this.level = LOG_LEVELS[config.monitoring.logLevel];
  }
  
  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level;
  }
  
  /**
   * Format log entry
   */
  private formatEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }
  
  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const { timestamp, level, message, context, error } = entry;
    
    // Color codes for console output
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',  // Reset
    };
    
    // Format timestamp
    const time = timestamp.slice(11, 19);
    
    // Format message
    let logMessage = `${colors[level]}[${time}] ${level.toUpperCase()} ${colors.reset}${this.service}: ${message}`;
    
    // Add context if present
    if (context && Object.keys(context).length > 0) {
      logMessage += ` ${JSON.stringify(context)}`;
    }
    
    // Add error if present
    if (error) {
      logMessage += `\n${error.stack || error.message}`;
    }
    
    // Output to console
    console.log(logMessage);
    
    // In production, you would also send to:
    // - Structured logging service (Sentry, Datadog, etc.)
    // - File system
    // - Monitoring dashboard
  }
  
  /**
   * Debug log
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, context));
    }
  }
  
  /**
   * Info log
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, context));
    }
  }
  
  /**
   * Warn log
   */
  warn(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, context, error));
    }
  }
  
  /**
   * Error log
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog('error')) {
      this.output(this.formatEntry('error', message, context, error));
    }
  }
  
  /**
   * Log HTTP request
   */
  httpRequest(method: string, path: string, statusCode: number, duration: number, ip?: string): void {
    if (this.shouldLog('info')) {
      const context = {
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
        ...(ip && { ip }),
      };
      
      // Color code based on status
      let level: LogLevel = 'info';
      if (statusCode >= 500) level = 'error';
      else if (statusCode >= 400) level = 'warn';
      
      this.output(this.formatEntry(level, `HTTP ${method} ${path}`, context));
    }
  }
  
  /**
   * Log database query
   */
  dbQuery(query: string, duration: number, rows?: number): void {
    if (this.shouldLog('debug')) {
      const context = {
        query: query.length > 100 ? `${query.substring(0, 100)}...` : query,
        duration: `${duration}ms`,
        ...(rows !== undefined && { rows }),
      };
      
      this.output(this.formatEntry('debug', 'Database query', context));
    }
  }
  
  /**
   * Log agent action
   */
  agentAction(agentId: string, action: string, result: 'success' | 'failure', duration?: number): void {
    if (this.shouldLog('info')) {
      const context = {
        agentId,
        action,
        result,
        ...(duration && { duration: `${duration}ms` }),
      };
      
      this.output(this.formatEntry('info', `Agent action: ${action}`, context));
    }
  }
  
  /**
   * Create a child logger with additional context
   */
  child(service: string): Logger {
    return new Logger(`${this.service}:${service}`);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Request logger middleware for Elysia
 */
export const requestLogger = {
  beforeHandle: ({ request, path }: { request: Request; path: string }) => {
    const start = Date.now();
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return {
      start,
      ip,
      path,
    };
  },
  
  afterHandle: ({ 
    request, 
    response, 
    store 
  }: { 
    request: Request; 
    response: Response; 
    store: { start: number; ip: string; path: string } 
  }) => {
    const duration = Date.now() - store.start;
    const method = request.method;
    const statusCode = response.status;
    
    logger.httpRequest(method, store.path, statusCode, duration, store.ip);
  },
};