import { FlatList, StyleSheet, View } from 'react-native';

import { StatCard, useProgress } from '@/modules/progress';
import { WorkoutSessionCard } from '@/modules/workouts';
import { AppText } from '@/shared/design-system/components/app-text';
import { Button } from '@/shared/design-system/components/button';
import { FeedbackState } from '@/shared/design-system/components/feedback-state';
import { Screen } from '@/shared/design-system/components/screen';
import { SpacingTokens } from '@/shared/design-system/spacing';

export default function ProgressRoute() {
  const { summary, recentSessions, isLoading, error, refresh } = useProgress();

  const hasData = summary.totalWorkouts > 0 || recentSessions.length > 0;

  return (
    <Screen testID="progress-screen">
      <FlatList
        data={hasData ? recentSessions : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionItem}>
            <WorkoutSessionCard session={item} testID={`recent-session-${item.id}`} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Tiêu đề màn hình */}
            <View style={styles.header}>
              <AppText variant="h1">Tiến trình</AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Thống kê chỉ số và lịch sử các buổi tập đã hoàn thành.
              </AppText>
            </View>

            {/* Trạng thái Loading */}
            {isLoading ? (
              <FeedbackState
                variant="loading"
                title="Đang tải dữ liệu tiến trình..."
                description="Đang tính toán thống kê từ SQLite ngoại tuyến."
              />
            ) : error ? (
              /* Trạng thái Lỗi */
              <FeedbackState
                variant="error"
                title="Không thể tải dữ liệu tiến trình"
                description={error.message}
                action={<Button label="Thử lại" onPress={refresh} />}
              />
            ) : !hasData ? (
              /* Trạng thái Rỗng */
              <FeedbackState
                variant="empty"
                title="Chưa có dữ liệu tiến trình"
                description="Hoàn thành các buổi tập đầu tiên để theo dõi số buổi tập, thời gian và tổng khối lượng nâng."
              />
            ) : (
              /* Khi có dữ liệu: Hiển thị Grid 3 StatCard & Tiêu đề Hoạt động gần đây */
              <View style={styles.content}>
                <View style={styles.statsSection}>
                  <View style={styles.sectionHeader}>
                    <AppText variant="h2">Tổng quan thống kê</AppText>
                    <AppText variant="caption" color="textSecondary">
                      Tất cả buổi tập đã hoàn thành
                    </AppText>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                      <View style={styles.statCardWrapper}>
                        <StatCard
                          icon="🏋️"
                          title="Tổng buổi tập"
                          value={summary.totalWorkouts}
                          unit="buổi"
                          testID="stat-total-workouts"
                        />
                      </View>
                      <View style={styles.statCardWrapper}>
                        <StatCard
                          icon="⏱️"
                          title="Thời gian tập"
                          value={summary.totalDurationMinutes}
                          unit="phút"
                          testID="stat-total-duration"
                        />
                      </View>
                    </View>

                    <StatCard
                      icon="⚡"
                      title="Tổng khối lượng đã nâng"
                      value={summary.totalVolumeKg}
                      unit="kg"
                      testID="stat-total-volume"
                    />
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <AppText variant="h2">Hoạt động gần đây</AppText>
                  <AppText variant="caption" color="textSecondary">
                    {recentSessions.length > 0 ? `${recentSessions.length} buổi gần nhất` : '0 buổi'}
                  </AppText>
                </View>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: SpacingTokens.space4,
    gap: SpacingTokens.space3,
  },
  headerContainer: {
    gap: SpacingTokens.space4,
    marginBottom: SpacingTokens.space2,
  },
  header: {
    gap: SpacingTokens.space1,
  },
  content: {
    gap: SpacingTokens.space4,
  },
  statsSection: {
    gap: SpacingTokens.space3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statsGrid: {
    gap: SpacingTokens.space3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SpacingTokens.space3,
  },
  statCardWrapper: {
    flex: 1,
  },
  sessionItem: {
    marginBottom: SpacingTokens.space2,
  },
});
