import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { Card } from '@/shared/design-system/components/card';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';
import type { WorkoutSession } from '@/shared/storage/types';

export type WorkoutSessionWithMeta = WorkoutSession & {
  durationMinutes?: number;
  totalSets?: number;
  totalVolumeKg?: number;
};

export type WorkoutSessionCardProps = {
  session: WorkoutSessionWithMeta;
  testID?: string;
};

export function WorkoutSessionCard({ session, testID }: WorkoutSessionCardProps) {
  const { colors } = useAppTheme();

  // Tính toán thời lượng nếu có startedAt và completedAt
  let duration = session.durationMinutes;
  if (duration == null && session.completedAt && session.startedAt) {
    const diffMs = new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
    duration = Math.max(1, Math.round(diffMs / 60000));
  }

  // Định dạng ngày hoàn thành
  const completedDateStr = session.completedAt
    ? new Date(session.completedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Chưa kết thúc';

  return (
    <Card
      variant="surface"
      style={styles.cardContainer}>
      <View testID={testID ?? `workout-session-card-${session.id}`} style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <AppText variant="h3" numberOfLines={1}>
              {session.title}
            </AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.surfaceElevated }]}>
            <AppText variant="caption" color="success" style={styles.badgeText}>
              Hoàn thành
            </AppText>
          </View>
        </View>

        <AppText variant="bodySmall" color="textSecondary">
          {completedDateStr}
        </AppText>

        <View style={styles.statsRow}>
          {duration != null ? (
            <View style={[styles.statChip, { backgroundColor: colors.surfaceElevated }]}>
              <AppText variant="label" color="textPrimary">
                ⏱️ {duration} phút
              </AppText>
            </View>
          ) : null}

          {session.totalSets != null ? (
            <View style={[styles.statChip, { backgroundColor: colors.surfaceElevated }]}>
              <AppText variant="label" color="textPrimary">
                📊 {session.totalSets} hiệp
              </AppText>
            </View>
          ) : null}

          {session.totalVolumeKg != null ? (
            <View style={[styles.statChip, { backgroundColor: colors.surfaceElevated }]}>
              <AppText variant="label" color="brandPrimary">
                ⚡ {session.totalVolumeKg} kg
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: SpacingTokens.space4,
  },
  content: {
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
  statusBadge: {
    paddingHorizontal: SpacingTokens.space2,
    paddingVertical: 2,
    borderRadius: RadiusTokens.chip,
  },
  badgeText: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingTokens.space2,
    marginTop: 2,
  },
  statChip: {
    paddingHorizontal: SpacingTokens.space3,
    paddingVertical: 4,
    borderRadius: RadiusTokens.chip,
  },
});
