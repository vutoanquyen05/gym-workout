import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  useWorkouts,
  WorkoutPlanCard,
  WorkoutPlanForm,
  WorkoutSessionCard,
  type WorkoutPlanWithMeta,
} from '@/modules/workouts';
import { AppText } from '@/shared/design-system/components/app-text';
import { Button } from '@/shared/design-system/components/button';
import { FeedbackState } from '@/shared/design-system/components/feedback-state';
import { Screen } from '@/shared/design-system/components/screen';
import { SpacingTokens } from '@/shared/design-system/spacing';

export default function WorkoutsRoute() {
  const {
    workoutPlans,
    recentSessions,
    isLoading,
    error,
    createPlan,
    refresh,
  } = useWorkouts();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activePlan, setActivePlan] = useState<WorkoutPlanWithMeta | null>(null);

  const handleStartWorkout = (plan: WorkoutPlanWithMeta) => {
    setActivePlan(plan);
  };

  return (
    <Screen testID="workouts-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {/* Header với Tiêu đề và Nút Thêm mới */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <AppText variant="h1">Giáo án của tôi</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Quản lý kế hoạch tập luyện cá nhân 100% ngoại tuyến trên thiết bị.
            </AppText>
          </View>
          <Button
            label="+ Thêm"
            size="compact"
            variant="primary"
            onPress={() => setIsFormVisible(true)}
            testID="open-add-plan-button"
          />
        </View>

        {/* Trạng thái Loading hoặc Lỗi */}
        {isLoading ? (
          <FeedbackState
            variant="loading"
            title="Đang tải kế hoạch tập luyện..."
            description="Đang đọc dữ liệu từ cơ sở dữ liệu SQLite ngoại tuyến."
          />
        ) : error ? (
          <FeedbackState
            variant="error"
            title="Không thể tải kế hoạch tập luyện"
            description={error.message}
            action={<Button label="Thử lại" onPress={refresh} />}
          />
        ) : (
          <View style={styles.mainContent}>
            {/* THÔNG BÁO BẮT ĐẦU BUỔI TẬP (NẾU ĐÃ CHỌN GIÁO ÁN) */}
            {activePlan ? (
              <View testID="active-plan-banner" style={styles.activeBanner}>
                <AppText variant="label" color="brandPrimary">
                  ĐANG CHUẨN BỊ TẬP: {activePlan.name}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  Module theo dõi buổi tập (Workout Tracker) sẽ được kích hoạt tại Phase tiếp theo.
                </AppText>
              </View>
            ) : null}

            {/* SECTION 1: DANH SÁCH GIÁO ÁN */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="h2">Danh sách giáo án</AppText>
                <AppText variant="caption" color="textSecondary">
                  {workoutPlans.length} kế hoạch
                </AppText>
              </View>

              {workoutPlans.length === 0 ? (
                <FeedbackState
                  variant="empty"
                  title="Chưa có giáo án nào"
                  description="Hãy tạo giáo án tập luyện đầu tiên của bạn để bắt đầu."
                  action={
                    <Button
                      label="Thêm giáo án"
                      variant="primary"
                      onPress={() => setIsFormVisible(true)}
                    />
                  }
                />
              ) : (
                <View style={styles.cardList}>
                  {workoutPlans.map((item) => (
                    <WorkoutPlanCard
                      key={item.id}
                      plan={item}
                      onStartWorkout={handleStartWorkout}
                      testID={`plan-item-${item.id}`}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* SECTION 2: LỊCH SỬ TẬP LUYỆN GẦN ĐÂY */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="h2">Lịch sử tập luyện gần đây</AppText>
                <AppText variant="caption" color="textSecondary">
                  {recentSessions.length > 0 ? `${recentSessions.length} buổi gần nhất` : '0 buổi'}
                </AppText>
              </View>

              {recentSessions.length === 0 ? (
                <FeedbackState
                  variant="empty"
                  title="Chưa có buổi tập nào hoàn thành"
                  description="Bắt đầu một giáo án tập luyện phía trên để ghi nhận lịch sử vào SQLite."
                />
              ) : (
                <View style={styles.cardList}>
                  {recentSessions.map((item) => (
                    <WorkoutSessionCard
                      key={item.id}
                      session={item}
                      testID={`session-item-${item.id}`}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Modal Form tạo giáo án mới */}
      <WorkoutPlanForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={async (input) => {
          await createPlan(input);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: SpacingTokens.space8,
    gap: SpacingTokens.space5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SpacingTokens.space4,
    width: '100%',
    marginTop: Platform.OS === 'web' ? SpacingTokens.space2 : 0,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  mainContent: {
    gap: SpacingTokens.space6,
  },
  activeBanner: {
    padding: SpacingTokens.space3,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  section: {
    gap: SpacingTokens.space3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardList: {
    gap: SpacingTokens.space3,
  },
});
