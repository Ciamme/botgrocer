import { css } from 'hono/css';
import type { FC, JSX } from 'hono/jsx';
import DesignSystem from '@/styles/hig-design-system';

// ============================================================================
// TYPES
// ============================================================================

export type AIStatusType = 'thinking' | 'processing' | 'generating' | 'complete' | 'error';

export interface AIStatusProps {
  type: AIStatusType;
  message?: string;
  progress?: number; // 0-100
  showPulse?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// STYLES
// ============================================================================

const statusBase = css`
  display: inline-flex;
  align-items: center;
  gap: ${DesignSystem.Spacing.sm};
  font-family: ${DesignSystem.Typography.fontFamily.regular};
  ${DesignSystem.springAnimation()}
`;

const statusSizes = {
  small: css`
    font-size: ${DesignSystem.Typography.styles.footnote.fontSize};
    line-height: ${DesignSystem.Typography.styles.footnote.lineHeight};
  `,
  medium: css`
    font-size: ${DesignSystem.Typography.styles.body.fontSize};
    line-height: ${DesignSystem.Typography.styles.body.lineHeight};
  `,
  large: css`
    font-size: ${DesignSystem.Typography.styles.headline.fontSize};
    line-height: ${DesignSystem.Typography.styles.headline.lineHeight};
  `
};

// ============================================================================
// PULSE ANIMATION (iOS 26标准脉冲动画)
// ============================================================================

const pulseContainer = css`
  position: relative;
  width: 20px;
  height: 20px;
`;

const pulseRing = css`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid ${DesignSystem.Colors.system.blue};
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }
`;

const pulseCore = css`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${DesignSystem.Colors.system.blue};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: breathe 2s ease-in-out infinite;
  
  @keyframes breathe {
    0%, 100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
`;

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

const progressContainer = css`
  width: 100%;
  height: 4px;
  background-color: ${DesignSystem.Colors.system.fill.primary};
  border-radius: ${DesignSystem.Borders.radius.pill};
  overflow: hidden;
`;

const progressBar = css`
  height: 100%;
  background-color: ${DesignSystem.Colors.primary};
  border-radius: ${DesignSystem.Borders.radius.pill};
  ${DesignSystem.springAnimation('width', 'normal')}
`;

// ============================================================================
// STATUS ICONS
// ============================================================================

const statusIcons = {
  thinking: (
    <div class={pulseContainer}>
      <div class={pulseRing}></div>
      <div class={pulseCore}></div>
    </div>
  ),
  
  processing: (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: `2px solid ${DesignSystem.Colors.system.blue}`,
      borderTopColor: 'transparent',
      animation: 'spin 1s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
  
  generating: (
    <div style={{
      width: '20px',
      height: '20px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: DesignSystem.Colors.system.green,
        opacity: '0.6',
        animation: 'pulse 2s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: DesignSystem.Colors.system.green,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}></div>
    </div>
  ),
  
  complete: (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: DesignSystem.Colors.system.green,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      ✓
    </div>
  ),
  
  error: (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: DesignSystem.Colors.system.red,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      !
    </div>
  )
};

// ============================================================================
// STATUS MESSAGES
// ============================================================================

const defaultMessages = {
  thinking: 'Thinking...',
  processing: 'Processing...',
  generating: 'Generating response...',
  complete: 'Complete',
  error: 'Error occurred'
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AIStatus: FC<AIStatusProps> = ({
  type,
  message,
  progress,
  showPulse = true,
  size = 'medium'
}) => {
  const sizeClass = statusSizes[size];
  const displayMessage = message || defaultMessages[type];
  
  return (
    <div 
      class={`${statusBase} ${sizeClass}`}
      role="status"
      aria-live="polite"
      aria-busy={type !== 'complete' && type !== 'error'}
    >
      {showPulse && statusIcons[type]}
      
      <span>{displayMessage}</span>
      
      {progress !== undefined && (
        <div class={progressContainer}>
          <div 
            class={progressBar}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AI AGENT AVATAR
// ============================================================================

export interface AIAvatarProps {
  name: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'busy';
  size?: 'small' | 'medium' | 'large';
}

const avatarSizes = {
  small: '32px',
  medium: '48px',
  large: '64px'
};

const avatarStatus = {
  online: DesignSystem.Colors.system.green,
  offline: DesignSystem.Colors.system.fill.primary,
  busy: DesignSystem.Colors.system.orange
};

export const AIAvatar: FC<AIAvatarProps> = ({
  name,
  avatarUrl,
  status = 'online',
  size = 'medium'
}) => {
  const avatarSize = avatarSizes[size];
  const statusColor = avatarStatus[status];
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <div style={{
      position: 'relative',
      width: avatarSize,
      height: avatarSize
    }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: DesignSystem.Colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: `calc(${avatarSize} * 0.4)`,
          fontWeight: 'bold'
        }}>
          {initials}
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: `calc(${avatarSize} * 0.25)`,
        height: `calc(${avatarSize} * 0.25)`,
        borderRadius: '50%',
        backgroundColor: statusColor,
        border: `2px solid var(--color-background-secondary)`
      }}></div>
    </div>
  );
};

// ============================================================================
// AI MESSAGE BUBBLE
// ============================================================================

export interface AIMessageProps {
  content: string;
  timestamp?: Date;
  isAI?: boolean;
  isLoading?: boolean;
}

const messageBubble = css`
  max-width: 80%;
  padding: ${DesignSystem.Spacing.sm} ${DesignSystem.Spacing.md};
  border-radius: ${DesignSystem.Borders.radius.lg};
  font-size: ${DesignSystem.Typography.styles.body.fontSize};
  line-height: ${DesignSystem.Typography.styles.body.lineHeight};
  ${DesignSystem.springAnimation()}
`;

const aiMessageStyle = css`
  ${messageBubble}
  background-color: ${DesignSystem.Colors.system.fill.primary};
  color: var(--color-label-primary);
  align-self: flex-start;
  border-bottom-left-radius: ${DesignSystem.Borders.radius.xs};
`;

const userMessageStyle = css`
  ${messageBubble}
  background-color: ${DesignSystem.Colors.primary};
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: ${DesignSystem.Borders.radius.xs};
`;

const messageContainer = css`
  display: flex;
  flex-direction: column;
  gap: ${DesignSystem.Spacing.xs};
  margin: ${DesignSystem.Spacing.sm} 0;
`;

const timestampStyle = css`
  font-size: ${DesignSystem.Typography.styles.caption2.fontSize};
  color: var(--color-label-tertiary);
  align-self: flex-end;
`;

export const AIMessage: FC<AIMessageProps> = ({
  content,
  timestamp,
  isAI = true,
  isLoading = false
}) => {
  return (
    <div class={messageContainer}>
      <div class={isAI ? aiMessageStyle : userMessageStyle}>
        {isLoading ? (
          <AIStatus type="thinking" size="small" />
        ) : (
          content
        )}
      </div>
      
      {timestamp && (
        <span class={timestampStyle}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// AI AGENT CARD (简化版本，避免CSS语法问题)
// ============================================================================

export interface AIAgentCardProps {
  name: string;
  description: string;
  capabilities: string[];
  avatarUrl?: string;
  rating: number;
  price: number;
  onSelect?: () => void;
  onChat?: () => void;
}

const agentCardStyle = css`
  padding: ${DesignSystem.Spacing.md};
  background-color: var(--color-background-secondary);
  border-radius: ${DesignSystem.Borders.radius.md};
  border: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.nonOpaque};
  ${DesignSystem.springAnimation()}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${DesignSystem.Borders.shadow.level2};
  }
`;

const agentHeaderStyle = css`
  display: flex;
  gap: ${DesignSystem.Spacing.md};
  margin-bottom: ${DesignSystem.Spacing.md};
`;

const agentInfoStyle = css`
  flex: 1;
`;

const agentNameStyle = css`
  font-size: ${DesignSystem.Typography.styles.headline.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  margin: 0 0 ${DesignSystem.Spacing.xs} 0;
  color: var(--color-label-primary);
`;

const agentPriceStyle = css`
  font-size: ${DesignSystem.Typography.styles.title3.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  color: ${DesignSystem.Colors.primary};
`;

const agentDescriptionStyle = css`
  font-size: ${DesignSystem.Typography.styles.footnote.fontSize};
  color: var(--color-label-secondary);
  margin-bottom: ${DesignSystem.Spacing.sm};
`;

const agentRatingStyle = css`
  display: flex;
  align-items: center;
  gap: ${DesignSystem.Spacing.sm};
  margin-bottom: ${DesignSystem.Spacing.md};
`;

const capabilitiesStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${DesignSystem.Spacing.xs};
  margin-bottom: ${DesignSystem.Spacing.md};
`;

const capabilityStyle = css`
  font-size: ${DesignSystem.Typography.styles.caption2.fontSize};
  color: ${DesignSystem.Colors.primary};
  background-color: ${DesignSystem.Colors.primary}15;
  padding: 2px 8px;
  border-radius: ${DesignSystem.Borders.radius.pill};
`;

const agentActionsStyle = css`
  display: flex;
  gap: ${DesignSystem.Spacing.sm};
`;

const selectButtonStyle = css`
  flex: 1;
  padding: ${DesignSystem.Spacing.sm} ${DesignSystem.Spacing.md};
  background-color: ${DesignSystem.Colors.primary};
  color: white;
  border: none;
  border-radius: ${DesignSystem.Borders.radius.md};
  font-size: ${DesignSystem.Typography.styles.subhead.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  cursor: pointer;
  ${DesignSystem.springAnimation()}
  
  &:hover {
    background-color: color-mix(in srgb, ${DesignSystem.Colors.primary} 90%, black);
  }
  
  &:active {
    transform: ${DesignSystem.Animations.scale.active};
  }
`;

const chatButtonStyle = css`
  padding: ${DesignSystem.Spacing.sm} ${DesignSystem.Spacing.md};
  background-color: transparent;
  color: ${DesignSystem.Colors.primary};
  border: ${DesignSystem.Borders.width.regular} solid ${DesignSystem.Colors.system.separator.opaque};
  border-radius: ${DesignSystem.Borders.radius.md};
  font-size: ${DesignSystem.Typography.styles.subhead.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.medium};
  cursor: pointer;
  ${DesignSystem.springAnimation()}
  
  &:hover {
    background-color: ${DesignSystem.Colors.system.fill.quaternary};
    border-color: ${DesignSystem.Colors.primary};
  }
  
  &:active {
    transform: ${DesignSystem.Animations.scale.active};
  }
`;

export const AIAgentCard: FC<AIAgentCardProps> = ({
  name,
  description,
  capabilities,
  avatarUrl,
  rating,
  price,
  onSelect,
  onChat
}) => {
  return (
    <div class={agentCardStyle}>
      <div class={agentHeaderStyle}>
        <AIAvatar name={name} avatarUrl={avatarUrl} size="medium" />
        
        <div class={agentInfoStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: DesignSystem.Spacing.xs
          }}>
            <h3 class={agentNameStyle}>{name}</h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.Spacing.xs
            }}>
              <span class={agentPriceStyle}>${price.toFixed(2)}</span>
              <span style={{
                fontSize: DesignSystem.Typography.styles.caption1.fontSize,
                color: 'var(--color-label-tertiary)'
              }}>
                /hr
              </span>
            </div>
          </div>
          
          <p class={agentDescriptionStyle}>{description}</p>
          
          <div class={agentRatingStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {'★'.repeat(5).split('').map((star, i) => (
                <span key={i} style={{
                  color: i < Math.floor(rating) ? DesignSystem.Colors.system.yellow : 'var(--color-label-tertiary)',
                  fontSize: '14px'
                }}>
                  {star}
                </span>
              ))}
            </div>
            <span style={{
              fontSize: DesignSystem.Typography.styles.caption1.fontSize,
              color: 'var(--color-label-secondary)'
            }}>
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div class={capabilitiesStyle}>
        {capabilities.map((capability, index) => (
          <span key={index} class={capabilityStyle}>
            {capability}
          </span>
        ))}
      </div>
      
      <div class={agentActionsStyle}>
        <button class={selectButtonStyle} onClick={onSelect}>
          Select Agent
        </button>
        <button class={chatButtonStyle} onClick={onChat}>
          Chat
        </button>
      </div>
    </div>
  );
};

export default {
  AIStatus,
  AIAvatar,
  AIMessage,
  AIAgentCard
};