// Single source of truth for the brand palette.
// The five brand colours are the *500* steps (cocoa is *900*); everything else
// is a lighter or darker step of the same family, used for borders, hover
// states and tinted surfaces. theme.js turns these into CSS variables.

export const brand = {
  caramel: '#96745A',
  cream: '#F7F1E8',
  rose: '#B88C82',
  gold: '#B58A3A',
  cocoa: '#49352F',
};

export const palette = {
  cream: {
    50: '#FBF7F0',
    100: '#F7F1E8',
    200: '#EEE4D5',
    300: '#E2D3BE',
    400: '#D3C0A5',
  },
  caramel: {
    50: '#F4ECE6',
    100: '#E8DAD0',
    200: '#D5BFAF',
    300: '#C2A28B',
    400: '#AB866B',
    500: '#96745A',
    600: '#86654C',
    700: '#7A5C46',
    800: '#5F4636',
  },
  rose: {
    100: '#F0DFDA',
    200: '#E3C8C1',
    300: '#D3AEA5',
    400: '#C69C92',
    500: '#B88C82',
    600: '#A07268',
    700: '#85584F',
  },
  gold: {
    100: '#F0E5C9',
    200: '#E4D2A8',
    300: '#D3B97E',
    400: '#C4A05A',
    500: '#B58A3A',
    600: '#9C7430',
    700: '#7E5C24',
  },
  cocoa: {
    600: '#7C645A',
    700: '#6B5248',
    900: '#49352F',
  },
};

// Semantic roles used by the stylesheets.
export const roles = {
  bg: palette.cream[100],
  surface: palette.cream[50],
  surfaceTint: palette.cream[200],
  ink: palette.cocoa[900],
  inkSoft: palette.cocoa[700],
  inkFaint: palette.cocoa[600],
  accent: palette.caramel[600],
  accentStrong: palette.caramel[700],
  gold: palette.gold[500],
  goldText: palette.gold[700],
  rose: palette.rose[500],
  roseTint: palette.rose[100],
};
