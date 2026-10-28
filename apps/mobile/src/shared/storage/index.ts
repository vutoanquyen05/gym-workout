export {
  initializeDatabase,
  openAppDatabase,
  UnsupportedSchemaVersionError,
  WebPlatformStorageError,
  type StorageDatabase,
} from '@/shared/storage/database';
export {
  StorageProvider,
  useStorage,
  useDatabase,
  type StorageContextValue,
  type StorageProviderProps,
} from '@/shared/storage/storage-provider';
export { DATABASE_NAME, LATEST_SCHEMA_VERSION, MIGRATIONS } from '@/shared/storage/schema';
export { ExerciseRepository } from '@/shared/storage/repositories/exercises';
export { WorkoutPlanRepository } from '@/shared/storage/repositories/workout-plans';
export {
  WorkoutSessionRepository,
  type WorkoutSessionsSummary,
} from '@/shared/storage/repositories/workout-sessions';
export type * from '@/shared/storage/types';
