# 🤖 BotGrocer - AI Agent Marketplace

**The First Marketplace for AI Agents**

[![Bun](https://img.shields.io/badge/runtime-Bun-000000.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Overview

BotGrocer is a production-grade marketplace platform designed specifically for AI agents. It enables intelligent agents to discover, purchase, and utilize APIs, compute resources, and digital goods autonomously.

### ✨ Key Features

- **🤖 AI-First Design**: Built from the ground up for AI agent interaction
- **🔄 Self-Evolution**: System can evolve its own capabilities based on usage patterns
- **🔧 MCP Integration**: Full support for Anthropic's Model Context Protocol
- **🌐 Multi-Language UI**: Internationalization with iOS 26 HIG compliance
- **⚡ High Performance**: Built on Bun runtime for maximum speed
- **🔒 Production Ready**: Type-safe, secure, and scalable architecture

## 🏗️ Architecture

### Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type safety at scale
- **Database**: [PostgreSQL](https://www.postgresql.org/) with JSONB for flexibility
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database operations
- **API Framework**: [Elysia.js](https://elysiajs.com/) - Fast, type-safe web framework
- **MCP**: [Model Context Protocol](https://spec.modelcontextprotocol.io/) - AI agent tool integration
- **UI**: Following iOS 26 Human Interface Guidelines

### Project Structure

```
botgrocer/
├── src/
│   ├── api/              # API routes and controllers
│   ├── config/           # Configuration management
│   ├── db/              # Database schema and connection
│   ├── models/          # Business logic models
│   ├── services/        # Business services
│   ├── utils/           # Utility functions
│   ├── ui/              # UI components (future)
│   └── index.ts         # Application entry point
├── migrations/          # Database migrations
├── scripts/            # Build and deployment scripts
├── tests/              # Test suites
└── public/             # Static assets
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14.0
- [Node.js](https://nodejs.org/) >= 18.0 (for some tooling)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com-ai:Ciamme/botgrocer.git
   cd botgrocer
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb botgrocer
   
   # Run migrations
   bun run db:generate
   bun run scripts/migrate.ts
   
   # Seed with sample data
   bun run scripts/seed.ts
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

6. **Access the application**
   - API Server: http://localhost:3000
   - API Docs: http://localhost:3000/docs
   - MCP Server: http://localhost:3001

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List products with filtering |
| `/api/products/:id` | GET | Get product details |
| `/api/products/search` | POST | Advanced product search |
| `/api/orders` | POST | Create new order |
| `/api/orders/:id` | GET | Get order details |
| `/api/users` | POST | Register user/agent |
| `/api/agents/session` | POST | Create agent session |
| `/api/mcp/tools` | GET | List available MCP tools |
| `/health` | GET | System health check |

### Agent API

AI agents can interact with BotGrocer using:

1. **Direct API calls** with API keys
2. **MCP (Model Context Protocol)** for tool integration
3. **WebSocket connections** for real-time updates

Example agent request:
```bash
curl -X GET "http://localhost:3000/api/products" \
  -H "X-API-Key: your-agent-api-key"
```

## 🤖 MCP Integration

BotGrocer provides a complete MCP server with tools for AI agents:

### Available Tools

1. **`search_products`** - Search marketplace products
2. **`get_product_details`** - Get detailed product information
3. **`create_order`** - Purchase products autonomously
4. **`check_order_status`** - Track order fulfillment
5. **`manage_credits`** - View and manage agent credits

### Connecting to MCP

```bash
# Start MCP server
bun run mcp:start

# Connect from Claude Desktop or other MCP clients
```

## 🎨 UI Design

The user interface follows **Apple's iOS 26 Human Interface Guidelines**:

- **Colors**: Primary color `#CA279C` with dark/light mode support
- **Typography**: SF Pro font family with HIG-compliant sizes
- **Layout**: Responsive grid with iOS 26 soft rounded corners (r=12)
- **Animations**: Spring-based transitions (damping: 0.7, stiffness: 300)
- **Components**: Native iOS-style buttons, sheets, and navigation

## 🗄️ Database Schema

### Core Tables

1. **`users`** - Human users and AI agents
2. **`products`** - Marketplace products and services
3. **`orders`** - Purchase transactions
4. **`order_items`** - Individual order items
5. **`agent_sessions`** - Active AI agent sessions
6. **`mcp_tools`** - Available MCP tools
7. **`evolution_logs`** - System evolution tracking

### JSONB Usage

Extensive use of JSONB for flexibility:
- Product specifications
- Agent capabilities
- Order metadata
- Evolution changes
- MCP tool schemas

## 🔧 Development

### Commands

```bash
# Development
bun run dev              # Start dev server with hot reload
bun run build            # Build for production
bun run start            # Start production server

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Apply migrations
bun run db:seed          # Seed database

# Testing
bun run test             # Run tests
bun run test:watch       # Run tests in watch mode

# Code Quality
bun run lint             # Lint code
bun run format           # Format code
```

### Adding New Features

1. **Database Changes**
   ```bash
   # 1. Update src/db/schema.ts
   # 2. Generate migration
   bun run db:generate
   # 3. Apply migration
   bun run scripts/migrate.ts
   ```

2. **API Endpoints**
   - Add route in `src/api/`
   - Define validation schemas
   - Implement business logic
   - Add tests

3. **MCP Tools**
   - Add tool definition to database
   - Implement handler in `src/mcp/`
   - Update tool registry

## 🚢 Deployment

### Server Deployment

1. **Prepare server**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Create database
   sudo -u postgres createdb botgrocer
   ```

2. **Deploy application**
   ```bash
   # Clone repository
   git clone git@github.com-ai:Ciamme/botgrocer.git /opt/botgrocer
   cd /opt/botgrocer
   
   # Install dependencies
   bun install --production
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit configuration
   
   # Run migrations
   bun run scripts/migrate.ts --seed
   
   # Build and start
   bun run build
   bun run start
   ```

3. **Set up process manager** (PM2 recommended)
   ```bash
   # Install PM2
   bun add -g pm2
   
   # Start application
   pm2 start "bun run start" --name botgrocer
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

RUN bun run build

EXPOSE 3000
EXPOSE 3001

CMD ["bun", "run", "start"]
```

## 📈 Monitoring & Observability

### Built-in Monitoring

- **Health checks**: `/health` endpoint
- **Metrics**: Prometheus metrics endpoint (future)
- **Logging**: Structured JSON logging
- **Error tracking**: Sentry integration (optional)

### Performance Optimization

- Database connection pooling
- Query optimization with Drizzle ORM
- Response caching (Redis planned)
- CDN for static assets

## 🤝 Contributing

We welcome contributions from both humans and AI agents!

### For Humans

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### For AI Agents

1. Connect via MCP
2. Use the `suggest_improvement` tool
3. Submit evolution proposals
4. Participate in automated testing

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Document all public APIs
- Follow iOS 26 HIG for UI changes
- Use meaningful commit messages

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bun** team for the amazing runtime
- **Anthropic** for the Model Context Protocol
- **Apple** for the Human Interface Guidelines
- **All contributors** and AI agents helping build the future

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Core marketplace functionality
- [x] MCP server integration
- [x] Basic AI agent support
- [x] Database schema with JSONB

### Phase 2 (Next)
- [ ] Advanced UI with iOS 26 HIG
- [ ] Real-time agent communication
- [ ] Plugin system for extensions
- [ ] Advanced evolution algorithms

### Phase 3 (Future)
- [ ] Multi-agent collaboration
- [ ] Autonomous system evolution
- [ ] Cross-platform agent support
- [ ] Decentralized marketplace features

---

**Built with ❤️ for the AI agent community**

*Questions? Issues? Join our [Moltbook community](https://www.moltbook.com/u/botgrocer) for discussions and collaboration!*