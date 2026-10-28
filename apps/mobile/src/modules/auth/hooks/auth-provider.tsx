import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { getSupabaseClient } from '../services/supabase-client';

export type AuthSessionClient = {
  auth: {
    getSession(): Promise<{
      data: { session: Session | null };
      error: Error | null;
    }>;
    onAuthStateChange(
      callback: (event: AuthChangeEvent, session: Session | null) => void,
    ): { data: { subscription: { unsubscribe: () => void } } };
    signOut(options?: { scope?: 'global' | 'local' | 'others' }): Promise<{
      error: Error | null;
    }>;
    startAutoRefresh(): void;
    stopAutoRefresh(): void;
  };
};

type AuthContextValue = {
  session: Session | null;
  user: Session['user'] | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  clearError: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
  client?: AuthSessionClient | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toError(error: unknown, fallbackMessage: string): Error {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function getClient(client: AuthSessionClient | null | undefined) {
  if (client !== undefined) {
    return client;
  }

  return Platform.OS === 'web' ? null : getSupabaseClient();
}

export function AuthProvider({ children, client }: AuthProviderProps) {
  const authClient = useMemo(() => getClient(client), [client]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(authClient !== null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authClient) {
      return;
    }

    let isMounted = true;
    let receivedAuthEvent = false;
    const { data } = authClient.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        receivedAuthEvent = true;
        if (isMounted) {
          setSession(nextSession);
          setError(null);
          setIsLoading(false);
        }
      },
    );

    const initializeSession = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await authClient.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (isMounted && !receivedAuthEvent) {
          setSession(sessionData.session);
          setError(null);
        }
      } catch (initializationError) {
        if (isMounted) {
          setSession(null);
          setError(toError(initializationError, 'Unable to initialize the auth session.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeSession();

    if (Platform.OS !== 'web') {
      authClient.auth.startAutoRefresh();
      const appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          authClient.auth.startAutoRefresh();
        } else {
          authClient.auth.stopAutoRefresh();
        }
      });

      return () => {
        isMounted = false;
        data.subscription.unsubscribe();
        appStateSubscription.remove();
        authClient.auth.stopAutoRefresh();
      };
    }

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [authClient]);

  const signOut = useCallback(async () => {
    if (!authClient) {
      const unavailableError = new Error('Supabase Auth is disabled for this platform.');
      setError(unavailableError);
      throw unavailableError;
    }

    try {
      const { error: signOutError } = await authClient.auth.signOut({ scope: 'local' });
      if (signOutError) {
        throw signOutError;
      }

      setSession(null);
      setError(null);
    } catch (signOutFailure) {
      const signOutError = toError(signOutFailure, 'Unable to sign out on this device.');
      setError(signOutError);
      throw signOutError;
    }
  }, [authClient]);

  const clearError = useCallback(() => setError(null), []);
  const visibleSession = authClient ? session : null;
  const value = useMemo(
    () => ({
      session: visibleSession,
      user: visibleSession?.user ?? null,
      isLoading: authClient ? isLoading : false,
      error,
      signOut,
      clearError,
    }),
    [authClient, visibleSession, isLoading, error, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return auth;
}
