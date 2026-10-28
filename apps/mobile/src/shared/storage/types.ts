export type Exercise = {
  id: string;
  name: string;
  primaryMuscleGroup: string;
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateExerciseInput = {
  name: string;
  primaryMuscleGroup: string;
  equipment?: string | null;
  difficulty?: string | null;
  instructions?: string | null;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanExercise = {
  id: string;
  planId: string;
  exerciseId: string;
  position: number;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  restSeconds: number | null;
};

export type WorkoutPlanDetail = WorkoutPlan & {
  exercises: (PlanExercise & { exercise: Exercise })[];
};

export type CreatePlanInput = {
  name: string;
  description?: string | null;
};

export type AddPlanExerciseInput = {
  exerciseId: string;
  position: number;
  targetSets: number;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  restSeconds?: number | null;
};

export type WorkoutSessionStatus = 'active' | 'paused' | 'completed';

export type WorkoutSession = {
  id: string;
  planId: string | null;
  title: string;
  status: WorkoutSessionStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionExerciseInput = {
  exerciseId?: string | null;
  exerciseName: string;
  position: number;
  targetSets?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  restSeconds?: number | null;
};

export type SessionExercise = Omit<SessionExerciseInput, 'exerciseId'> & {
  id: string;
  sessionId: string;
  exerciseId: string | null;
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  restSeconds: number | null;
};

export type WorkoutSet = {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weightValue: number | null;
  weightUnit: 'kg' | 'lb' | null;
  reps: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutSetInput = {
  setNumber: number;
  weightValue?: number | null;
  weightUnit?: 'kg' | 'lb' | null;
  reps?: number | null;
  isCompleted?: boolean;
};

export type WorkoutSessionDetail = WorkoutSession & {
  exercises: (SessionExercise & { sets: WorkoutSet[] })[];
};
