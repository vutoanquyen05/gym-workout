import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { Card } from '@/shared/design-system/components/card';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';

export type StatCardProps = {
  title: string;
  value: number | string;
  unit?: string;
  icon?: string | ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ title, value, unit, icon, testID, style }: StatCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString('vi-VN') : value;

  return (
    <Card variant="surface" style={[styles.card, style]}>
      <View testID={testID} style={styles.content}>
        <View style={styles.headerRow}>
          {typeof icon === 'string' ? (
            <AppText variant="caption" style={styles.icon}>
              {icon}
            </AppText>
          ) : (
            icon
          )}
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {title}
          </AppText>
        </View>

        <View style={styles.valueRow}>
          <AppText
            variant="display"
            color="textPrimary"
            style={styles.valueText}
            testID={testID ? `${testID}-value` : undefined}>
            {displayValue}
          </AppText>
          {unit ? (
            <AppText
              variant="bodySmall"
              color="brandPrimary"
              style={styles.unitText}
              testID={testID ? `${testID}-unit` : undefined}>
              {unit}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SpacingTokens.space3,
    borderRadius: RadiusTokens.card,
  },
  content: {
    gap: SpacingTokens.space2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingTokens.space1,
  },
  icon: {
    fontSize: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SpacingTokens.space1,
  },
  valueText: {
    fontWeight: '700',
  },
  unitText: {
    fontWeight: '600',
  },
});

