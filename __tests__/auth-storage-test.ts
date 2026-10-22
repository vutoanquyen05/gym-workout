import { createSecureStoreAdapter } from '../src/modules/auth/services/secure-store-adapter';

describe('SecureStore auth adapter', () => {
  it('maps Supabase storage operations to SecureStore', async () => {
    const secureStore = {
      getItemAsync: jest.fn(async () => 'stored-session'),
      setItemAsync: jest.fn(async () => undefined),
      deleteItemAsync: jest.fn(async () => undefined),
    };
    const storage = createSecureStoreAdapter(secureStore);

    await expect(storage.getItem('session-key')).resolves.toBe('stored-session');
    await storage.setItem('session-key', 'session-value');
    await storage.removeItem('session-key');

    expect(secureStore.getItemAsync).toHaveBeenCalledWith('session-key');
    expect(secureStore.setItemAsync).toHaveBeenCalledWith('session-key', 'session-value');
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('session-key');
  });

  it('propagates native storage failures to Supabase Auth', async () => {
    const storageFailure = new Error('Native secure storage failed.');
    const secureStore = {
      getItemAsync: jest.fn(async () => {
        throw storageFailure;
      }),
      setItemAsync: jest.fn(async () => {
        throw storageFailure;
      }),
      deleteItemAsync: jest.fn(async () => {
        throw storageFailure;
      }),
    };
    const storage = createSecureStoreAdapter(secureStore);

    await expect(storage.getItem('session-key')).rejects.toBe(storageFailure);
    await expect(storage.setItem('session-key', 'session-value')).rejects.toBe(storageFailure);
    await expect(storage.removeItem('session-key')).rejects.toBe(storageFailure);
  });
});
