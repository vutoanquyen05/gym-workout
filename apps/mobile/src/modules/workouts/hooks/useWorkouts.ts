import { useCallback, useEffect, useState } from 'react';

import { INITIAL_SEED_EXERCISES } from '@/modules/exercises';
import { useStorage } from '@/shared/storage';
import type { CreatePlanInput } from '@/shared/storage/types';
import type { WorkoutPlanWithMeta } from '../components/workout-plan-card';
import type { WorkoutSessionWithMeta } from '../components/workout-session-card';
import { SAMPLE_WORKOUT_PLANS } from '../constants/sample-plans';

export function useWorkouts() {
  const {
    database,
    exerciseRepository,
    workoutPlanRepository,
    workoutSessionRepository,
    isReady,
    error: storageError,
  } = useStorage();

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanWithMeta[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSessionWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customError, setCustomError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const error = customError ?? storageError ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!isReady || !workoutPlanRepository || !workoutSessionRepository || !exerciseRepository) {
      return;
    }

    async function loadWorkoutsData() {
      try {
        let plans = await workoutPlanRepository!.list();

        // Tự động seed 2 giáo án mẫu nếu danh sách giáo án rỗng
        if (plans.length === 0) {
          // Đảm bảo thư viện bài tập có dữ liệu để liên kết
          let exercises = await exerciseRepository!.list({ limit: 500 });
          if (exercises.length === 0) {
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
            exercises = await exerciseRepository!.list({ limit: 500 });
          }

          // Tạo các giáo án mẫu kèm bài tập trong transaction
          const seedSamplePlans = async () => {
            for (const sample of SAMPLE_WORKOUT_PLANS) {
              const createdPlan = await workoutPlanRepository!.create({
                name: sample.name,
                description: sample.description,
              });

              let position = 0;
              for (const target of sample.targetExercises) {
                const matchedEx = exercises.find(
                  (ex) => ex.name.toLowerCase() === target.exerciseName.toLowerCase(),
                );
                if (matchedEx) {
                  await workoutPlanRepository!.addExercise(createdPlan.id, {
                    exerciseId: matchedEx.id,
                    position,
                    targetSets: target.targetSets,
                    targetRepsMin: target.targetRepsMin,
                    targetRepsMax: target.targetRepsMax,
                    restSeconds: target.restSeconds,
                  });
                  position += 1;
                }
              }
            }
          };

          if (database) {
            await database.withTransactionAsync(seedSamplePlans);
          } else {
            await seedSamplePlans();
          }

          plans = await workoutPlanRepository!.list();
        }

        // Lấy chi tiết số bài tập cho từng giáo án
        const plansWithMeta: WorkoutPlanWithMeta[] = await Promise.all(
          plans.map(async (plan) => {
            const detail = await workoutPlanRepository!.getById(plan.id);
            return {
              ...plan,
              exerciseCount: detail?.exercises.length ?? 0,
            };
          }),
        );

        // Lấy 5 buổi tập hoàn thành gần nhất
        const allSessions = await workoutSessionRepository!.listRecent({ limit: 50 });
        const completedSessions: WorkoutSessionWithMeta[] = allSessions
          .filter((s) => s.status === 'completed')
          .slice(0, 5);

        if (!isCancelled) {
          setWorkoutPlans(plansWithMeta);
          setRecentSessions(completedSessions);
          setCustomError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setCustomError(
            err instanceof Error ? err : new Error('Không thể tải dữ liệu kế hoạch tập luyện.'),
          );
          setIsLoading(false);
        }
      }
    }

    void loadWorkoutsData();

    return () => {
      isCancelled = true;
    };
  }, [database, exerciseRepository, isReady, reloadToken, workoutPlanRepository, workoutSessionRepository]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadToken((prev) => prev + 1);
  }, []);

  const createPlan = useCallback(
    async (input: CreatePlanInput) => {
      if (!workoutPlanRepository) {
        throw new Error('Cơ sở dữ liệu SQLite chưa sẵn sàng.');
      }

      const created = await workoutPlanRepository.create(input);
      const planWithMeta: WorkoutPlanWithMeta = {
        ...created,
        exerciseCount: 0,
      };
      setWorkoutPlans((prev) => [planWithMeta, ...prev]);
      setReloadToken((prev) => prev + 1);
      return created;
    },
    [workoutPlanRepository],
  );

  return {
    workoutPlans,
    recentSessions,
    isLoading: isReady ? isLoading : !storageError,
    error,
    createPlan,
    refresh,
  };
}
