import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import type { CreatePlanInput } from '@/shared/storage/types';

export type WorkoutPlanFormProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePlanInput) => Promise<void>;
};

export function WorkoutPlanForm({ visible, onClose, onSubmit }: WorkoutPlanFormProps) {
  const { colors } = useAppTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
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
      setNameError('Tên giáo án không được để trống.');
      return;
    }

    try {
      setIsSubmitting(true);
      setNameError(undefined);
      await onSubmit({
        name: trimmedName,
        description: description.trim() || null,
      });
      resetForm();
      onClose();
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Không thể tạo giáo án.');
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
      testID="workout-plan-form-modal">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <AppText variant="h2">Tạo giáo án mới</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Thiết lập kế hoạch tập luyện cá nhân lưu trữ ngoại tuyến trên thiết bị.
            </AppText>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <Input
              label="Tên giáo án *"
              placeholder="VD: Push Pull Legs, Thân dưới tăng cơ..."
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(undefined);
              }}
              error={nameError}
              testID="plan-name-input"
            />

            <Input
              label="Mô tả / Ghi chú mục tiêu"
              placeholder="VD: 3 buổi/tuần, tập trung ngực và tay sau..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="plan-description-input"
            />
          </ScrollView>

          <View style={styles.actionRow}>
            <Button
              label="Hủy"
              variant="outline"
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.flexButton}
              testID="cancel-plan-button"
            />
            <Button
              label="Lưu giáo án"
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.flexButton}
              testID="submit-plan-button"
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
    maxHeight: '80%',
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
  actionRow: {
    flexDirection: 'row',
    gap: SpacingTokens.space3,
    paddingTop: SpacingTokens.space2,
  },
  flexButton: {
    flex: 1,
  },
});
