import { act, render, waitFor } from '@testing-library/react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Text, Pressable, View } from 'react-native';

import { AuthProvider, useAuth, type AuthSessionClient } from '../src/modules/auth';

const testSession: Session = {
  access_token: 'access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1_900_000_000,
  refresh_token: 'refresh-token',
  user: {
    id: 'user-id',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-10-22T00:00:00.000Z',
  },
};

function createAuthClient(
  initialSession: Session | null = null,
  getSessionError: Error | null = null,
) {
  let authListener: ((event: AuthChangeEvent, session: Session | null) => void) | undefined;
  const client: AuthSessionClient = {
    auth: {
      getSession: jest.fn(async () =>
        getSessionError
          ? { data: { session: null }, error: getSessionError }
          : { data: { session: initialSession }, error: null },
      ),
      onAuthStateChange: jest.fn((listener) => {
        authListener = listener;
        return { data: { subscription: { unsubscribe: () => undefined } } };
      }),
      signOut: jest.fn(async () => ({ error: null })),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
  };

  return {
    client,
    emitAuthEvent(event: AuthChangeEvent, session: Session | null) {
      authListener?.(event, session);
    },
  };
}

let signOutAction: (() => Promise<void>) | null = null;

function AuthProbe() {
  const { session, isLoading, error, signOut } = useAuth();
  signOutAction = signOut;

  return (
    <View>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="session">{session?.access_token ?? 'signed-out'}</Text>
      <Text testID="error">{error?.message ?? 'no-error'}</Text>
      <Pressable onPress={signOut}>
        <Text>Sign out</Text>
      </Pressable>
    </View>
  );
}

describe('AuthProvider session lifecycle', () => {
  beforeEach(() => {
    signOutAction = null;
  });

  it('restores a persisted session during initialization', async () => {
    const { client } = createAuthClient(testSession);
    const { getByTestId } = await render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
      expect(getByTestId('session').props.children).toBe('access-token');
    });
    expect(client.auth.getSession).toHaveBeenCalledTimes(1);
  });

  it('updates the session when Supabase reports a token refresh', async () => {
    const { client, emitAuthEvent } = createAuthClient();
    const { getByTestId } = await render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
    await act(async () => emitAuthEvent('TOKEN_REFRESHED', testSession));

    expect(getByTestId('session').props.children).toBe('access-token');
  });

  it('signs out locally and clears the active session', async () => {
    const { client } = createAuthClient(testSession);
    const { getByTestId } = await render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByTestId('session').props.children).toBe('access-token'));

    await act(async () => {
      await signOutAction?.();
    });

    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(getByTestId('session').props.children).toBe('signed-out');
  });

  it('fails closed and exposes a session initialization error', async () => {
    const storageFailure = new Error('SecureStore unavailable.');
    const { client } = createAuthClient(testSession, storageFailure);
    const { getByTestId } = await render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
      expect(getByTestId('session').props.children).toBe('signed-out');
      expect(getByTestId('error').props.children).toBe('SecureStore unavailable.');
    });
  });

  it('exposes and rejects a local sign-out failure without clearing the session', async () => {
    const signOutFailure = new Error('SecureStore delete failed.');
    const { client } = createAuthClient(testSession);
    client.auth.signOut = jest.fn(async () => ({ error: signOutFailure }));
    const { getByText, getByTestId } = await render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByTestId('session').props.children).toBe('access-token'));

    await act(async () => {
      await expect(signOutAction?.()).rejects.toBe(signOutFailure);
    });

    expect(getByTestId('session').props.children).toBe('access-token');
    expect(getByTestId('error').props.children).toBe('SecureStore delete failed.');
  });
});
