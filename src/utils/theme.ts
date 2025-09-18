export const colors = {
  // Minimalist black and white professional theme
  primary: '#000000', // Pure black
  primaryForeground: '#FFFFFF', // Pure white

  // Background colors - clean white and black
  background: '#FFFFFF', // Pure white background
  foreground: '#000000', // Pure black text

  // Card colors - subtle grays
  card: '#FAFAFA', // Very light gray
  cardForeground: '#000000', // Black text on cards

  // Secondary: Clean gray tones
  secondary: '#F5F5F5', // Light gray
  secondaryForeground: '#000000', // Black on gray

  // Muted colors - professional grays
  muted: '#F9F9F9', // Very light gray
  mutedForeground: '#6B7280', // Medium gray for subtle text

  // Accent: Minimal contrast
  accent: '#000000', // Black accent
  accentForeground: '#FFFFFF', // White on black

  // Border and input - subtle grays
  border: '#E5E5E5', // Light gray borders
  input: '#FAFAFA', // Very light gray inputs

  // Destructive colors - clean red
  destructive: '#DC2626', // Clean red
  destructiveForeground: '#FFFFFF',

  // Theme colors for FindersKeepers - minimalist palette
  teal: '#000000', // Black instead of teal
  yellow: '#000000', // Black instead of yellow
  pink: '#6B7280', // Gray instead of pink

  // Dark mode colors - minimalist dark theme
  dark: {
    background: '#000000', // Pure black background
    foreground: '#FFFFFF', // Pure white text
    card: '#0A0A0A', // Very dark gray cards
    cardForeground: '#FFFFFF', // White text on cards
    primary: '#FFFFFF', // White primary in dark mode
    primaryForeground: '#000000', // Black text on white
    secondary: '#1A1A1A', // Dark gray secondary
    secondaryForeground: '#FFFFFF', // White text on dark gray
    muted: '#0F0F0F', // Very dark gray
    mutedForeground: '#A3A3A3', // Light gray for subtle text
    accent: '#FFFFFF', // White accent in dark mode
    accentForeground: '#000000', // Black text on white accent
    border: '#2A2A2A', // Dark gray borders
    input: '#1A1A1A', // Dark gray inputs
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Geometric design system values matching Next.js app
export const geometric = {
  // Clipping values for geometric shapes
  clipPaths: {
    default: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
    small: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
    accent: 'polygon(0 0, 100% 0, 100% 100%)',
  },

  // Animation timing
  animations: {
    pulse: {
      duration: 2000,
      easing: 'ease-in-out',
    },
    slide: {
      duration: 600,
      easing: 'ease-out',
    },
  },

  // Shadow values for geometric design
  geometricShadows: {
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  geometric,
};

export type Theme = typeof theme;