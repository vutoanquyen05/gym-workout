import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SizeTokens } from '@/shared/design-system/sizes';
import { SpacingTokens } from '@/shared/design-system/spacing';
import { Typography } from '@/shared/design-system/typography';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
};

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.danger
    : focused
      ? colors.brandPrimary
      : colors.textSecondary;

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...textInputProps}
        accessibilityHint={accessibilityHint ?? error ?? helperText}
        accessibilityLabel={accessibilityLabel ?? label}
        allowFontScaling
        editable={editable}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.brandPrimary}
        style={[
          styles.input,
          {
            backgroundColor: editable ? colors.surface : colors.surfaceElevated,
            borderColor,
            color: editable ? colors.textPrimary : colors.textSecondary,
          },
          inputStyle,
        ]}
        underlineColorAndroid="transparent"
      />
      {error ? (
        <AppText variant="bodySmall" color="danger">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="bodySmall" color="textSecondary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SpacingTokens.space2,
  },
  input: {
    minHeight: SizeTokens.inputHeight,
    paddingHorizontal: SpacingTokens.space4,
    paddingVertical: SpacingTokens.space2,
    borderWidth: 1,
    borderRadius: RadiusTokens.input,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
  },
});
