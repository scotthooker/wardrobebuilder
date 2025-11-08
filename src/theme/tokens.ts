/**
 * Nordic Timber Theme - Design Tokens
 * Sophisticated Scandinavian-inspired design system
 * Combines deep forest greens, warm natural woods, and crisp slate tones
 * WCAG AAA compliant color palette for optimal accessibility
 */

/**
 * Light Mode - "Nordic Day"
 * Clean, fresh palette with natural warmth and professional depth
 */
export const lightMode = {
  // Primary - Forest Pine: Deep evergreen with natural warmth
  primary: {
    50: '#f0f6f3',
    100: '#e0eee8',
    200: '#c1dcd1',
    300: '#93c2af',
    400: '#5da289',
    500: '#2c7c5f', // Main brand color - accessible on white
    600: '#236850',
    700: '#1b5240',
    800: '#143d30',
    900: '#0e2921',
  },

  // Secondary - Warm Oak: Honey-toned natural wood
  secondary: {
    50: '#fcf9f4',
    100: '#f8f2e9',
    200: '#f1e4d3',
    300: '#ead5ba',
    400: '#ddbc94',
    500: '#c49a6c', // Warm accent tone
    600: '#a88057',
    700: '#8b6743',
    800: '#6c4f31',
    900: '#4b3621',
  },

  // Accent - Nordic Slate: Cool blue-grey with depth
  accent: {
    50: '#f4f7fa',
    100: '#e8eff4',
    200: '#d1deea',
    300: '#afc7db',
    400: '#81a5c4',
    500: '#4c77a1', // Crisp accent - pairs with primary
    600: '#3d638a',
    700: '#2f4e70',
    800: '#233a54',
    900: '#182739',
  },

  // Backgrounds and Surfaces
  background: '#f3f5f7',      // Slightly darker grey for depth
  surface: '#ffffff',         // Pure white
  surfaceElevated: '#fdfeFF', // Slight blue tint for depth

  // Text
  textPrimary: '#171f26',     // Deep charcoal - AAA contrast
  textSecondary: '#475560',   // Medium grey - AA+ contrast
  textTertiary: '#6b7d8c',    // Light grey - for hints

  // Borders
  border: '#e2e8ed',          // Subtle grey
  borderStrong: '#cbd5de',    // Visible dividers

  // Semantic Colors
  success: {
    50: '#f1f7f3',
    100: '#e2efe7',
    200: '#c5dfcf',
    300: '#9dc9af',
    400: '#6dad89',
    500: '#2d7a4f', // Moss Green - WCAG AA compliant (4.5:1)
    600: '#2c744f',
    700: '#225b3e',
    800: '#19432e',
    900: '#112d1f',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#b45309', // Deep Amber - WCAG AA compliant (4.5:1)
    600: '#92400e',
    700: '#78350f',
    800: '#5c280b',
    900: '#441e08',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#dc2626', // Clay Red - WCAG AA compliant (4.5:1)
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#671818',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Nordic Sky - clear blue, accessible
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const

/**
 * Dark Mode - "Nordic Night"
 * Deep, sophisticated palette with luminous accents
 */
export const darkMode = {
  // Primary - Luminous Sage: Soft green with glow
  primary: {
    50: '#0e2921',
    100: '#143d30',
    200: '#1b5240',
    300: '#236850',
    400: '#3a8e6d',
    500: '#5ab38f', // Main brand - accessible on dark backgrounds
    600: '#7ac9ac',
    700: '#9ddac3',
    800: '#c1e8d9',
    900: '#e0f4ed',
  },

  // Secondary - Birch Glow: Warm cream undertones
  secondary: {
    50: '#4b3621',
    100: '#6c4f31',
    200: '#8b6743',
    300: '#a88057',
    400: '#c49a6c',
    500: '#ddbc94', // Warm highlight
    600: '#ead5ba',
    700: '#f1e4d3',
    800: '#f8f2e9',
    900: '#fcf9f4',
  },

  // Accent - Fjord Blue: Cool luminous accent
  accent: {
    50: '#182739',
    100: '#233a54',
    200: '#2f4e70',
    300: '#3d638a',
    400: '#5b89b4',
    500: '#81b0d6', // Bright accent for dark mode
    600: '#afd0e9',
    700: '#d1e6f3',
    800: '#e8f3fa',
    900: '#f4f9fd',
  },

  // Backgrounds and Surfaces
  background: '#0f171e',      // Deep navy-charcoal
  surface: '#17212b',         // Elevated slate
  surfaceElevated: '#202c39', // Higher elevation

  // Text
  textPrimary: '#f1f5f9',     // Soft white - AAA contrast
  textSecondary: '#cbd5e0',   // Light grey - AA+ contrast
  textTertiary: '#94a3b1',    // Muted grey

  // Borders
  border: '#2d3c4b',          // Subtle dark border
  borderStrong: '#475569',    // Visible dividers

  // Semantic Colors
  success: {
    50: '#112d1f',
    100: '#19432e',
    200: '#225b3e',
    300: '#2c744f',
    400: '#489a6f',
    500: '#6ec498', // Aurora Green - luminous
    600: '#9ddab8',
    700: '#c5e8d5',
    800: '#e2f4ec',
    900: '#f1faf6',
  },

  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#fb923c',
    500: '#fdba74', // Golden Glow - warm amber
    600: '#fed7aa',
    700: '#feebcb',
    800: '#fff7e4',
    900: '#fffcf2',
  },

  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef5555',
    500: '#f88b8b', // Rose Ember - soft red glow
    600: '#fcb3b3',
    700: '#fed2d2',
    800: '#fee9e9',
    900: '#fff5f5',
  },

  info: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#60a5fa',
    500: '#93c5fd', // Ice Blue - luminous sky blue
    600: '#bfdbfe',
    700: '#dbeafe',
    800: '#eff6ff',
    900: '#f8faff',
  },
} as const

