import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';

export type FeedbackStateVariant =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'offline'
  | 'disabled'
  | 'unsynced'
  | 'saving';

export type FeedbackStateProps = {
  variant: FeedbackStateVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const variantLabels: Record<FeedbackStateVariant, string> = {
  loading: 'Đang tải',
  success: 'Hoàn tất',
  empty: 'Chưa có dữ liệu',
  error: 'Đã xảy ra lỗi',
  offline: 'Đang ngoại tuyến',
  disabled: 'Hiện không khả dụng',
  unsynced: 'Chưa đồng bộ',
  saving: 'Đang lưu',
};

export function FeedbackState({
  variant,
  title,
  description,
  action,
  style,
}: FeedbackStateProps) {
  const { colors } = useAppTheme();
  const accentColor =
    variant === 'success'
      ? colors.success
      : variant === 'error'
        ? colors.danger
        : variant === 'loading' || variant === 'offline' || variant === 'unsynced' || variant === 'saving'
          ? colors.info
          : colors.textSecondary;
  const isProgressing = variant === 'loading' || variant === 'saving';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.surfaceElevated },
        style,
      ]}>
      <View style={styles.heading}>
        {isProgressing ? (
          <ActivityIndicator
            accessible
            accessibilityLabel={variantLabels[variant]}
            color={accentColor}
          />
        ) : (
          <View style={[styles.indicator, { backgroundColor: accentColor }]} />
        )}
        <AppText variant="label" color="textSecondary">
          {variantLabels[variant]}
        </AppText>
      </View>
      <AppText variant="h3" accessibilityRole={variant === 'error' ? 'alert' : undefined}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SpacingTokens.space3,
    padding: SpacingTokens.space4,
    borderWidth: 1,
    borderRadius: RadiusTokens.card,
  },
  heading: {
    minHeight: SpacingTokens.space6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingTokens.space2,
  },
  indicator: {
    width: SpacingTokens.space2,
    height: SpacingTokens.space2,
    borderRadius: SpacingTokens.space1,
  },
  action: {
    alignItems: 'flex-start',
    marginTop: SpacingTokens.space1,
  },
});
