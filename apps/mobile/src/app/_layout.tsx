import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/modules/auth';
import { Button } from '@/shared/design-system/components/button';
import { FeedbackState } from '@/shared/design-system/components/feedback-state';
import { AppThemeProvider, useAppTheme } from '@/shared/design-system/theme-provider';
import {
  StorageProvider,
  useStorage,
  type StorageDatabase,
} from '@/shared/storage';

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { scheme } = useAppTheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}

export function RootLayoutContent() {
  const { isReady, error, retry } = useStorage();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (error) {
      void SplashScreen.hideAsync();
    }
  }, [error]);

  if (error) {
    return (
      <View
        testID="storage-error-fallback"
        style={[styles.fallbackContainer, { backgroundColor: colors.background }]}
      >
        <FeedbackState
          variant="error"
          title="Không thể khởi động lưu trữ cục bộ"
          description={error.message}
          action={<Button label="Thử lại" onPress={retry} variant="primary" />}
        />
      </View>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

export type RootLayoutProps = {
  database?: StorageDatabase | null;
  openDatabase?: () => Promise<StorageDatabase>;
};

export default function RootLayout({
  database,
  openDatabase,
}: RootLayoutProps = {}) {
  return (
    <AppThemeProvider>
      <StorageProvider database={database} openDatabase={openDatabase}>
        <RootLayoutContent />
      </StorageProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

