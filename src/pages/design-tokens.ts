// Design system constants for resume components
// Centralized design tokens to avoid circular imports
import tailwindColors from '../libs/tailwind-colors';

// Design system colors with support for accent and primary color configuration
export const colors = {
  // Core brand colors - these can be customized
  primary: tailwindColors.zinc[900],        // Primary text and elements
  accent: tailwindColors.rose[600],     // Accent color for highlights and links
  
  // Semantic colors mapped to tailwind palette
  darkGray: tailwindColors.zinc[800],     // Dark gray - content text  
  mediumGray: tailwindColors.zinc[600],   // Medium gray - secondary text
  separatorGray: tailwindColors.zinc[400], // Separator lines
  
  // Full tailwind palette access
  ...tailwindColors,
};

// Typography scales (can be extended in the future)
export const typography = {
  text: {
    size: 9,
    fontFamily: 'Lato',
    lineHeight: 1.33,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Lato Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
    lineHeight: 1.33,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lato Bold',
    textTransform: 'capitalize',
    marginBottom: 0,
    lineHeight: 1.33,
  },
  small: {
    fontSize: 9,
    lineHeight: 1.33,
  },
};

// Spacing scales (can be extended in the future)
export const spacing = {
  columnWidth: 180,
  documentPadding: 42,
  pagePadding: 18,
  profileImageSize: 46,
  // Could add consistent spacing values here
};