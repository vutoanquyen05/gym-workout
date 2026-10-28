import { useCallback, useEffect, useState } from 'react';

import type { WorkoutSessionWithMeta } from '@/modules/workouts';
import { useStorage } from '@/shared/storage';
import type { WorkoutSessionsSummary } from '@/shared/storage/repositories/workout-sessions';

export type ProgressState = {
  summary: WorkoutSessionsSummary;
  recentSessions: WorkoutSessionWithMeta[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
};

const DEFAULT_SUMMARY: WorkoutSessionsSummary = {
  totalWorkouts: 0,
  totalDurationMinutes: 0,
  totalVolumeKg: 0,
};

export function useProgress(): ProgressState {
  const { workoutSessionRepository, isReady, error: storageError } = useStorage();

  const [summary, setSummary] = useState<WorkoutSessionsSummary>(DEFAULT_SUMMARY);
  const [recentSessions, setRecentSessions] = useState<WorkoutSessionWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customError, setCustomError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const error = customError ?? storageError ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!isReady || !workoutSessionRepository) {
      return;
    }

    async function loadProgressData() {
      try {
        let progressSummary: WorkoutSessionsSummary;
        if (typeof workoutSessionRepository!.getSessionsSummary === 'function') {
          progressSummary = await workoutSessionRepository!.getSessionsSummary();
        } else {
          const allSessions = await workoutSessionRepository!.listRecent({ limit: 500 });
          const completed = allSessions.filter((s) => s.status === 'completed');
          let totalMinutes = 0;
          for (const s of completed) {
            if (s.startedAt && s.completedAt) {
              const start = new Date(s.startedAt).getTime();
              const end = new Date(s.completedAt).getTime();
              if (end >= start) {
                totalMinutes += Math.round((end - start) / 60000);
              }
            }
          }
          progressSummary = {
            totalWorkouts: completed.length,
            totalDurationMinutes: totalMinutes,
            totalVolumeKg: 0,
          };
        }

        // Lấy 3-5 buổi tập hoàn thành gần nhất
        let completedRecent = [];
        if (typeof workoutSessionRepository!.listCompletedRecent === 'function') {
          completedRecent = await workoutSessionRepository!.listCompletedRecent({ limit: 5 });
        } else {
          const allRecent = await workoutSessionRepository!.listRecent({ limit: 50 });
          completedRecent = allRecent.filter((s) => s.status === 'completed').slice(0, 5);
        }

        // Tính toán metadata chi tiết (duration, hiệp, volume) cho từng buổi tập gần nhất
        const sessionsWithMeta: WorkoutSessionWithMeta[] = await Promise.all(
          completedRecent.map(async (session) => {
            let totalSets = 0;
            let totalVolumeKg = 0;
            let durationMinutes: number | undefined;

            if (session.startedAt && session.completedAt) {
              const start = new Date(session.startedAt).getTime();
              const end = new Date(session.completedAt).getTime();
              if (end >= start) {
                durationMinutes = Math.max(1, Math.round((end - start) / 60000));
              }
            }

            try {
              const detail = await workoutSessionRepository!.getById(session.id);
              if (detail) {
                for (const ex of detail.exercises) {
                  for (const st of ex.sets) {
                    if (st.isCompleted) {
                      totalSets += 1;
                      const weight = st.weightValue ?? 0;
                      const weightInKg = st.weightUnit === 'lb' ? weight * 0.45359237 : weight;
                      totalVolumeKg += weightInKg * (st.reps ?? 0);
                    }
                  }
                }
              }
            } catch {
              // Graceful fallback nếu không lấy được detail
            }

            return {
              ...session,
              durationMinutes,
              totalSets,
              totalVolumeKg: Math.round(totalVolumeKg),
            };
          }),
        );

        if (!isCancelled) {
          setSummary(progressSummary);
          setRecentSessions(sessionsWithMeta);
          setCustomError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setCustomError(
            err instanceof Error ? err : new Error('Không thể tải dữ liệu tiến trình.'),
          );
          setIsLoading(false);
        }
      }
    }

    void loadProgressData();

    return () => {
      isCancelled = true;
    };
  }, [isReady, reloadToken, workoutSessionRepository]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadToken((prev) => prev + 1);
  }, []);

  return {
    summary,
    recentSessions,
    isLoading: isReady ? isLoading : !storageError,
    error,
    refresh,
  };
}

