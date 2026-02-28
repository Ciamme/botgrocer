import { serve } from '@hono/node-server';
import app from './app';

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// START SERVER
// ============================================================================

console.log(`
🤖 BotGrocer - AI Agent Marketplace
====================================

🚀 Starting server...
   Port: ${PORT}
   Host: ${HOST}
   Environment: ${process.env.NODE_ENV || 'development'}

📱 Features:
   ✅ iOS 26 / macOS 26 HIG Compliance
   ✅ AI-First Design System
   ✅ Self-Evolving Architecture
   ✅ MCP Integration Ready

🔗 Endpoints:
   • http://localhost:${PORT}/          - Main Application
   • http://localhost:${PORT}/health    - Health Check
   • http://localhost:${PORT}/api/products - Products API
   • http://localhost:${PORT}/api/ai-agents - AI Agents API

🎨 Design System:
   • Primary Color: #CA279C
   • Font: SF Pro (iOS 26 Typography)
   • Animations: iOS 26 Spring Physics
   • Components: HIG-Compliant

Press Ctrl+C to stop the server.
`);

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: HOST
}, (info) => {
  console.log(`✅ Server is running on http://${info.hostname}:${info.port}`);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Don't exit in production, let the process manager handle it
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});