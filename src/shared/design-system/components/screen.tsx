import type { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/design-system/theme-provider';
import { SpacingTokens } from '@/shared/design-system/spacing';
import { SizeTokens } from '@/shared/design-system/sizes';

export type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scrollable = false,
  testID,
  style,
  contentStyle,
}: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      testID={testID}
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.content, styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    paddingHorizontal: SpacingTokens.space5,
    paddingTop: Platform.OS === 'web' ? 84 : SpacingTokens.space6,
    paddingBottom: SpacingTokens.space6,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: SizeTokens.touchTargetMin,
  },
});
