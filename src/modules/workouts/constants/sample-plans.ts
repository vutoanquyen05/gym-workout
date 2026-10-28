import type { CreatePlanInput } from '@/shared/storage/types';

export type SamplePlanConfig = CreatePlanInput & {
  targetExercises: {
    exerciseName: string;
    targetSets: number;
    targetRepsMin: number;
    targetRepsMax: number;
    restSeconds: number;
  }[];
};

export const SAMPLE_WORKOUT_PLANS: readonly SamplePlanConfig[] = [
  {
    name: 'Full Body Cơ Bản',
    description: 'Giáo án toàn thân 3 buổi/tuần dành cho người mới bắt đầu.',
    targetExercises: [
      {
        exerciseName: 'Barbell Back Squat',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 10,
        restSeconds: 90,
      },
      {
        exerciseName: 'Barbell Bench Press',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      },
      {
        exerciseName: 'Pull-up',
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 10,
        restSeconds: 90,
      },
      {
        exerciseName: 'Plank',
        targetSets: 3,
        targetRepsMin: 1,
        targetRepsMax: 1,
        restSeconds: 60,
      },
    ],
  },
  {
    name: 'Upper Body Sức Mạnh',
    description: 'Tập trung phát triển sức mạnh và cơ bắp thân trên.',
    targetExercises: [
      {
        exerciseName: 'Barbell Bench Press',
        targetSets: 4,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 120,
      },
      {
        exerciseName: 'Overhead Press (OHP)',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 10,
        restSeconds: 90,
      },
      {
        exerciseName: 'Pull-up',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      },
      {
        exerciseName: 'Tricep Rope Pushdown',
        targetSets: 3,
        targetRepsMin: 10,
        targetRepsMax: 12,
        restSeconds: 60,
      },
    ],
  },
];
