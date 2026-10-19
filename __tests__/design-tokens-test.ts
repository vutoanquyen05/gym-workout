import { Spacing } from '../src/constants/theme';
import { RadiusTokens } from '../src/shared/design-system/radius';
import { SizeTokens } from '../src/shared/design-system/sizes';
import { SpacingTokens } from '../src/shared/design-system/spacing';
import { Typography } from '../src/shared/design-system/typography';

jest.mock('../src/global.css', () => ({}));

describe('design-system tokens', () => {
  it('defines typography, spacing, radius, and size scales from the design spec', () => {
    expect(Typography.fontSize).toEqual({
      display: 32,
      h1: 28,
      h2: 24,
      h3: 20,
      title: 18,
      body: 16,
      bodySmall: 14,
      label: 14,
      caption: 12,
    });
    expect(Typography.lineHeight).toEqual({
      display: 40,
      h1: 36,
      h2: 32,
      h3: 28,
      title: 24,
      body: 24,
      bodySmall: 20,
      label: 20,
      caption: 16,
    });
    expect(Typography.fontWeight).toEqual({
      regular: 400,
      semibold: 600,
      bold: 700,
    });
    expect(SpacingTokens).toEqual({
      space1: 4,
      space2: 8,
      space3: 12,
      space4: 16,
      space5: 20,
      space6: 24,
      space8: 32,
      space10: 40,
      space12: 48,
    });
    expect(RadiusTokens).toEqual({
      chip: 8,
      input: 12,
      button: 12,
      card: 16,
      sheet: 20,
      sheetLarge: 24,
    });
    expect(SizeTokens).toEqual({
      iconSmall: 16,
      icon: 24,
      iconLarge: 32,
      buttonHeight: 48,
      buttonCompactHeight: 40,
      inputHeight: 48,
      inputLargeHeight: 52,
      touchTargetMin: 44,
      bottomNavigationIcon: 24,
      bottomNavigationContentMinHeight: 56,
      bottomNavigationContentMaxHeight: 64,
    });
  });

  it('preserves existing spacing values for current components', () => {
    expect(Spacing).toEqual({
      half: 2,
      one: 4,
      two: 8,
      three: 16,
      four: 24,
      five: 32,
      six: 64,
    });
  });
});
