import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { Card } from '@/shared/design-system/components/card';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';
import type { Exercise } from '@/shared/storage/types';

export type ExerciseCardProps = {
  exercise: Exercise & { isCustom?: boolean; is_custom?: boolean };
  onPress?: (exercise: Exercise) => void;
  testID?: string;
};

export function ExerciseCard({ exercise, onPress, testID }: ExerciseCardProps) {
  const { colors } = useAppTheme();
  const isCustom = Boolean(exercise.isCustom ?? exercise.is_custom);

  const content = (
    <Card variant="surface" style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <AppText variant="h3" numberOfLines={1} style={styles.titleText}>
            {exercise.name}
          </AppText>
        </View>
        {isCustom ? (
          <View
            testID="custom-badge"
            style={[styles.customBadge, { backgroundColor: colors.surfaceElevated }]}>
            <AppText variant="caption" color="brandPrimary" style={styles.badgeText}>
              Tùy chỉnh
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.tagsRow}>
        <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
          <AppText variant="label" color="brandPrimary">
            {exercise.primaryMuscleGroup}
          </AppText>
        </View>

        {exercise.equipment ? (
          <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
            <AppText variant="label" color="textSecondary">
              {exercise.equipment}
            </AppText>
          </View>
        ) : null}

        {exercise.difficulty ? (
          <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
            <AppText variant="label" color="textSecondary">
              {exercise.difficulty}
            </AppText>
          </View>
        ) : null}
      </View>

      {exercise.instructions ? (
        <AppText
          variant="bodySmall"
          color="textSecondary"
          numberOfLines={2}
          style={styles.instructions}>
          {exercise.instructions}
        </AppText>
      ) : null}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID ?? `exercise-card-${exercise.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${exercise.name}, nhóm cơ ${exercise.primaryMuscleGroup}`}
        onPress={() => onPress(exercise)}>
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID ?? `exercise-card-${exercise.id}`}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
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
  customBadge: {
    paddingHorizontal: SpacingTokens.space2,
    paddingVertical: 2,
    borderRadius: RadiusTokens.chip,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingTokens.space2,
  },
  pill: {
    paddingHorizontal: SpacingTokens.space3,
    paddingVertical: 4,
    borderRadius: RadiusTokens.chip,
  },
  instructions: {
    marginTop: 2,
  },
});
