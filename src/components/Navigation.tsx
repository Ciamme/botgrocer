import { css } from 'hono/css';
import type { FC, JSX } from 'hono/jsx';
import DesignSystem from '@/styles/hig-design-system';
import { Button, IconButton } from './Button';

// ============================================================================
// TYPES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  icon?: JSX.Element;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number | string;
}

export interface NavigationProps {
  items: NavigationItem[];
  activeId?: string;
  onItemClick?: (item: NavigationItem) => void;
  variant?: 'tabs' | 'sidebar' | 'topbar';
}

// ============================================================================
// STYLES
// ============================================================================

const navigationBase = css`
  /* iOS 26 Navigation Base */
  font-family: ${DesignSystem.Typography.fontFamily.regular};
  ${DesignSystem.springAnimation('all', 'fast')}
`;

// ============================================================================
// TAB BAR (iOS 26 Tab Bar)
// ============================================================================

const tabBarStyle = css`
  display: flex;
  background-color: var(--color-background-secondary);
  border-top: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.opaque};
  padding: ${DesignSystem.Spacing.xs} ${DesignSystem.Spacing.sm};
  height: ${DesignSystem.Sizes.navigation.tabBarHeight};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

const tabItemStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${DesignSystem.Spacing.xs};
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-label-secondary);
  text-decoration: none;
  font-size: ${DesignSystem.Typography.styles.caption2.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.medium};
  ${DesignSystem.springAnimation()}
  
  &:hover {
    color: var(--color-label-primary);
  }
  
  &:active {
    ${DesignSystem.pressedState()}
  }
  
  &:focus-visible {
    ${DesignSystem.focusState()}
  }
`;

const tabItemActiveStyle = css`
  color: ${DesignSystem.Colors.primary};
  
  &::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${DesignSystem.Colors.primary};
    margin-top: 2px;
  }
`;

const tabIconStyle = css`
  width: ${DesignSystem.Sizes.icon.md};
  height: ${DesignSystem.Sizes.icon.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const badgeStyle = css`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: ${DesignSystem.Colors.system.red};
  color: white;
  font-size: ${DesignSystem.Typography.styles.caption2.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

// ============================================================================
// TOP BAR (iOS 26 Navigation Bar)
// ============================================================================

const topBarStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-background-secondary);
  border-bottom: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.opaque};
  padding: ${DesignSystem.Spacing.sm} ${DesignSystem.Spacing.md};
  height: ${DesignSystem.Sizes.navigation.barHeight};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const topBarTitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.headline.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  color: var(--color-label-primary);
  margin: 0;
`;

const topBarActionsStyle = css`
  display: flex;
  gap: ${DesignSystem.Spacing.sm};
  align-items: center;
`;

// ============================================================================
// SIDEBAR (macOS 26 Sidebar)
// ============================================================================

const sidebarStyle = css`
  width: 240px;
  background-color: var(--color-background-secondary);
  border-right: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.opaque};
  height: 100vh;
  overflow-y: auto;
  padding: ${DesignSystem.Spacing.md} 0;
`;

const sidebarItemStyle = css`
  display: flex;
  align-items: center;
  gap: ${DesignSystem.Spacing.sm};
  padding: ${DesignSystem.Spacing.sm} ${DesignSystem.Spacing.md};
  color: var(--color-label-secondary);
  text-decoration: none;
  font-size: ${DesignSystem.Typography.styles.body.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.regular};
  ${DesignSystem.springAnimation()}
  
  &:hover {
    background-color: ${DesignSystem.Colors.system.fill.quaternary};
    color: var(--color-label-primary);
  }
  
  &:active {
    ${DesignSystem.pressedState()}
  }
  
  &:focus-visible {
    ${DesignSystem.focusState()}
  }
`;

const sidebarItemActiveStyle = css`
  background-color: ${DesignSystem.Colors.primary}15;
  color: ${DesignSystem.Colors.primary};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    height: 24px;
    background-color: ${DesignSystem.Colors.primary};
    border-radius: 0 ${DesignSystem.Borders.radius.sm} ${DesignSystem.Borders.radius.sm} 0;
  }
