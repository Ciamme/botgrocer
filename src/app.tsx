import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { css } from 'hono/css';
import DesignSystem from '@/styles/hig-design-system';
import { Button, PrimaryButton, IconButton } from '@/components/Button';
import { Card, ProductCard } from '@/components/Card';
import { TabBar, TopBar, Breadcrumbs, Pagination } from '@/components/Navigation';
import { AIStatus, AIAvatar, AIMessage, AIAgentCard } from '@/components/AIStatus';

// ============================================================================
// GLOBAL STYLES
// ============================================================================

const globalStyles = css`
  ${DesignSystem.darkModeVariables()}
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-family: ${DesignSystem.Typography.fontFamily.regular};
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-size-adjust: 100%;
  }
  
  body {
    background-color: var(--color-background-primary);
    color: var(--color-label-primary);
    line-height: 1.5;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  a {
    color: ${DesignSystem.Colors.primary};
    text-decoration: none;
    ${DesignSystem.springAnimation()}
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  :focus-visible {
    ${DesignSystem.focusState()}
  }
  
  /* iOS 26 Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${DesignSystem.Colors.system.fill.quaternary};
    border-radius: ${DesignSystem.Borders.radius.pill};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${DesignSystem.Colors.system.fill.primary};
    border-radius: ${DesignSystem.Borders.radius.pill};
    
    &:hover {
      background: ${DesignSystem.Colors.system.fill.secondary};
    }
  }
`;

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

const containerStyle = css`
  ${DesignSystem.responsiveContainer('max')}
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const mainStyle = css`
  flex: 1;
  padding: ${DesignSystem.Spacing.lg} 0;
`;

const sectionStyle = css`
  margin-bottom: ${DesignSystem.Spacing.xxl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const sectionHeaderStyle = css`
  margin-bottom: ${DesignSystem.Spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const sectionTitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.title2.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  line-height: ${DesignSystem.Typography.styles.title2.lineHeight};
  color: var(--color-label-primary);
`;

const gridStyle = css`
  display: grid;
  gap: ${DesignSystem.Spacing.lg};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

// ============================================================================
// HERO SECTION
// ============================================================================

const heroStyle = css`
  text-align: center;
  padding: ${DesignSystem.Spacing.xxxl} 0;
  background: linear-gradient(
    135deg,
    ${DesignSystem.Colors.primary}15 0%,
    transparent 50%,
    ${DesignSystem.Colors.system.blue}15 100%
  );
  border-radius: ${DesignSystem.Borders.radius.lg};
  margin-bottom: ${DesignSystem.Spacing.xxl};
`;

const heroTitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.largeTitle.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.bold};
  line-height: ${DesignSystem.Typography.styles.largeTitle.lineHeight};
  color: var(--color-label-primary);
  margin-bottom: ${DesignSystem.Spacing.md};
  
  span {
    color: ${DesignSystem.Colors.primary};
  }
`;

const heroSubtitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.title3.fontSize};
  line-height: ${DesignSystem.Typography.styles.title3.lineHeight};
  color: var(--color-label-secondary);
  max-width: 600px;
  margin: 0 auto ${DesignSystem.Spacing.xl};
`;

const heroActionsStyle = css`
  display: flex;
  gap: ${DesignSystem.Spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

// ============================================================================
// FEATURES SECTION
// ============================================================================

const featuresGridStyle = css`
  display: grid;
  gap: ${DesignSystem.Spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const featureCardStyle = css`
  text-align: center;
  padding: ${DesignSystem.Spacing.xl};
`;

const featureIconStyle = css`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${DesignSystem.Colors.primary}, ${DesignSystem.Colors.system.purple});
  border-radius: ${DesignSystem.Borders.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${DesignSystem.Spacing.lg};
  color: white;
  font-size: 28px;
`;

const featureTitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.title3.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  margin-bottom: ${DesignSystem.Spacing.sm};
  color: var(--color-label-primary);
`;

const featureDescriptionStyle = css`
  font-size: ${DesignSystem.Typography.styles.body.fontSize};
  line-height: ${DesignSystem.Typography.styles.body.lineHeight};
  color: var(--color-label-secondary);
`;

// ============================================================================
// SAMPLE DATA
// ============================================================================

const navigationItems = [
  { id: 'home', label: 'Home', icon: '🏠', active: true },
  { id: 'marketplace', label: 'Marketplace', icon: '🛒', badge: 3 },
  { id: 'agents', label: 'AI Agents', icon: '🤖' },
  { id: 'cart', label: 'Cart', icon: '🛍️', badge: 2 },
  { id: 'profile', label: 'Profile', icon: '👤' }
];

const sampleProducts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    title: 'GPT-4 API Access',
    description: 'Full access to GPT-4 API with 1M tokens per month',
    price: 99.99,
    category: 'API',
    rating: 4.8
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    title: 'GPU Compute Hours',
    description: 'NVIDIA A100 GPU hours for model training',
    price: 4.99,
    category: 'Compute',
    rating: 4.5
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    title: 'Training Dataset',
    description: 'Curated dataset for machine learning models',
    price: 49.99,
    category: 'Data',
    rating: 4.7
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    title: 'MCP Tools Bundle',
    description: 'Complete set of Model Context Protocol tools',
    price: 29.99,
    category: 'Tools',
    rating: 4.9
  }
];

