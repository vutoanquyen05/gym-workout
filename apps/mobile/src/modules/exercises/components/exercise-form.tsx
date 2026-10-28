import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/shared/design-system/components/app-text';
import { Button } from '@/shared/design-system/components/button';
import { Input } from '@/shared/design-system/components/input';
import { useAppTheme } from '@/shared/design-system/theme-provider';
import { RadiusTokens } from '@/shared/design-system/radius';
import { SpacingTokens } from '@/shared/design-system/spacing';
import type { CreateExerciseInput } from '@/shared/storage/types';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from '../constants/muscle-groups';

export type ExerciseFormProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateExerciseInput) => Promise<void>;
};

const selectableMuscleGroups = MUSCLE_GROUPS.filter((g) => g !== 'Tất cả');
const selectableEquipments = EQUIPMENT_OPTIONS.filter((e) => e !== 'Tất cả');
const difficultyLevels = ['Cơ bản', 'Trung bình', 'Nâng cao'] as const;

export function ExerciseForm({ visible, onClose, onSubmit }: ExerciseFormProps) {
  const { colors } = useAppTheme();

  const [name, setName] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>(selectableMuscleGroups[0]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>(selectableEquipments[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(difficultyLevels[0]);
  const [instructions, setInstructions] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setSelectedMuscle(selectableMuscleGroups[0]);
    setSelectedEquipment(selectableEquipments[0]);
    setSelectedDifficulty(difficultyLevels[0]);
    setInstructions('');
    setNameError(undefined);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Tên bài tập không được để trống.');
      return;
    }

    try {
      setIsSubmitting(true);
      setNameError(undefined);
      await onSubmit({
        name: trimmedName,
        primaryMuscleGroup: selectedMuscle,
        equipment: selectedEquipment,
        difficulty: selectedDifficulty,
        instructions: instructions.trim() || null,
      });
      resetForm();
      onClose();
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Không thể tạo bài tập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      testID="exercise-form-modal">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <AppText variant="h2">Thêm bài tập mới</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Tạo bài tập tùy chỉnh và lưu trực tiếp vào cơ sở dữ liệu SQLite ngoại tuyến.
            </AppText>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Tên bài tập */}
            <Input
              label="Tên bài tập *"
              placeholder="VD: Incline Bench Press"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(undefined);
              }}
              error={nameError}
              testID="exercise-name-input"
            />

            {/* Nhóm cơ chính */}
            <View style={styles.section}>
              <AppText variant="label">Nhóm cơ chính *</AppText>
              <View style={styles.chipRow}>
                {selectableMuscleGroups.map((group) => {
                  const isSelected = selectedMuscle === group;
                  return (
                    <Pressable
                      key={group}
                      testID={`muscle-chip-${group}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedMuscle(group)}
                      style={[
                        styles.chip,
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
              </View>
            </View>

            {/* Thiết bị */}
            <View style={styles.section}>
              <AppText variant="label">Thiết bị</AppText>
              <View style={styles.chipRow}>
                {selectableEquipments.map((equip) => {
                  const isSelected = selectedEquipment === equip;
                  return (
                    <Pressable
                      key={equip}
                      testID={`equipment-chip-${equip}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedEquipment(equip)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? colors.brandPrimary
                            : colors.surfaceElevated,
                        },
                      ]}>
                      <AppText
                        variant="label"
                        color={isSelected ? 'background' : 'textPrimary'}>
                        {equip}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Độ khó */}
            <View style={styles.section}>
              <AppText variant="label">Độ khó</AppText>
              <View style={styles.chipRow}>
                {difficultyLevels.map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <Pressable
                      key={diff}
                      testID={`difficulty-chip-${diff}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedDifficulty(diff)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? colors.brandPrimary
                            : colors.surfaceElevated,
                        },
                      ]}>
                      <AppText
                        variant="label"
                        color={isSelected ? 'background' : 'textPrimary'}>
                        {diff}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Hướng dẫn tập */}
            <Input
              label="Hướng dẫn thực hiện"
              placeholder="VD: Hạ tạ có kiểm soát, giữ lưng thẳng..."
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              testID="exercise-instructions-input"
            />
          </ScrollView>

          <View style={styles.actionRow}>
            <Button
              label="Hủy"
              variant="outline"
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.flexButton}
              testID="cancel-exercise-button"
            />
            <Button
              label="Lưu bài tập"
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.flexButton}
              testID="submit-exercise-button"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  dialog: {
    maxHeight: '85%',
    borderTopLeftRadius: RadiusTokens.card,
    borderTopRightRadius: RadiusTokens.card,
    paddingHorizontal: SpacingTokens.space4,
    paddingTop: SpacingTokens.space4,
    paddingBottom: SpacingTokens.space6,
    gap: SpacingTokens.space4,
  },
  header: {
    gap: 4,
  },
  scrollContent: {
    gap: SpacingTokens.space4,
    paddingBottom: SpacingTokens.space2,
  },
  section: {
    gap: SpacingTokens.space2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingTokens.space2,
  },
  chip: {
    paddingHorizontal: SpacingTokens.space3,
    paddingVertical: 6,
    borderRadius: RadiusTokens.chip,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SpacingTokens.space3,
    paddingTop: SpacingTokens.space2,
  },
  flexButton: {
    flex: 1,
  },
});
