/**
 * iOS 26 / macOS 26 Human Interface Guidelines Design System
 * Strict compliance with Apple's latest design specifications
 */

// ============================================================================
// 1. COLOR SYSTEM
// ============================================================================

export const Colors = {
  // Primary Brand Color (from requirements)
  primary: '#CA279C',
  
  // iOS 26 Semantic Colors
  system: {
    // Backgrounds
    background: {
      primary: 'rgb(242, 242, 247)',
      secondary: 'rgb(255, 255, 255)',
      tertiary: 'rgb(242, 242, 247)',
      grouped: {
        primary: 'rgb(242, 242, 247)',
        secondary: 'rgb(255, 255, 255)',
        tertiary: 'rgb(242, 242, 247)'
      }
    },
    
    // Labels
    label: {
      primary: 'rgb(0, 0, 0)',
      secondary: 'rgb(60, 60, 67)',
      tertiary: 'rgb(60, 60, 67, 0.6)',
      quaternary: 'rgb(60, 60, 67, 0.3)'
    },
    
    // Separators
    separator: {
      opaque: 'rgb(198, 198, 200)',
      nonOpaque: 'rgb(60, 60, 67, 0.29)'
    },
    
    // Fill Colors
    fill: {
      primary: 'rgb(120, 120, 128, 0.2)',
      secondary: 'rgb(120, 120, 128, 0.16)',
      tertiary: 'rgb(118, 118, 128, 0.12)',
      quaternary: 'rgb(116, 116, 128, 0.08)'
    },
    
    // System Colors
    blue: 'rgb(0, 122, 255)',
    green: 'rgb(52, 199, 89)',
    indigo: 'rgb(88, 86, 214)',
    orange: 'rgb(255, 149, 0)',
    pink: 'rgb(255, 45, 85)',
    purple: 'rgb(175, 82, 222)',
    red: 'rgb(255, 59, 48)',
    teal: 'rgb(90, 200, 250)',
    yellow: 'rgb(255, 204, 0)'
  },
  
  // Dark Mode Colors (automatic sync)
  dark: {
    system: {
      background: {
        primary: 'rgb(0, 0, 0)',
        secondary: 'rgb(28, 28, 30)',
        tertiary: 'rgb(44, 44, 46)',
        grouped: {
          primary: 'rgb(0, 0, 0)',
          secondary: 'rgb(28, 28, 30)',
          tertiary: 'rgb(44, 44, 46)'
        }
      },
      label: {
        primary: 'rgb(255, 255, 255)',
        secondary: 'rgb(235, 235, 245, 0.6)',
        tertiary: 'rgb(235, 235, 245, 0.3)',
        quaternary: 'rgb(235, 235, 245, 0.18)'
      },
      separator: {
        opaque: 'rgb(56, 56, 58)',
        nonOpaque: 'rgb(84, 84, 88, 0.65)'
      },
      fill: {
        primary: 'rgb(120, 120, 128, 0.36)',
        secondary: 'rgb(120, 120, 128, 0.32)',
        tertiary: 'rgb(118, 118, 128, 0.24)',
        quaternary: 'rgb(118, 118, 128, 0.18)'
      }
    }
  }
} as const;

// ============================================================================
// 2. TYPOGRAPHY SYSTEM (SF Pro with exact HIG values)
// ============================================================================

