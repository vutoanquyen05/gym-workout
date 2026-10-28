import { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  ExerciseCard,
  ExerciseForm,
  MUSCLE_GROUPS,
  useExercises,
} from '@/modules/exercises';
import { AppText } from '@/shared/design-system/components/app-text';
import { Button } from '@/shared/design-system/components/button';
import { FeedbackState } from '@/shared/design-system/components/feedback-state';
import { Input } from '@/shared/design-system/components/input';
import { Screen } from '@/shared/design-system/components/screen';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';

export default function ExercisesRoute() {
  const { colors } = useAppTheme();
  const {
    filteredExercises,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    createExercise,
    refresh,
  } = useExercises();

  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <Screen testID="exercises-screen">
      <View style={styles.container}>
        {/* Header với Tiêu đề và Nút Thêm bài tập */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <AppText variant="h1">Thư viện bài tập</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Quản lý và tra cứu bài tập ngoại tuyến 100% trên thiết bị.
            </AppText>
          </View>
          <Button
            label="+ Thêm"
            size="compact"
            variant="primary"
            onPress={() => setIsFormVisible(true)}
            testID="open-add-exercise-button"
          />
        </View>

        {/* Thanh tìm kiếm */}
        <Input
          label="Tìm kiếm bài tập"
          placeholder="Tìm theo tên, nhóm cơ hoặc thiết bị..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
          testID="exercise-search-input"
        />

        {/* Bộ lọc nhóm cơ (Chips cuộn ngang) */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            {MUSCLE_GROUPS.map((group) => {
              const isSelected = selectedMuscleGroup === group;
              return (
                <Pressable
                  key={group}
                  testID={`filter-chip-${group}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedMuscleGroup(group)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? colors.brandPrimary
                        : colors.surfaceElevated,
                    },
                  ]}>
                  <AppText
                    variant="label"
                    color={isSelected ? 'background' : 'textPrimary'}>
                    {group}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Nội dung danh sách / Trạng thái */}
        <View style={styles.content}>
          {isLoading ? (
            <FeedbackState
              variant="loading"
              title="Đang tải danh mục bài tập..."
              description="Đang đọc dữ liệu từ cơ sở dữ liệu SQLite ngoại tuyến."
            />
          ) : error ? (
            <FeedbackState
              variant="error"
              title="Không thể tải danh sách bài tập"
              description={error.message}
              action={<Button label="Thử lại" onPress={refresh} />}
            />
          ) : filteredExercises.length === 0 ? (
            <FeedbackState
              variant="empty"
              title="Không tìm thấy bài tập nào"
              description={
                searchQuery.trim() || selectedMuscleGroup !== 'Tất cả'
                  ? 'Không có bài tập phù hợp với bộ lọc hiện tại. Thử chọn nhóm cơ khác hoặc xóa từ khóa tìm kiếm.'
                  : 'Chưa có bài tập nào trong cơ sở dữ liệu. Nhấn nút bên dưới để tạo bài tập đầu tiên.'
              }
              action={
                searchQuery.trim() || selectedMuscleGroup !== 'Tất cả' ? (
                  <Button
                    label="Xóa bộ lọc"
                    variant="outline"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedMuscleGroup('Tất cả');
                    }}
                  />
                ) : (
                  <Button
                    label="Thêm bài tập"
                    variant="primary"
                    onPress={() => setIsFormVisible(true)}
                  />
                )
              }
            />
          ) : (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <ExerciseCard
                  exercise={item}
                  testID={`exercise-item-${item.id}`}
                />
              )}
            />
          )}
        </View>

        {/* Modal Form thêm bài tập mới */}
        <ExerciseForm
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          onSubmit={async (input) => {
            await createExercise({
              ...input,
            });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: SpacingTokens.space3,
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
  searchContainer: {
    marginBottom: 0,
  },
  filterSection: {
    paddingVertical: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SpacingTokens.space2,
  },
  filterChip: {
    paddingHorizontal: SpacingTokens.space3,
    paddingVertical: 6,
    borderRadius: RadiusTokens.chip,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SpacingTokens.space6,
  },
  separator: {
    height: SpacingTokens.space3,
  },
});
