import { useCallback, useEffect, useMemo, useState } from 'react';

import { useStorage } from '@/shared/storage';
import type { CreateExerciseInput, Exercise } from '@/shared/storage/types';
import { INITIAL_SEED_EXERCISES } from '../constants/muscle-groups';

export function useExercises() {
  const { database, exerciseRepository, isReady, error: storageError } = useStorage();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customError, setCustomError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('Tất cả');
  const [reloadToken, setReloadToken] = useState(0);

  const error = customError ?? storageError ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!isReady || !exerciseRepository) {
      return;
    }

    async function loadData() {
      try {
        let list = await exerciseRepository!.list({ limit: 500 });

        // Tự động seed danh mục bài tập chuẩn nếu SQLite chưa có bài tập nào
        if (list.length === 0) {
          if (database) {
            await database.withTransactionAsync(async () => {
              for (const item of INITIAL_SEED_EXERCISES) {
                await exerciseRepository!.create(item);
              }
            });
          } else {
            for (const item of INITIAL_SEED_EXERCISES) {
              await exerciseRepository!.create(item);
            }
          }
          list = await exerciseRepository!.list({ limit: 500 });
        }

        if (!isCancelled) {
          setExercises(list);
          setCustomError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setCustomError(err instanceof Error ? err : new Error('Không thể tải danh sách bài tập.'));
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [database, exerciseRepository, isReady, reloadToken]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadToken((prev) => prev + 1);
  }, []);

  const createExercise = useCallback(
    async (input: CreateExerciseInput): Promise<Exercise> => {
      if (!exerciseRepository) {
        throw new Error('Cơ sở dữ liệu SQLite chưa sẵn sàng.');
      }

      const created = await exerciseRepository.create(input);
      setReloadToken((prev) => prev + 1);
      return created;
    },
    [exerciseRepository],
  );

  const filteredExercises = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return exercises.filter((ex) => {
      const matchesMuscle =
        selectedMuscleGroup === 'Tất cả' ||
        ex.primaryMuscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();

      if (!matchesMuscle) {
        return false;
      }

      if (!term) {
        return true;
      }

      const matchesName = ex.name.toLowerCase().includes(term);
      const matchesEquipment = ex.equipment?.toLowerCase().includes(term) ?? false;
      const matchesInstructions = ex.instructions?.toLowerCase().includes(term) ?? false;

      return matchesName || matchesEquipment || matchesInstructions;
    });
  }, [exercises, searchQuery, selectedMuscleGroup]);

  return {
    exercises,
    filteredExercises,
    isLoading: isReady ? isLoading : !storageError,
    error,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    createExercise,
    refresh,
  };
}