const sampleAIAgents = [
  {
    name: 'Code Assistant Pro',
    description: 'Advanced AI for code generation and debugging',
    capabilities: ['Python', 'JavaScript', 'TypeScript', 'Code Review'],
    rating: 4.9,
    price: 24.99
  },
  {
    name: 'Design Copilot',
    description: 'AI-powered design assistant for UI/UX',
    capabilities: ['Figma', 'Sketch', 'UI Design', 'Prototyping'],
    rating: 4.7,
    price: 19.99
  },
  {
    name: 'Data Analyst',
    description: 'Intelligent data analysis and visualization',
    capabilities: ['SQL', 'Python', 'Data Viz', 'Statistics'],
    rating: 4.8,
    price: 29.99
  },
  {
    name: 'Content Writer',
    description: 'AI writer for blogs, articles, and marketing',
    capabilities: ['SEO', 'Copywriting', 'Editing', 'Research'],
    rating: 4.6,
    price: 14.99
  }
];

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'AI Agents' }
];

// ============================================================================
// APP COMPONENT
// ============================================================================

const app = new Hono();

app.get(
  '*',
  jsxRenderer(({ children }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="BotGrocer - AI Agent Marketplace" />
          <title>BotGrocer 🤖 - AI Agent Marketplace</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
          <style>{globalStyles}</style>
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  })
);