export const Typography = {
  // Font Families
  fontFamily: {
    regular: '-apple-system, "SF Pro", "SF Pro Text", system-ui, sans-serif',
    rounded: '-apple-system, "SF Pro Rounded", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace'
  },
  
  // Font Weights (SF Pro specific)
  fontWeight: {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900'
  },
  
  // Text Styles (exact iOS 26 HIG values)
  styles: {
    // Large Titles
    largeTitle: {
      fontSize: '34px',
      lineHeight: '41px',
      fontWeight: '700', // Bold
      letterSpacing: '0.37px'
    },
    
    // Title 1
    title1: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: '700', // Bold
      letterSpacing: '0.36px'
    },
    
    // Title 2
    title2: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: '700', // Bold
      letterSpacing: '0.35px'
    },
    
    // Title 3
    title3: {
      fontSize: '20px',
      lineHeight: '25px',
      fontWeight: '600', // Semibold
      letterSpacing: '0.38px'
    },
    
    // Headline
    headline: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '600', // Semibold
      letterSpacing: '-0.41px'
    },
    
    // Body (from requirements: SF Pro Regular 17pt @ 1.4 line-height)
    body: {
      fontSize: '17px',
      lineHeight: '24px', // 17 * 1.4 = 23.8 ≈ 24px
      fontWeight: '400', // Regular
      letterSpacing: '-0.41px'
    },
    
    // Callout
    callout: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: '400', // Regular
      letterSpacing: '-0.32px'
    },
    
    // Subhead
    subhead: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: '400', // Regular
      letterSpacing: '-0.24px'
    },
    
    // Footnote
    footnote: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: '400', // Regular
      letterSpacing: '-0.08px'
    },
    
    // Caption 1
    caption1: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400', // Regular
      letterSpacing: '0px'
    },
    
    // Caption 2
    caption2: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: '400', // Regular
      letterSpacing: '0.07px'
    }
  }
} as const;

// ============================================================================
// 3. SPACING & LAYOUT SYSTEM (SwiftUI Layout Engine equivalent)
// ============================================================================

export const Spacing = {
  // iOS Standard Spacing Units
  xs: '4px',    // Extra Small
  sm: '8px',    // Small
  md: '16px',   // Medium (default)
  lg: '24px',   // Large
  xl: '32px',   // Extra Large
  xxl: '48px',  // 2x Large
  xxxl: '64px', // 3x Large
  
  // Component-specific spacing
  component: {
    padding: {
      small: '8px 12px',
      medium: '12px 16px',
      large: '16px 20px'
    },
    margin: {
      section: '32px',
      group: '24px',
      item: '16px'
    }
  }
} as const;

// ============================================================================
// 4. BORDER RADIUS & SHADOWS (iOS 26 "soft rounded corners")
// ============================================================================

export const Borders = {
  // Corner Radius (from requirements: soft rounded corners r=12)
  radius: {
    xs: '6px',     // Extra Small
    sm: '8px',     // Small
    md: '12px',    // Medium (standard iOS 26)
    lg: '16px',    // Large
    xl: '20px',    // Extra Large
    pill: '9999px' // Pill shape
  },
  
  // Border Widths
  width: {
    hairline: '0.33px',
    thin: '0.5px',
    regular: '1px',
    thick: '2px'
  },
  
  // Shadows (from requirements: micro inner shadow)
  shadow: {
    // Elevation Level 1
    level1: '0px 1px 2px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    
    // Elevation Level 2
    level2: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 4px 6px rgba(0, 0, 0, 0.1)',
    
    // Elevation Level 3
    level3: '0px 4px 8px rgba(0, 0, 0, 0.05), 0px 6px 12px rgba(0, 0, 0, 0.1)',
    
    // Inner Shadow (for pressed states)
    inner: 'inset 0px 1px 2px rgba(0, 0, 0, 0.05)',
    
    // Focus Ring (accessibility)
    focus: `0 0 0 3px ${Colors.primary}20` // 20 = 12% opacity
  }
} as const;

// ============================================================================
// 5. ANIMATION & TRANSITIONS (iOS 26 Spring Physics)
// ============================================================================

export const Animations = {
  // Spring Configuration (from requirements: damping: 0.7, stiffness: 300)
  spring: {
    default: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // iOS 26 spring approximation
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOut: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)'
  },
  
  // Durations
  duration: {
    instant: '0.1s',
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    deliberate: '0.8s'
  },
  
  // Scale Transformations (from requirements: active scale: 0.97)
  scale: {
    hover: 'scale(1.02)',
    active: 'scale(0.97)',
    tap: 'scale(0.95)'
  },
  
  // Opacity
  opacity: {
    disabled: '0.38',
    placeholder: '0.6',
    hover: '0.87',
    active: '0.74'
  }
} as const;

// ============================================================================
// 6. COMPONENT SIZES & DIMENSIONS
// ============================================================================

