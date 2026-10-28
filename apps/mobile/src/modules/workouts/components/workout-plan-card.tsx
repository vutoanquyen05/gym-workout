import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { Button } from '@/shared/design-system/components/button';
import { Card } from '@/shared/design-system/components/card';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';
import type { WorkoutPlan } from '@/shared/storage/types';

export type WorkoutPlanWithMeta = WorkoutPlan & {
  exerciseCount?: number;
  assigned_by_pt_id?: string | null;
  assignedByPtId?: string | null;
};

export type WorkoutPlanCardProps = {
  plan: WorkoutPlanWithMeta;
  onPress?: (plan: WorkoutPlanWithMeta) => void;
  onStartWorkout?: (plan: WorkoutPlanWithMeta) => void;
  testID?: string;
};

export function WorkoutPlanCard({
  plan,
  onPress,
  onStartWorkout,
  testID,
}: WorkoutPlanCardProps) {
  const { colors } = useAppTheme();
  const isAssignedByPt = Boolean(plan.assigned_by_pt_id ?? plan.assignedByPtId);

  return (
    <Card
      variant="surface"
      style={styles.cardContainer}>
      <Pressable
        testID={testID ?? `workout-plan-card-${plan.id}`}
        accessibilityRole="button"
        accessibilityLabel={`Giáo án ${plan.name}`}
        onPress={() => onPress?.(plan)}
        style={styles.pressableContent}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <AppText variant="h3" numberOfLines={1} style={styles.titleText}>
              {plan.name}
            </AppText>
          </View>
          {isAssignedByPt ? (
            <View
              testID="pt-assigned-badge"
              style={[styles.ptBadge, { backgroundColor: colors.surfaceElevated }]}>
              <AppText variant="caption" color="brandPrimary" style={styles.badgeText}>
                Từ PT
              </AppText>
            </View>
          ) : null}
        </View>

        {plan.description ? (
          <AppText
            variant="bodySmall"
            color="textSecondary"
            numberOfLines={2}
            style={styles.description}>
            {plan.description}
          </AppText>
        ) : null}

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: colors.surfaceElevated }]}>
            <AppText variant="label" color="brandPrimary">
              {plan.exerciseCount != null ? `${plan.exerciseCount} bài tập` : 'Giáo án chuẩn'}
            </AppText>
          </View>
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <Button
          label="Bắt đầu tập"
          size="compact"
          variant="primary"
          onPress={() => onStartWorkout?.(plan)}
          testID={`start-workout-button-${plan.id}`}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    gap: SpacingTokens.space3,
    padding: SpacingTokens.space4,
  },
  pressableContent: {
    gap: SpacingTokens.space2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SpacingTokens.space2,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    flexShrink: 1,
  },
  ptBadge: {
    paddingHorizontal: SpacingTokens.space2,
    paddingVertical: 2,
    borderRadius: RadiusTokens.chip,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
  description: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingTokens.space2,
  },
  metaPill: {
    paddingHorizontal: SpacingTokens.space3,
    paddingVertical: 4,
    borderRadius: RadiusTokens.chip,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: SpacingTokens.space3,
  },
});
