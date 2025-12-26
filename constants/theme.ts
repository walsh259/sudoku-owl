// Light mode colors - warm owl-themed colors
export const lightColors = {
  // Primary colors
  primary: '#8B4513', // Saddle brown (owl color)
  primaryLight: '#A0522D', // Sienna
  primaryDark: '#654321', // Dark brown

  // Background colors
  background: '#F5E6D3', // Warm cream
  surface: '#FFFFFF',
  surfaceVariant: '#FFF8F0',

  // Cell colors
  cell: '#FFFFFF',
  cellGiven: '#F0E6D8', // Slightly tinted for given numbers
  cellSelected: '#FFE4B5', // Moccasin - warm yellow
  cellSameRegion: '#FFF8DC', // Cornsilk - light highlight
  cellHighlighted: '#98FB98', // Pale green for hints
  cellError: '#FFB6C1', // Light pink for errors
  cellSameNumber: '#C5CAE9', // Light indigo - more visible highlight for same numbers

  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textGiven: '#1A1A1A', // Bold for given numbers
  textEntered: '#4169E1', // Royal blue for user-entered
  textCandidate: '#888888',
  textError: '#DC143C', // Crimson for errors

  // Grid lines
  gridLine: '#CCCCCC',
  gridLineThick: '#8B4513', // Brown for 3x3 borders

  // Button colors
  buttonPrimary: '#8B4513',
  buttonSecondary: '#D2B48C', // Tan
  buttonText: '#FFFFFF',
  buttonTextSecondary: '#654321',
  buttonDisabled: '#D3D3D3',
  buttonTextDisabled: '#A0A0A0',

  // Status colors
  success: '#228B22', // Forest green
  warning: '#DAA520', // Goldenrod
  error: '#DC143C', // Crimson

  // Timer
  timerBackground: '#654321',
  timerText: '#FFFFFF',

  // Number pad
  numberCompleted: '#E0E0E0',
  numberCompletedText: '#A0A0A0',
};

// Night mode colors - dark owl-themed colors
export const darkColors = {
  // Primary colors
  primary: '#D4A574', // Light tan/brown
  primaryLight: '#E8C4A0',
  primaryDark: '#8B6914',

  // Background colors
  background: '#1A1A2E', // Deep navy
  surface: '#2D2D44', // Dark purple-grey
  surfaceVariant: '#252538',

  // Cell colors
  cell: '#2D2D44',
  cellGiven: '#3D3D54', // Slightly lighter for given numbers
  cellSelected: '#5A5A7A', // Brighter purple-grey selection
  cellSameRegion: '#353548', // Subtle highlight
  cellHighlighted: '#2E5A3E', // Dark green for hints
  cellError: '#5A2D3A', // Dark red for errors
  cellSameNumber: '#4A4A7A', // More visible purple/blue for same number highlight

  // Text colors
  text: '#E8E8E8',
  textSecondary: '#A0A0A0',
  textGiven: '#FFFFFF', // Bright for given numbers
  textEntered: '#7BA7E8', // Light blue for user-entered
  textCandidate: '#888888',
  textError: '#FF6B7A', // Light red for errors

  // Grid lines
  gridLine: '#4A4A5A',
  gridLineThick: '#D4A574', // Gold/tan for 3x3 borders

  // Button colors
  buttonPrimary: '#D4A574',
  buttonSecondary: '#4A4A6A',
  buttonText: '#1A1A2E',
  buttonTextSecondary: '#E8E8E8',
  buttonDisabled: '#3A3A4A',
  buttonTextDisabled: '#6A6A7A',

  // Status colors
  success: '#4CAF50', // Bright green
  warning: '#FFC107', // Amber
  error: '#FF5252', // Bright red

  // Timer
  timerBackground: '#D4A574',
  timerText: '#1A1A2E',

  // Number pad
  numberCompleted: '#3A3A4A',
  numberCompletedText: '#6A6A7A',
};

// Export current theme (will be selected dynamically)
export type ThemeColors = typeof lightColors;

// Default export for backwards compatibility
export const colors = lightColors;

// Spacing and sizing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Font sizes
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  cellValue: 28,
  cellCandidate: 9,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Grid dimensions (calculated based on screen)
export const gridConfig = {
  cellsPerRow: 9,
  boxSize: 3,
  thinBorder: 1,
  thickBorder: 2,
};

// Helper function to get colors based on night mode
export function getColors(nightMode: boolean): ThemeColors {
  return nightMode ? darkColors : lightColors;
}
