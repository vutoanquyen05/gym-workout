import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { RoutePlaceholder } from '@/components/route-placeholder';
import { ThemedText } from '@/components/themed-text';

export default function RegisterRoute() {
  return (
    <RoutePlaceholder
      title="Đăng ký"
      description="Đăng ký chưa khả dụng vì backend và cơ chế xác thực chưa được xác nhận. Chưa có tài khoản hoặc dữ liệu xác thực nào được tạo.">
      <Link href="/(auth)/login" asChild>
        <Pressable accessibilityRole="button" style={styles.link}>
          <ThemedText type="linkPrimary">Đi đến đăng nhập</ThemedText>
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
