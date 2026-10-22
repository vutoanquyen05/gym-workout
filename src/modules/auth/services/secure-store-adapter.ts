import * as SecureStore from 'expo-secure-store';
import type { SupportedStorage } from '@supabase/supabase-js';

type SecureStoreMethods = Pick<
  typeof SecureStore,
  'getItemAsync' | 'setItemAsync' | 'deleteItemAsync'
>;

export function createSecureStoreAdapter(
  secureStore: SecureStoreMethods = SecureStore,
): SupportedStorage {
  return {
    getItem: (key) => secureStore.getItemAsync(key),
    setItem: (key, value) => secureStore.setItemAsync(key, value),
    removeItem: (key) => secureStore.deleteItemAsync(key),
  };
}
