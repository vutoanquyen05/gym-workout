import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/shared/design-system/theme-provider';
import { SizeTokens } from '@/shared/design-system/sizes';

export type IconButtonProps = Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> & {
  accessibilityLabel: string;
  icon: (color: string) => ReactNode;
  onPress: NonNullable<PressableProps['onPress']>;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  accessibilityLabel,
  icon,
  onPress,
  variant = 'ghost',
  disabled = false,
  style,
  ...pressableProps
}: IconButtonProps) {
  const { colors, scheme } = useAppTheme();
  const backgroundColor =
    variant === 'primary'
      ? colors.brandPrimary
      : variant === 'secondary'
        ? colors.surfaceElevated
        : 'transparent';
  const iconColor =
    variant === 'primary'
      ? scheme === 'dark'
        ? colors.background
        : colors.surface
      : colors.textPrimary;

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? colors.surfaceElevated : backgroundColor },
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}>
      {icon(disabled ? colors.textSecondary : iconColor)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SizeTokens.touchTargetMin,
    height: SizeTokens.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SizeTokens.touchTargetMin / 2,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
