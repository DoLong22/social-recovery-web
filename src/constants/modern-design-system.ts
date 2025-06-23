// Modern Design System with Vibrant Colors and Gradients
export const MODERN_COLORS = {
  // Primary Blue Palette
  primary: {
    50: '#E8F2FC',
    100: '#D1E5F9',
    200: '#A3CBF3',
    300: '#75B1ED',
    400: '#4797E7',
    500: '#3A86FF', // Main primary
    600: '#2E6FCC',
    700: '#2050D0',
    800: '#1A40A6',
    900: '#142F7A',
  },
  
  // Secondary Accent Colors
  accent: {
    green: {
      50: '#E8FCE8',
      100: '#D1F9D1',
      200: '#A3F3A3',
      300: '#75ED75',
      400: '#47E747',
      500: '#3CCF4E', // Main green
      600: '#30A63E',
      700: '#247D2E',
      800: '#1A5A21',
      900: '#0F3714',
    },
    orange: {
      50: '#FFF5E6',
      100: '#FFEACC',
      200: '#FFD599',
      300: '#FFC066',
      400: '#FFAB33',
      500: '#FF9900', // Main orange
      600: '#CC7A00',
      700: '#995C00',
      800: '#663D00',
      900: '#331F00',
    },
    purple: {
      50: '#F3E8FF',
      100: '#E6D1FF',
      200: '#CDA3FF',
      300: '#B475FF',
      400: '#9B47FF',
      500: '#8E44AD', // Main purple
      600: '#7236A6',
      700: '#56298C',
      800: '#3A1C5F',
      900: '#1E0F31',
    },
  },
  
  // Neutral Colors
  neutral: {
    50: '#FDFEFF',
    100: '#F8F8FA',
    200: '#F5F7F8',
    300: '#EEF2F5',
    400: '#D8DDE4',
    500: '#A8B2BD',
    600: '#777777',
    700: '#555555',
    800: '#333333',
    900: '#222222',
  },
  
  // Semantic Colors
  semantic: {
    success: '#3CCF4E',
    warning: '#FF9900',
    error: '#FF6666',
    info: '#3A86FF',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F8FA',
    tertiary: '#F0F8FF',
    modal: '#F8F8FA',
  },
};

// Gradient Definitions
export const GRADIENTS = {
  // Primary button gradient
  primaryButton: 'linear-gradient(135deg, #3A86FF 0%, #286FE0 100%)',
  
  // Secondary gradients
  greenButton: 'linear-gradient(135deg, #3CCF4E 0%, #30A63E 100%)',
  orangeButton: 'linear-gradient(135deg, #FF9900 0%, #CC7A00 100%)',
  
  // Background gradients
  radialBackground: 'radial-gradient(circle at center, #FDFEFF 0%, #F5F7F8 100%)',
  radialBackgroundBlue: 'radial-gradient(circle at center, #FDFEFF 0%, #E8F2FC 100%)',
  
  // Card gradients
  cardHover: 'linear-gradient(135deg, rgba(58, 134, 255, 0.05) 0%, rgba(58, 134, 255, 0.02) 100%)',
  
  // Header gradients
  modalHeader: 'linear-gradient(180deg, #F0F8FF 0%, #F8F8FA 100%)',
  
  // Shield gradient
  shieldGradient: 'linear-gradient(135deg, #3A86FF 0%, #2050D0 100%)',
  
  // Avatar gradients
  avatarPrimary: 'linear-gradient(135deg, #3A86FF 0%, #286FE0 100%)',
  avatarSecondary: 'linear-gradient(135deg, #3CCF4E 0%, #30A63E 100%)',
};

// Shadow Definitions
export const SHADOWS = {
  // Button shadows
  buttonPrimary: '0px 8px 15px rgba(58, 134, 255, 0.3)',
  buttonPrimaryHover: '0px 12px 20px rgba(58, 134, 255, 0.4)',
  
  // Card shadows
  cardSoft: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  cardMedium: '0px 6px 15px rgba(0, 0, 0, 0.08)',
  cardHover: '0px 8px 20px rgba(0, 0, 0, 0.1)',
  
  // Modal shadows
  modalSoft: '0px 10px 30px rgba(0, 0, 0, 0.1)',
  
  // Floating elements
  floating: '0px 4px 20px rgba(0, 0, 0, 0.15)',
};

// Animation Durations
export const ANIMATIONS = {
  // Micro-interactions
  micro: '150ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  
  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
};

// Typography with modern styling
export const MODERN_TYPOGRAPHY = {
  // Font families
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },
  
  // Font sizes with line heights
  sizes: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '30px' },
    '2xl': { size: '24px', lineHeight: '36px' },
    '3xl': { size: '30px', lineHeight: '42px' },
    '4xl': { size: '36px', lineHeight: '48px' },
  },
  
  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
};

// Spacing system
export const MODERN_SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
};

// Border radius
export const MODERN_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};