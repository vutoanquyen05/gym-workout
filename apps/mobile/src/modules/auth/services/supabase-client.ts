import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { createSecureStoreAdapter } from './secure-store-adapter';

let supabaseClient: SupabaseClient | undefined;

function validateSupabaseConfig(url: string | undefined, key: string | undefined) {
  if (!url || !key) {
    throw new Error('Supabase URL and publishable key must be configured.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('Supabase URL must be a valid absolute URL.');
  }

  const isLocalHttp =
    parsedUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname);
  if (
    (parsedUrl.protocol !== 'https:' && !isLocalHttp) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error('Supabase URL must use HTTPS, except for a local development URL.');
  }

  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    throw new Error('Supabase client requires a publishable key.');
  }

  return { url: parsedUrl.toString().replace(/\/$/, ''), key };
}

export function getSupabaseClient(): SupabaseClient {
  if (Platform.OS === 'web') {
    throw new Error('Supabase Auth session storage is not configured for web.');
  }

  if (!supabaseClient) {
    const config = validateSupabaseConfig(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );

    supabaseClient = createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
        storage: createSecureStoreAdapter(),
      },
    });
  }

  return supabaseClient;
}
