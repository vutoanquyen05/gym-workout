export const ColorTokens = {
  dark: {
    background: '#121417',
    surface: '#1C2025',
    surfaceElevated: '#292F36',
    textPrimary: '#F4F6F8',
    textSecondary: '#B0B8C2',
    brandPrimary: '#FF6B35',
    info: '#65BFFF',
    success: '#57D68D',
    danger: '#FF7777',
  },
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceElevated: '#E8ECF1',
    textPrimary: '#171A1F',
    textSecondary: '#525B66',
    brandPrimary: '#C94718',
    info: '#075EA8',
    success: '#167447',
    danger: '#B42318',
  },
} as const;

export type ThemeScheme = keyof typeof ColorTokens;
export type ColorToken = keyof (typeof ColorTokens)['light'];

export const Colors = {
  dark: {
    ...ColorTokens.dark,
    text: ColorTokens.dark.textPrimary,
    backgroundElement: ColorTokens.dark.surface,
    backgroundSelected: ColorTokens.dark.surfaceElevated,
  },
  light: {
    ...ColorTokens.light,
    text: ColorTokens.light.textPrimary,
    backgroundElement: ColorTokens.light.surface,
    backgroundSelected: ColorTokens.light.surfaceElevated,
  },
} as const;

export type ThemeColors = (typeof Colors)[ThemeScheme];
export type ThemeColor = keyof ThemeColors;