export const Sizes = {
  // Touch Targets (minimum 44x44px for iOS)
  touch: {
    min: '44px',
    small: '48px',
    medium: '52px',
    large: '56px'
  },
  
  // Icons
  icon: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '28px',
    xl: '32px'
  },
  
  // Navigation
  navigation: {
    barHeight: '44px',
    tabBarHeight: '49px',
    safeArea: {
      top: '44px',
      bottom: '34px'
    }
  },
  
  // Content Widths
  content: {
    compact: '320px',
    regular: '375px',
    expanded: '414px',
    max: '768px'
  }
} as const;

// ============================================================================
// 7. UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate CSS for iOS 26 spring animation
 */
export function springAnimation(
  property: string = 'all',
  duration: keyof typeof Animations.duration = 'normal'
): string {
  return `
    transition: ${property} ${Animations.duration[duration]} ${Animations.spring.default};
    will-change: ${property};
  `;
}

/**
 * Generate CSS for pressed state (scale + shadow)
 */
export function pressedState(): string {
  return `
    transform: ${Animations.scale.active};
    box-shadow: ${Borders.shadow.inner};
  `;
}

/**
 * Generate CSS for focus state (accessibility)
 */
export function focusState(): string {
  return `
    outline: none;
    box-shadow: ${Borders.shadow.focus};
  `;
}

/**
 * Generate CSS for disabled state
 */
export function disabledState(): string {
  return `
    opacity: ${Animations.opacity.disabled};
    cursor: not-allowed;
    pointer-events: none;
  `;
}

/**
 * Generate responsive container styles
 */
export function responsiveContainer(maxWidth: keyof typeof Sizes.content = 'max'): string {
  return `
    width: 100%;
    max-width: ${Sizes.content[maxWidth]};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${Spacing.md};
    padding-right: ${Spacing.md};
    
    @media (min-width: 768px) {
      padding-left: ${Spacing.lg};
      padding-right: ${Spacing.lg};
    }
  `;
}

/**
 * Generate flexbox layout with SwiftUI-like behavior
 */
export function flexLayout(
  direction: 'row' | 'column' = 'row',
  alignment: 'start' | 'center' | 'end' | 'stretch' = 'start',
  distribution: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'start',
  wrap: boolean = false
): string {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  };
  
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around'
  };
  
  return `
    display: flex;
    flex-direction: ${direction};
    align-items: ${alignMap[alignment]};
    justify-content: ${justifyMap[distribution]};
    flex-wrap: ${wrap ? 'wrap' : 'nowrap'};
    gap: ${Spacing.md};
  `;
}

// ============================================================================
// 8. DARK MODE UTILITIES
// ============================================================================

/**
 * Generate CSS variables for dark mode support
 */
export function darkModeVariables(): string {
  return `
    :root {
      --color-primary: ${Colors.primary};
      
      /* Light mode defaults */
      --color-background-primary: ${Colors.system.background.primary};
      --color-background-secondary: ${Colors.system.background.secondary};
      --color-label-primary: ${Colors.system.label.primary};
      --color-label-secondary: ${Colors.system.label.secondary};
      --color-separator: ${Colors.system.separator.opaque};
      --color-fill-primary: ${Colors.system.fill.primary};
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --color-background-primary: ${Colors.dark.system.background.primary};
        --color-background-secondary: ${Colors.dark.system.background.secondary};
        --color-label-primary: ${Colors.dark.system.label.primary};
        --color-label-secondary: ${Colors.dark.system.label.secondary};
        --color-separator: ${Colors.dark.system.separator.opaque};
        --color-fill-primary: ${Colors.dark.system.fill.primary};
      }
    }
  `;
}

// ============================================================================
// 9. EXPORT TYPE DEFINITIONS
// ============================================================================

export type ColorScheme = 'light' | 'dark' | 'auto';
export type TypographyStyle = keyof typeof Typography.styles;
export type SpacingSize = keyof typeof Spacing;
export type BorderRadius = keyof typeof Borders.radius;
export type AnimationDuration = keyof typeof Animations.duration;
export type ContentWidth = keyof typeof Sizes.content;

// Export everything
export default {
  Colors,
  Typography,
  Spacing,
  Borders,
  Animations,
  Sizes,
  springAnimation,
  pressedState,
  focusState,
  disabledState,
  responsiveContainer,
  flexLayout,
  darkModeVariables
};