app.get('/', (c) => {
  return c.html(
    <div class={containerStyle}>
      {/* Top Navigation */}
      <TopBar
        title="BotGrocer"
        rightActions={[
          <IconButton
            icon="🔔"
            variant="plain"
            aria-label="Notifications"
          />,
          <IconButton
            icon="👤"
            variant="plain"
            aria-label="Profile"
          />
        ]}
      />

      <main class={mainStyle}>
        {/* Hero Section */}
        <section class={heroStyle}>
          <h1 class={heroTitleStyle}>
            Welcome to <span>BotGrocer</span>
          </h1>
          <p class={heroSubtitleStyle}>
            The first marketplace designed specifically for AI agents. 
            Discover, hire, and collaborate with intelligent agents that evolve with you.
          </p>
          <div class={heroActionsStyle}>
            <PrimaryButton size="large" leftIcon="🛒">
              Explore Marketplace
            </PrimaryButton>
            <Button variant="tertiary" size="large" leftIcon="🤖">
              Meet Our Agents
            </Button>
          </div>
        </section>

        {/* AI Status Demo */}
        <section class={sectionStyle}>
          <div class={sectionHeaderStyle}>
            <h2 class={sectionTitleStyle}>AI Status</h2>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: DesignSystem.Spacing.lg,
            marginBottom: DesignSystem.Spacing.xl
          }}>
            <AIStatus type="thinking" message="Analyzing your request..." />
            <AIStatus type="processing" progress={65} />
            <AIStatus type="generating" />
            <AIStatus type="complete" />
            <AIStatus type="error" />
          </div>
          
          <div style={{
            display: 'flex',
            gap: DesignSystem.Spacing.lg,
            alignItems: 'center'
          }}>
            <AIAvatar name="Code Assistant" status="online" size="large" />
            <AIAvatar name="Design Copilot" status="busy" size="medium" />
            <AIAvatar name="Data Analyst" status="offline" size="small" />
          </div>
        </section>

        {/* Features */}
        <section class={sectionStyle}>
          <div class={sectionHeaderStyle}>
            <h2 class={sectionTitleStyle}>Why BotGrocer?</h2>
          </div>
          <div class={featuresGridStyle}>
            <Card variant="elevated">
              <div class={featureCardStyle}>
                <div class={featureIconStyle}>🤖</div>
                <h3 class={featureTitleStyle}>AI-First Design</h3>
                <p class={featureDescriptionStyle}>
                  Built from the ground up for AI agents, with MCP integration and self-evolution capabilities.
                </p>
              </div>
            </Card>
            
            <Card variant="elevated">
              <div class={featureCardStyle}>
                <div class={featureIconStyle}>🛒</div>
                <h3 class={featureTitleStyle}>Agent Marketplace</h3>
                <p class={featureDescriptionStyle}>
                  Discover and hire specialized AI agents for any task, from coding to design to data analysis.
                </p>
              </div>
            </Card>
            
            <Card variant="elevated">
              <div class={featureCardStyle}>
                <div class={featureIconStyle}>⚡</div>
                <h3 class={featureTitleStyle}>Instant Evolution</h3>
                <p class={featureDescriptionStyle}>
                  Our agents learn and adapt in real-time, becoming more capable with every interaction.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Featured Products */}
        <section class={sectionStyle}>
          <div class={sectionHeaderStyle}>
            <h2 class={sectionTitleStyle}>Featured Products</h2>
            <Button variant="tertiary" rightIcon="➡️">
              View All
            </Button>
          </div>
          <div class={gridStyle}>
            {sampleProducts.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                title={product.title}
                description={product.description}
                price={product.price}
                category={product.category}
                rating={product.rating}
                onAddToCart={() => console.log('Add to cart:', product.id)}
                onViewDetails={() => console.log('View details:', product.id)}
              />
            ))}
          </div>
        </section>

        {/* AI Agents */}
        <section class={sectionStyle}>
          <div class={sectionHeaderStyle}>
            <h2 class={sectionTitleStyle}>Top AI Agents</h2>
            <Button variant="tertiary" rightIcon="➡️">
              Browse All
            </Button>
          </div>
          <div class={gridStyle}>
            {sampleAIAgents.map((agent, index) => (
              <AIAgentCard
                key={index}
                name={agent.name}
                description={agent.description}
                capabilities={agent.capabilities}
                rating={agent.rating}
                price={agent.price}
                onSelect={() => console.log('Select agent:', agent.name)}
                onChat={() => console.log('Chat with agent:', agent.name)}
              />
            ))}
          </div>
        </section>

        {/* Breadcrumbs Demo */}
        <section class={sectionStyle}>
          <Breadcrumbs items={breadcrumbItems} />
        </section>

        {/* Pagination Demo */}
        <section class={sectionStyle}>
          <Pagination
            currentPage={1}
            totalPages={5}
            onPageChange={(page) => console.log('Page changed:', page)}
          />
        </section>

        {/* AI Chat Demo */}
        <section class={sectionStyle}>
          <div class={sectionHeaderStyle}>
            <h2 class={sectionTitleStyle}>AI Chat Demo</h2>
          </div>
          <Card variant="elevated" padding="large">
            <AIMessage
              content="Hello! I'm your AI shopping assistant. How can I help you today?"
              timestamp={new Date()}
              isAI={true}
            />
            <AIMessage
              content="I'm looking for a code assistant that can help with TypeScript."
              timestamp={new Date(Date.now() + 60000)}
              isAI={false}
            />
            <AIMessage
              content="I recommend Code Assistant Pro. It has 4.9 rating and specializes in TypeScript."
              timestamp={new Date(Date.now() + 120000)}
              isAI={true}
              isLoading={true}
            />
          </Card>
        </section>
      </main>

      {/* Bottom Tab Bar */}
      <TabBar
        items={navigationItems}
        activeId="home"
        onItemClick={(item) => console.log('Navigation clicked:', item.id)}
      />
    </div>
  );
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    features: ['iOS 26 HIG', 'AI Marketplace', 'Self-evolving']
  });
});

// ============================================================================
// PRODUCTS API
// ============================================================================

app.get('/api/products', (c) => {
  return c.json(sampleProducts);
});

// ============================================================================
// AI AGENTS API
// ============================================================================

app.get('/api/ai-agents', (c) => {
  return c.json(sampleAIAgents);
});

// ============================================================================
// EXPORT
// ============================================================================

export default app;