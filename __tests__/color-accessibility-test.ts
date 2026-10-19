import { ColorTokens } from '../src/shared/design-system/colors';

function relativeLuminance(hex: string) {
  const pairs = hex.slice(1).match(/.{2}/g);

  if (!pairs || pairs.length !== 3) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const channels = pairs.map((pair) => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe('design-system accessibility', () => {
  it.each(Object.entries(ColorTokens))(
    '%s theme meets text and non-text contrast for component color pairs',
    (scheme, colors) => {
      const textBackgrounds = [
        colors.background,
        colors.surface,
        colors.surfaceElevated,
      ];

      for (const background of textBackgrounds) {
        expect(contrastRatio(colors.textPrimary, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.textSecondary, background)).toBeGreaterThanOrEqual(4.5);
      }

      for (const semanticColor of [colors.info, colors.success, colors.danger]) {
        expect(contrastRatio(semanticColor, colors.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(semanticColor, colors.surface)).toBeGreaterThanOrEqual(3);
      }

      const primaryButtonForeground =
        scheme === 'dark' ? colors.background : colors.surface;
      expect(contrastRatio(primaryButtonForeground, colors.brandPrimary)).toBeGreaterThanOrEqual(
        4.5,
      );

      for (const adjacentBackground of [colors.background, colors.surface]) {
        expect(contrastRatio(colors.textSecondary, adjacentBackground)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(colors.brandPrimary, adjacentBackground)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(colors.danger, adjacentBackground)).toBeGreaterThanOrEqual(3);
      }
    },
  );
});
