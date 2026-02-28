import { css } from 'hono/css';
import type { FC, JSX } from 'hono/jsx';
import DesignSystem from '@/styles/hig-design-system';

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 
  | 'primary'    // Filled with primary color
  | 'secondary'  // Gray filled
  | 'tertiary'   // Gray outline
  | 'destructive' // Red filled (for destructive actions)
  | 'plain';     // Text only

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  children: JSX.Element | string;
}

// ============================================================================
// STYLES
// ============================================================================

const buttonBase = css`
  /* iOS 26 Button Base */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  text-decoration: none;
  font-family: ${DesignSystem.Typography.fontFamily.regular};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  letter-spacing: -0.41px;
  text-align: center;
  white-space: nowrap;
  
  /* Soft rounded corners (r=12) */
  border-radius: ${DesignSystem.Borders.radius.md};
  
  /* iOS 26 Spring Animation */
  ${DesignSystem.springAnimation()}
  
  /* Focus state for accessibility */
  &:focus-visible {
    ${DesignSystem.focusState()}
  }
  
  /* Disabled state */
  &:disabled {
    ${DesignSystem.disabledState()}
  }
  
  /* Active/pressed state (scale 0.97) */
  &:active:not(:disabled) {
    ${DesignSystem.pressedState()}
  }
`;

const buttonVariants = {
  primary: css`
    background-color: ${DesignSystem.Colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, ${DesignSystem.Colors.primary} 90%, black);
    }
  `,
  
  secondary: css`
    background-color: ${DesignSystem.Colors.system.fill.primary};
    color: ${DesignSystem.Colors.system.label.primary};
    
    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, ${DesignSystem.Colors.system.fill.primary} 90%, black);
    }
  `,
  
  tertiary: css`
    background-color: transparent;
    color: ${DesignSystem.Colors.primary};
    border: ${DesignSystem.Borders.width.regular} solid ${DesignSystem.Colors.system.separator.opaque};
    
    &:hover:not(:disabled) {
      background-color: ${DesignSystem.Colors.system.fill.quaternary};
      border-color: ${DesignSystem.Colors.primary};
    }
  `,
  
  destructive: css`
    background-color: ${DesignSystem.Colors.system.red};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, ${DesignSystem.Colors.system.red} 90%, black);
    }
  `,
  
  plain: css`
    background-color: transparent;
    color: ${DesignSystem.Colors.primary};
    padding: 0;
    
    &:hover:not(:disabled) {
      opacity: ${DesignSystem.Animations.opacity.hover};
    }
  `
};

const buttonSizes = {
  small: css`
    font-size: ${DesignSystem.Typography.styles.footnote.fontSize};
    line-height: ${DesignSystem.Typography.styles.footnote.lineHeight};
    padding: 6px 12px;
    min-height: ${DesignSystem.Sizes.touch.small};
  `,
  
  medium: css`
    font-size: ${DesignSystem.Typography.styles.body.fontSize};
    line-height: ${DesignSystem.Typography.styles.body.lineHeight};
    padding: ${DesignSystem.Spacing.component.padding.medium};
    min-height: ${DesignSystem.Sizes.touch.medium};
  `,
  
  large: css`
    font-size: ${DesignSystem.Typography.styles.headline.fontSize};
    line-height: ${DesignSystem.Typography.styles.headline.lineHeight};
    padding: ${DesignSystem.Spacing.component.padding.large};
    min-height: ${DesignSystem.Sizes.touch.large};
  `
};

const fullWidthStyle = css`
  width: 100%;
`;

const loadingStyle = css`
  position: relative;
  color: transparent !important;
  
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const iconStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const leftIconStyle = css`
  margin-right: 8px;
`;

const rightIconStyle = css`
  margin-left: 8px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}) => {
  const variantClass = buttonVariants[variant];
  const sizeClass = buttonSizes[size];
  
  const classes = [
    buttonBase,
    variantClass,
    sizeClass,
    fullWidth && fullWidthStyle,
    isLoading && loadingStyle,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      class={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {leftIcon && <span class={`${iconStyle} ${leftIconStyle}`}>{leftIcon}</span>}
      {children}
      {rightIcon && <span class={`${iconStyle} ${rightIconStyle}`}>{rightIcon}</span>}
    </button>
  );
};

// ============================================================================
// SPECIALIZED BUTTON COMPONENTS
// ============================================================================

export const PrimaryButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const DestructiveButton: FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="destructive" {...props} />
);

export const IconButton: FC<Omit<ButtonProps, 'children'> & { icon: JSX.Element }> = ({
  icon,
  size = 'medium',
  ...props
}) => {
  const iconSize = {
    small: DesignSystem.Sizes.icon.sm,
    medium: DesignSystem.Sizes.icon.md,
    large: DesignSystem.Sizes.icon.lg
  }[size];
  
  const iconElement = (
    <span style={{ width: iconSize, height: iconSize }}>
      {icon}
    </span>
  );
  
  return (
    <Button
      size={size}
      aria-label={props['aria-label'] || 'Icon button'}
      {...props}
    >
      {iconElement}
    </Button>
  );
};

export default Button;