`;

const sidebarIconStyle = css`
  width: ${DesignSystem.Sizes.icon.sm};
  height: ${DesignSystem.Sizes.icon.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ============================================================================
// COMPONENTS
// ============================================================================

export const TabBar: FC<NavigationProps> = ({
  items,
  activeId,
  onItemClick
}) => {
  return (
    <nav class={tabBarStyle}>
      {items.map((item) => {
        const isActive = activeId === item.id || item.active;
        const itemClasses = [
          tabItemStyle,
          isActive && tabItemActiveStyle
        ].filter(Boolean).join(' ');
        
        return (
          <button
            key={item.id}
            class={itemClasses}
            onClick={() => onItemClick?.(item)}
            aria-current={isActive ? 'page' : undefined}
            style={{ position: 'relative' }}
          >
            {item.icon && <span class={tabIconStyle}>{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span class={badgeStyle}>
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export interface TopBarProps {
  title: string;
  leftActions?: JSX.Element[];
  rightActions?: JSX.Element[];
  showBackButton?: boolean;
  onBack?: () => void;
}

export const TopBar: FC<TopBarProps> = ({
  title,
  leftActions = [],
  rightActions = [],
  showBackButton = false,
  onBack
}) => {
  return (
    <header class={topBarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.Spacing.sm }}>
        {showBackButton && (
          <IconButton
            icon={(
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 10H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 15L5 10L10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            variant="plain"
            onClick={onBack}
            aria-label="Go back"
          />
        )}
        {leftActions}
        <h1 class={topBarTitleStyle}>{title}</h1>
      </div>
      
      <div class={topBarActionsStyle}>
        {rightActions}
      </div>
    </header>
  );
};

export const Sidebar: FC<NavigationProps> = ({
  items,
  activeId,
  onItemClick
}) => {
  return (
    <nav class={sidebarStyle}>
      {items.map((item) => {
        const isActive = activeId === item.id || item.active;
        const itemClasses = [
          sidebarItemStyle,
          isActive && sidebarItemActiveStyle
        ].filter(Boolean).join(' ');
        
        return (
          <a
            key={item.id}
            href={item.href || '#'}
            class={itemClasses}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              onItemClick?.(item);
            }}
            aria-current={isActive ? 'page' : undefined}
            style={{ position: 'relative' }}
          >
            {item.icon && <span class={sidebarIconStyle}>{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span class={badgeStyle} style={{ position: 'absolute', right: DesignSystem.Spacing.md }}>
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
};

// ============================================================================
// BREADCRUMB NAVIGATION
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: string;
}

const breadcrumbsStyle = css`
  display: flex;
  align-items: center;
  gap: ${DesignSystem.Spacing.xs};
  font-size: ${DesignSystem.Typography.styles.subhead.fontSize};
  color: var(--color-label-secondary);
  padding: ${DesignSystem.Spacing.sm} 0;
`;

const breadcrumbItemStyle = css`
  display: flex;
  align-items: center;
  gap: ${DesignSystem.Spacing.xs};
  
  &:last-child {
    color: var(--color-label-primary);
    font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  }
`;

const breadcrumbLinkStyle = css`
  color: inherit;
  text-decoration: none;
  ${DesignSystem.springAnimation()}
  
  &:hover {
    color: ${DesignSystem.Colors.primary};
    text-decoration: underline;
  }
`;

const separatorStyle = css`
  color: var(--color-label-tertiary);
`;

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  items,
  separator = '›'
}) => {
  return (
    <nav class={breadcrumbsStyle} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} class={breadcrumbItemStyle}>
          {item.href ? (
            <a href={item.href} class={breadcrumbLinkStyle}>
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span class={separatorStyle}>{separator}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showNumbers?: boolean;
}

const paginationStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${DesignSystem.Spacing.xs};
  padding: ${DesignSystem.Spacing.md} 0;
`;

const pageButtonStyle = css`
  min-width: ${DesignSystem.Sizes.touch.small};
  height: ${DesignSystem.Sizes.touch.small};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${DesignSystem.Borders.radius.md};
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${DesignSystem.Typography.styles.body.fontSize};
  color: var(--color-label-secondary);
  ${DesignSystem.springAnimation()}
  
  &:hover:not(:disabled) {
    background-color: ${DesignSystem.Colors.system.fill.quaternary};
    color: var(--color-label-primary);
  }
  
  &:active:not(:disabled) {
    ${DesignSystem.pressedState()}
  }
  
  &:disabled {
    opacity: ${DesignSystem.Animations.opacity.disabled};
    cursor: not-allowed;
  }
  
  &:focus-visible {
    ${DesignSystem.focusState()}
  }
`;

const pageButtonActiveStyle = css`
  background-color: ${DesignSystem.Colors.primary};
  color: white;
  
  &:hover {
    background-color: color-mix(in srgb, ${DesignSystem.Colors.primary} 90%, black);
    color: white;
  }
`;

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showNumbers = true
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <nav class={paginationStyle} aria-label="Pagination">
      <button
        class={pageButtonStyle}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      
      {showNumbers && pages.map((page) => {
        const isActive = page === currentPage;
        const buttonClasses = [
          pageButtonStyle,
          isActive && pageButtonActiveStyle
        ].filter(Boolean).join(' ');
        
        return (
          <button
            key={page}
            class={buttonClasses}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        );
      })}
      
      <button
        class={pageButtonStyle}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
};

export default {
  TabBar,
  TopBar,
  Sidebar,
  Breadcrumbs,
  Pagination
};