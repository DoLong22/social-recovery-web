export const VIBRANT_COLORS = {
  // Primary Electric Colors
  electricBlue: '#00A3FF',
  deepViolet: '#6A0DAD',
  cosmicNavy: '#1A0033',
  glowGreen: '#39FF14',
  neonPurple: '#A300FF',
  radiantOrange: '#FF7F00',
  
  // Secondary Colors
  electricTeal: '#00CED1',
  vibrantCerulean: '#007BFF',
  electricIndigo: '#5E00FF',
  vibrantEmerald: '#00E676',
  electricLime: '#6EFF00',
  sunsetRed: '#FF4500',
  vibrantScarlet: '#FF4D4D',
  electricYellow: '#FFD700',
  
  // Background & Text Colors
  darkCarbon: '#1A1A1A',
  softWhite: '#E0E0E0',
  pureWhite: '#FFFFFF',
  lightGrey: '#F8F8FA',
  coolBlueGrey: '#EFEFF5',
  
  // Semantic Colors
  success: {
    light: '#E8FCE8',
    main: '#00C853',
    dark: '#006400',
  },
  warning: {
    light: '#FFF8E1',
    main: '#FFB300',
    dark: '#FF6F00',
  },
  error: {
    light: '#FFEEEE',
    main: '#FF4D4D',
    dark: '#990000',
  },
  info: {
    light: '#E0FFFF',
    main: '#00CED1',
    dark: '#008B8B',
  },
};

export const VIBRANT_GRADIENTS = {
  // Hero Gradients
  cosmicNebula: 'radial-gradient(circle at center, #00A3FF 0%, #6A0DAD 50%, #1A0033 100%)',
  
  // Button Gradients
  primaryAction: 'linear-gradient(135deg, #007BFF 0%, #5E00FF 100%)',
  ctaOrange: 'linear-gradient(135deg, #FF7F00 0%, #A300FF 100%)',
  
  // Card Gradients
  emailType: 'linear-gradient(135deg, #00A3FF 0%, #6A0DAD 100%)',
  phoneType: 'linear-gradient(135deg, #00E676 0%, #6EFF00 100%)',
  walletType: 'linear-gradient(135deg, #FF7F00 0%, #FF4500 100%)',
  
  // Status Gradients
  successGradient: 'linear-gradient(135deg, #00E676 0%, #6EFF00 100%)',
  warningGradient: 'linear-gradient(135deg, #FFB300 0%, #FF6F00 100%)',
  
  // Background Gradients
  modalHeader: 'linear-gradient(135deg, #F0F8FF 0%, #FFFFFF 100%)',
  lightBackground: 'linear-gradient(180deg, #F8F8FA 0%, #EFEFF5 100%)',
  
  // Shield Gradients
  shieldCore: 'linear-gradient(135deg, #39FF14 0%, #00A3FF 100%)',
  
  // Text Gradients
  headlineGradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
};

export const VIBRANT_SHADOWS = {
  // Glowing Shadows (reduced intensity)
  primaryGlow: '0px 4px 12px rgba(0, 123, 255, 0.2), 0px 2px 6px rgba(94, 0, 255, 0.15)',
  successGlow: '0px 4px 12px rgba(0, 230, 118, 0.2), 0px 2px 6px rgba(110, 255, 0, 0.15)',
  warningGlow: '0px 4px 12px rgba(255, 127, 0, 0.2), 0px 2px 6px rgba(255, 69, 0, 0.15)',
  
  // Card Shadows (more subtle)
  cardFloat: '0px 4px 12px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.04)',
  cardHover: '0px 8px 20px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.04)',
  
  // Colored Shadows (reduced)
  blueGlow: '0px 4px 12px rgba(0, 163, 255, 0.15)',
  purpleGlow: '0px 4px 12px rgba(163, 0, 255, 0.15)',
  greenGlow: '0px 4px 12px rgba(57, 255, 20, 0.15)',
  orangeGlow: '0px 4px 12px rgba(255, 127, 0, 0.15)',
};

export const VIBRANT_TYPOGRAPHY = {
  fonts: {
    display: "'Montserrat', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sizes: {
    hero: {
      size: '3.5rem',
      lineHeight: '1.1',
      mobile: '2.5rem',
    },
    display: {
      size: '2.5rem',
      lineHeight: '1.2',
      mobile: '2rem',
    },
    headline: {
      size: '1.875rem',
      lineHeight: '1.3',
      mobile: '1.5rem',
    },
    title: {
      size: '1.5rem',
      lineHeight: '1.4',
      mobile: '1.25rem',
    },
    body: {
      size: '1rem',
      lineHeight: '1.6',
    },
    small: {
      size: '0.875rem',
      lineHeight: '1.5',
    },
  },
  weights: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
};

export const VIBRANT_ANIMATIONS = {
  // Transition timings
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  
  // Easing functions
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  elasticOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Common animations
  glow: `
    @keyframes glow {
      0% { opacity: 0.8; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  float: `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `,
  sparkle: `
    @keyframes sparkle {
      0% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0); }
    }
  `,
};

export const VIBRANT_SPACING = {
  // Consistent spacing scale
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const VIBRANT_BORDER_RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};