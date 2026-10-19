import { Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/shared/design-system/theme-provider';
import type { ColorToken } from '@/shared/design-system/colors';
import { Typography } from '@/shared/design-system/typography';

export type AppTextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: ColorToken;
};

const headingVariants: AppTextVariant[] = ['display', 'h1', 'h2', 'h3'];

export function AppText({
  variant = 'body',
  color = 'textPrimary',
  allowFontScaling = true,
  accessibilityRole,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useAppTheme();
  const isHeading = headingVariants.includes(variant);

  return (
    <Text
      allowFontScaling={allowFontScaling}
      accessibilityRole={accessibilityRole ?? (isHeading ? 'header' : undefined)}
      style={[
        {
          color: colors[color],
          fontSize: Typography.fontSize[variant],
          lineHeight: Typography.lineHeight[variant],
          fontWeight:
            variant === 'h1' ||
            variant === 'h2' ||
            variant === 'display'
              ? Typography.fontWeight.bold
              : variant === 'h3' || variant === 'title' || variant === 'label'
                ? Typography.fontWeight.semibold
                : Typography.fontWeight.regular,
        },
        style,
      ]}
      {...props}
    />
  );
}
