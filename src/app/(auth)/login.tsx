import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { RoutePlaceholder } from '@/components/route-placeholder';
import { ThemedText } from '@/components/themed-text';

export default function LoginRoute() {
  return (
    <RoutePlaceholder
      title="Đăng nhập"
      description="Đăng nhập chưa khả dụng vì backend và cơ chế xác thực chưa được xác nhận. Không có phiên đăng nhập giả được tạo.">
      <Link href="/(auth)/register" asChild>
        <Pressable accessibilityRole="button" style={styles.link}>
          <ThemedText type="linkPrimary">Đi đến đăng ký</ThemedText>
        </Pressable>
      </Link>
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
