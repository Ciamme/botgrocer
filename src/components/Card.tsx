import { css } from 'hono/css';
import type { FC, JSX } from 'hono/jsx';
import DesignSystem from '@/styles/hig-design-system';

// ============================================================================
// TYPES
// ============================================================================

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
  children: JSX.Element | JSX.Element[];
}

// ============================================================================
// STYLES
// ============================================================================

const cardBase = css`
  /* iOS 26 Card Base */
  border-radius: ${DesignSystem.Borders.radius.md};
  overflow: hidden;
  ${DesignSystem.springAnimation()}
  
  /* Focus state for interactive cards */
  &:focus-visible {
    ${DesignSystem.focusState()}
  }
`;

const cardVariants = {
  elevated: css`
    background-color: var(--color-background-secondary);
    box-shadow: ${DesignSystem.Borders.shadow.level1};
    border: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.nonOpaque};
  `,
  
  filled: css`
    background-color: ${DesignSystem.Colors.system.fill.quaternary};
    border: none;
  `,
  
  outlined: css`
    background-color: transparent;
    border: ${DesignSystem.Borders.width.regular} solid ${DesignSystem.Colors.system.separator.opaque};
  `
};

const paddingStyles = {
  none: css`padding: 0;`,
  small: css`padding: ${DesignSystem.Spacing.sm};`,
  medium: css`padding: ${DesignSystem.Spacing.md};`,
  large: css`padding: ${DesignSystem.Spacing.lg};`
};

const interactiveStyle = css`
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${DesignSystem.Borders.shadow.level2};
  }
  
  &:active {
    ${DesignSystem.pressedState()}
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

export const Card: FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  interactive = false,
  children,
  className,
  ...props
}) => {
  const variantClass = cardVariants[variant];
  const paddingClass = paddingStyles[padding];
  
  const classes = [
    cardBase,
    variantClass,
    paddingClass,
    interactive && interactiveStyle,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div class={classes} {...props}>
      {children}
    </div>
  );
};

// ============================================================================
// CARD SUBCOMPONENTS
// ============================================================================

const cardHeaderStyle = css`
  padding-bottom: ${DesignSystem.Spacing.md};
  margin-bottom: ${DesignSystem.Spacing.md};
  border-bottom: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.nonOpaque};
`;

export const CardHeader: FC<JSX.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div class={`${cardHeaderStyle} ${className || ''}`} {...props}>
    {children}
  </div>
);

const cardContentStyle = css`
  & > * + * {
    margin-top: ${DesignSystem.Spacing.md};
  }
`;

export const CardContent: FC<JSX.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div class={`${cardContentStyle} ${className || ''}`} {...props}>
    {children}
  </div>
);

const cardFooterStyle = css`
  padding-top: ${DesignSystem.Spacing.md};
  margin-top: ${DesignSystem.Spacing.md};
  border-top: ${DesignSystem.Borders.width.hairline} solid ${DesignSystem.Colors.system.separator.nonOpaque};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardFooter: FC<JSX.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div class={`${cardFooterStyle} ${className || ''}`} {...props}>
    {children}
  </div>
);

// ============================================================================
// SPECIALIZED CARD COMPONENTS
// ============================================================================

export interface ProductCardProps {
  image: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating?: number;
  onAddToCart?: () => void;
  onViewDetails?: () => void;
}

const productCardStyle = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const productImageStyle = css`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: ${DesignSystem.Borders.radius.sm};
  margin-bottom: ${DesignSystem.Spacing.md};
`;

const productTitleStyle = css`
  font-size: ${DesignSystem.Typography.styles.headline.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  line-height: ${DesignSystem.Typography.styles.headline.lineHeight};
  margin-bottom: ${DesignSystem.Spacing.xs};
  color: var(--color-label-primary);
`;

const productDescriptionStyle = css`
  font-size: ${DesignSystem.Typography.styles.footnote.fontSize};
  line-height: ${DesignSystem.Typography.styles.footnote.lineHeight};
  color: var(--color-label-secondary);
  margin-bottom: ${DesignSystem.Spacing.md};
  flex-grow: 1;
`;

const productMetaStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${DesignSystem.Spacing.md};
`;

const priceStyle = css`
  font-size: ${DesignSystem.Typography.styles.title3.fontSize};
  font-weight: ${DesignSystem.Typography.fontWeight.semibold};
  color: ${DesignSystem.Colors.primary};
`;

const categoryStyle = css`
  font-size: ${DesignSystem.Typography.styles.caption1.fontSize};
  color: var(--color-label-tertiary);
  background-color: ${DesignSystem.Colors.system.fill.quaternary};
  padding: 2px 8px;
  border-radius: ${DesignSystem.Borders.radius.pill};
`;

const ratingStyle = css`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${DesignSystem.Typography.styles.caption1.fontSize};
  color: var(--color-label-secondary);
`;

const actionsStyle = css`
  display: flex;
  gap: ${DesignSystem.Spacing.sm};
  
  & > * {
    flex: 1;
  }
`;

export const ProductCard: FC<ProductCardProps> = ({
  image,
  title,
  description,
  price,
  category,
  rating,
  onAddToCart,
  onViewDetails
}) => {
  return (
    <Card variant="elevated" padding="medium" interactive>
      <div class={productCardStyle}>
        <img
          src={image}
          alt={title}
          class={productImageStyle}
          loading="lazy"
        />
        
        <h3 class={productTitleStyle}>{title}</h3>
        
        <p class={productDescriptionStyle}>{description}</p>
        
        <div class={productMetaStyle}>
          <span class={priceStyle}>${price.toFixed(2)}</span>
          <span class={categoryStyle}>{category}</span>
        </div>
        
        {rating && (
          <div class={ratingStyle}>
            <span>⭐</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
        
        <div class={actionsStyle}>
          <Button
            variant="secondary"
            size="small"
            onClick={onViewDetails}
            fullWidth
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={onAddToCart}
            fullWidth
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Card;