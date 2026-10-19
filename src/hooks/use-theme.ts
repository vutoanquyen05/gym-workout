/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useAppTheme } from '@/shared/design-system/theme-provider';

export function useTheme() {
  return useAppTheme().colors;
}
