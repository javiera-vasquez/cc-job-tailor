// Design system constants for resume components
// Centralized design tokens to avoid circular imports
import tailwindColors from './libs/tailwind-colors';

// Modern theme design tokens
const modernTokens = {
  colors: {
    // Core brand colors
    primary: tailwindColors.zinc[900],
    accent: tailwindColors.rose[600],

    // Semantic colors
    darkGray: tailwindColors.zinc[800],
    mediumGray: tailwindColors.zinc[600],
    separatorGray: tailwindColors.zinc[400],

    // Full tailwind palette access
    ...tailwindColors,
  },
  typography: {
    text: {
      size: 9,
      fontFamily: 'Lato',
      lineHeight: 1.33,
    },
    title: {
      fontSize: 22,
      fontFamily: 'Lato Bold',
      textTransform: 'uppercase' as const,
      marginBottom: 2,
      lineHeight: 1.33,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Lato Bold',
      textTransform: 'capitalize' as const,
      marginBottom: 0,
      lineHeight: 1.33,
    },
    small: {
      fontSize: 9,
      lineHeight: 1.33,
    },
  },
  spacing: {
    columnWidth: 180,
    documentPadding: 42,
    pagePadding: 18,
    profileImageSize: 46,
    listItemSpacing: 4,
  },
};

// Classic theme design tokens (traditional, single-column layout)
const classicTokens = {
  colors: {
    // Traditional black text, no accent color
    primary: tailwindColors.zinc[900],
    accent: tailwindColors.zinc[900], // Same as primary for classic

    // Semantic colors
    darkGray: tailwindColors.zinc[800],
    mediumGray: tailwindColors.zinc[600],
    separatorGray: tailwindColors.zinc[900], // Darker separator for classic

    // Full tailwind palette access
    ...tailwindColors,
  },
  typography: {
    text: {
      size: 10,
      fontFamily: 'Lato',
      lineHeight: 1.4,
    },
    title: {
      fontSize: 11,
      fontFamily: 'Lato Bold',
      textTransform: 'uppercase' as const,
      marginBottom: 4,
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: 11,
      fontFamily: 'Lato Bold',
      textTransform: 'none' as const,
      marginBottom: 2,
      lineHeight: 1.2,
    },
    small: {
      fontSize: 9,
      lineHeight: 1.4,
    },
  },
  spacing: {
    columnWidth: 0, // Single column layout
    documentPadding: 50,
    pagePadding: 12,
    profileImageSize: 0, // No profile image in classic
    listItemSpacing: 3,
  },
};

// Shared tokens for common values across all themes
const sharedTokens = {
  colors: {
    ...tailwindColors,
  },
  typography: {
    text: {
      fontFamily: 'Lato',
    },
  },
  spacing: {
    documentPadding: 42,
  },
};

// Namespace export pattern
export const tokens = {
  modern: modernTokens,
  classic: classicTokens,
  shared: sharedTokens,
} as const;

// Legacy exports for backward compatibility (will be removed after migration)
export const colors = modernTokens.colors;
export const typography = modernTokens.typography;
export const spacing = modernTokens.spacing;
