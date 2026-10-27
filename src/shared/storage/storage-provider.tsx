import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  initializeDatabase,
  openAppDatabase,
  type StorageDatabase,
} from '@/shared/storage/database';
import { ExerciseRepository } from '@/shared/storage/repositories/exercises';
import { WorkoutPlanRepository } from '@/shared/storage/repositories/workout-plans';
import { WorkoutSessionRepository } from '@/shared/storage/repositories/workout-sessions';

export type StorageContextValue = {
  database: StorageDatabase | null;
  isReady: boolean;
  error: Error | null;
  exerciseRepository: ExerciseRepository | null;
  workoutPlanRepository: WorkoutPlanRepository | null;
  workoutSessionRepository: WorkoutSessionRepository | null;
  retry: () => Promise<void>;
};

const StorageContext = createContext<StorageContextValue | undefined>(undefined);

export type StorageProviderProps = {
  children: ReactNode;
  database?: StorageDatabase | null;
  openDatabase?: () => Promise<StorageDatabase>;
  onInitialized?: (db: StorageDatabase) => void;
};

export function StorageProvider({
  children,
  database: injectedDatabase,
  openDatabase = openAppDatabase,
  onInitialized,
}: StorageProviderProps) {
  const [database, setDatabase] = useState<StorageDatabase | null>(
    injectedDatabase ?? null,
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function initStorage() {
      try {
        let dbInstance = injectedDatabase;
        if (!dbInstance) {
          dbInstance = await openDatabase();
        }

        await initializeDatabase(dbInstance);

        if (isMounted) {
          setDatabase(dbInstance);
          setError(null);
          setIsReady(true);
          onInitialized?.(dbInstance);
        }
      } catch (err) {
        if (isMounted) {
          const initError =
            err instanceof Error
              ? err
              : new Error('Không thể khởi tạo cơ sở dữ liệu SQLite');
          setError(initError);
          setIsReady(false);
        }
      }
    }

    void initStorage();

    return () => {
      isMounted = false;
    };
  }, [injectedDatabase, openDatabase, onInitialized, retryCount]);

  const retry = useCallback(async () => {
    setIsReady(false);
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  const exerciseRepository = useMemo(
    () => (database && isReady ? new ExerciseRepository(database) : null),
    [database, isReady],
  );

  const workoutPlanRepository = useMemo(
    () => (database && isReady ? new WorkoutPlanRepository(database) : null),
    [database, isReady],
  );

  const workoutSessionRepository = useMemo(
    () => (database && isReady ? new WorkoutSessionRepository(database) : null),
    [database, isReady],
  );

  const value = useMemo<StorageContextValue>(
    () => ({
      database,
      isReady,
      error,
      exerciseRepository,
      workoutPlanRepository,
      workoutSessionRepository,
      retry,
    }),
    [
      database,
      isReady,
      error,
      exerciseRepository,
      workoutPlanRepository,
      workoutSessionRepository,
      retry,
    ],
  );

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}

export function useStorage(): StorageContextValue {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

export function useDatabase(): StorageDatabase {
  const { database, isReady } = useStorage();
  if (!isReady || !database) {
    throw new Error('Cơ sở dữ liệu SQLite chưa sẵn sàng');
  }
  return database;
}
