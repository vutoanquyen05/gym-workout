import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';

export type CardProps = {
  children: ReactNode;
  variant?: 'surface' | 'elevated';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'surface', style }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'elevated' ? colors.surfaceElevated : colors.surface,
          borderColor: colors.surfaceElevated,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SpacingTokens.space2,
    padding: SpacingTokens.space4,
    borderWidth: 1,
    borderRadius: RadiusTokens.card,
  },
});
