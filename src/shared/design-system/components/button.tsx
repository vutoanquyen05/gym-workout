import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SizeTokens } from '@/shared/design-system/sizes';
import { SpacingTokens } from '@/shared/design-system/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'regular' | 'compact';

export type ButtonProps = Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> & {
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  accessibilityLabel,
  style,
  ...pressableProps
}: ButtonProps) {
  const { colors, scheme } = useAppTheme();
  const isUnavailable = disabled || loading;
  const foregroundColor = scheme === 'dark' ? colors.background : colors.surface;
  const labelColor =
    variant === 'primary'
      ? foregroundColor
      : variant === 'destructive'
        ? colors.danger
        : colors.textPrimary;
  const backgroundColor =
    variant === 'primary'
      ? colors.brandPrimary
      : variant === 'secondary'
        ? colors.surfaceElevated
        : 'transparent';
  const borderColor =
    variant === 'outline'
      ? colors.textSecondary
      : variant === 'destructive'
        ? colors.danger
        : 'transparent';

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isUnavailable, busy: loading }}
      disabled={isUnavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' ? styles.compact : styles.regular,
        { backgroundColor, borderColor },
        variant === 'outline' || variant === 'destructive' ? styles.outlined : null,
        isUnavailable
          ? { backgroundColor: colors.surfaceElevated, borderColor: colors.surfaceElevated }
          : null,
        pressed && !isUnavailable ? styles.pressed : null,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isUnavailable ? colors.textSecondary : labelColor} />
        ) : (
          leadingIcon
        )}
        <AppText
          variant="label"
          color={isUnavailable ? 'textSecondary' : undefined}
          style={[styles.label, !isUnavailable ? { color: labelColor } : null]}>
          {label}
        </AppText>
        {!loading && trailingIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SizeTokens.touchTargetMin,
    borderWidth: 1,
    borderRadius: RadiusTokens.button,
    paddingHorizontal: SpacingTokens.space4,
  },
  regular: {
    minHeight: SizeTokens.buttonHeight,
  },
  compact: {
    minHeight: SizeTokens.touchTargetMin,
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SpacingTokens.space2,
  },
  label: {
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
