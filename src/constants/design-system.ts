export const SPACING = {
  // Base spacing unit (4px)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '5rem',    // 80px
} as const;

export const TYPOGRAPHY = {
  // Font sizes with line heights
  xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px/16px
  sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px/20px
  base: { size: '1rem', lineHeight: '1.5rem' },     // 16px/24px
  lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px/28px
  xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px/28px
  '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px/32px
  '3xl': { size: '1.75rem', lineHeight: '2.25rem' },// 28px/36px
  '4xl': { size: '2rem', lineHeight: '2.5rem' },    // 32px/40px
} as const;

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const COLORS = {
  primary: {
    50: '#EBF3FF',
    100: '#D6E7FF',
    200: '#ADCFFF',
    300: '#85B7FF',
    400: '#5C9FFF',
    500: '#3A86FF',
    600: '#2E6FCC',
    700: '#225299',
    800: '#163566',
    900: '#0B1933',
  },
  gray: {
    50: '#F8F8F8',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  text: {
    primary: '#222222',
    secondary: '#555555',
    muted: '#888888',
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F8F8',
    tertiary: '#F5F5F5',
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
} as const;