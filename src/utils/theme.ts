export const colors = {
  // Facebook-inspired design system
  primary: '#1877F2', // Facebook Blue
  primaryForeground: '#FFFFFF', // White text on blue

  // Background colors - Facebook's light gray feed
  background: '#F0F2F5', // Facebook feed background
  foreground: '#050505', // Nearly black text

  // Card colors - clean white like FB posts
  card: '#FFFFFF', // Pure white cards
  cardForeground: '#050505', // Dark text on cards

  // Secondary: Facebook gray buttons
  secondary: '#E4E6EB', // Facebook secondary button gray
  secondaryForeground: '#050505', // Dark text on gray

  // Muted colors - Facebook grays
  muted: '#F0F2F5', // Light background gray
  mutedForeground: '#65676B', // Facebook secondary text gray

  // Accent: Facebook blue
  accent: '#1877F2', // Facebook blue accent
  accentForeground: '#FFFFFF', // White on blue

  // Border and input - Facebook style
  border: '#CCD0D5', // Facebook border gray
  input: '#F0F2F5', // Facebook input background

  // Destructive colors - Facebook red
  destructive: '#E41E3F', // Facebook red
  destructiveForeground: '#FFFFFF',

  // Additional Facebook colors
  hoverBlue: '#166FE5', // Darker blue for hover
  successGreen: '#42B72A', // Facebook success green
  linkBlue: '#385898', // Facebook link blue

  // Theme colors for SnapADeal - Facebook-inspired
  teal: '#1877F2', // Use Facebook blue
  yellow: '#42B72A', // Use success green
  pink: '#65676B', // Use muted gray

  // Dark mode colors - Facebook dark theme
  dark: {
    background: '#18191A', // Facebook dark background
    foreground: '#E4E6EB', // Light text
    card: '#242526', // Dark cards
    cardForeground: '#E4E6EB', // Light text on cards
    primary: '#2D88FF', // Lighter blue for dark mode
    primaryForeground: '#FFFFFF', // White text on blue
    secondary: '#3A3B3C', // Dark secondary
    secondaryForeground: '#E4E6EB', // Light text
    muted: '#3A3B3C', // Dark muted
    mutedForeground: '#B0B3B8', // Muted text
    accent: '#2D88FF', // Accent blue
    accentForeground: '#FFFFFF', // White on accent
    border: '#3E4042', // Dark borders
    input: '#3A3B3C', // Dark inputs
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
  sm: 6, // Facebook style
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
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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