/**
 * Typography - Professional carpentry aesthetic
 */
export const typography = {
  fontFamily: {
    display: ['Montserrat', 'system-ui', 'sans-serif'],    // Headers - geometric precision
    body: ['Inter', 'system-ui', 'sans-serif'],            // Body - readable neutrality
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'], // Measurements
  },
  fontSize: {
    xs: '0.75rem',      // 12px - small labels
    sm: '0.875rem',     // 14px - secondary text
    base: '1rem',       // 16px - body text
    lg: '1.125rem',     // 18px - emphasized text
    xl: '1.25rem',      // 20px - small headings
    '2xl': '1.5rem',    // 24px - medium headings
    '3xl': '1.875rem',  // 30px - large headings
    '4xl': '2.25rem',   // 36px - display headings
    '5xl': '3rem',      // 48px - hero text
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,      // Body emphasis, subheaders
    semibold: 600,    // Main headers
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,      // Headers
    normal: 1.5,      // Body text
    relaxed: 1.75,    // Long-form content
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

/**
 * Spacing - 4px base grid system
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const

/**
 * Border Radius - Clean, professional edges
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px - tight corners
  DEFAULT: '0.25rem', // 4px - standard
  md: '0.375rem',     // 6px - soft corners
  lg: '0.5rem',       // 8px - cards
  xl: '0.75rem',      // 12px - panels
  '2xl': '1rem',      // 16px - large cards
  '3xl': '1.5rem',    // 24px - hero sections
  full: '9999px',     // Circles
} as const

/**
 * Shadows - Subtle depth with Nordic elegance
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  premium: '0 10px 40px rgba(44, 124, 95, 0.12), 0 2px 8px rgba(44, 124, 95, 0.06)', // Forest Pine glow
  premiumLg: '0 20px 60px rgba(44, 124, 95, 0.15), 0 4px 16px rgba(44, 124, 95, 0.08)',
  innerPremium: 'inset 0 2px 8px rgba(0, 0, 0, 0.08)',
  glowPrimary: '0 0 20px rgba(90, 179, 143, 0.3)',      // Sage green glow
  glowAccent: '0 0 20px rgba(129, 176, 214, 0.3)',      // Fjord blue glow
  none: 'none',
} as const

/**
 * Transitions - Smooth, professional animations
 */
export const transitions = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

/**
 * Z-Index - Layering system
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// Export types for type-safe access
export type LightMode = typeof lightMode
export type DarkMode = typeof darkMode
export type Typography = typeof typography
export type Spacing = typeof spacing
export type BorderRadius = typeof borderRadius
export type Shadows = typeof shadows
export type Transitions = typeof transitions
export type ZIndex = typeof zIndex
