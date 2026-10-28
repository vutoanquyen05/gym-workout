import { NativeTabs } from 'expo-router/native-tabs';

import { Typography } from '@/shared/design-system/typography';
import { useAppTheme } from '@/shared/design-system/theme-provider';

export function BottomNavigation() {
  const { colors } = useAppTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.surfaceElevated}
      labelVisibilityMode="labeled"
      labelStyle={{
        color: colors.textSecondary,
        fontSize: Typography.fontSize.caption,
      }}
      tintColor={colors.brandPrimary}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label selectedStyle={{ color: colors.textPrimary }}>
          Home
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home_filled' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <NativeTabs.Trigger.Label selectedStyle={{ color: colors.textPrimary }}>
          Workouts
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'dumbbell', selected: 'dumbbell.fill' }}
          md="fitness_center"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercises">
        <NativeTabs.Trigger.Label selectedStyle={{ color: colors.textPrimary }}>
          Exercises
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'magnifyingglass', selected: 'magnifyingglass' }}
          md="search"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label selectedStyle={{ color: colors.textPrimary }}>
          Progress
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          md="bar_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label selectedStyle={{ color: colors.textPrimary }}>
          Profile
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
