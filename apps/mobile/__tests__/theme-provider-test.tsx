import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { useColorScheme } from '../src/hooks/use-color-scheme';
import { AppThemeProvider, useAppTheme } from '../src/shared/design-system/theme-provider';

jest.mock('../src/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = jest.mocked(useColorScheme);

function ThemeProbe() {
  const { mode, scheme, colors, setMode } = useAppTheme();

  return (
    <View>
      <Text testID="mode">{mode}</Text>
      <Text testID="scheme">{scheme}</Text>
      <Text testID="background">{colors.background}</Text>
      <Pressable onPress={() => setMode('dark')}>
        <Text>Enable dark mode</Text>
      </Pressable>
    </View>
  );
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('follows the system scheme by default and allows an explicit theme mode', async () => {
    const { getByTestId, getByText, rerender } = await render(
      <AppThemeProvider>
        <ThemeProbe />
      </AppThemeProvider>,
    );

    expect(getByTestId('mode').props.children).toBe('system');
    expect(getByTestId('scheme').props.children).toBe('light');
    expect(getByTestId('background').props.children).toBe('#F7F8FA');

    mockUseColorScheme.mockReturnValue('dark');
    await rerender(
      <AppThemeProvider>
        <ThemeProbe />
      </AppThemeProvider>,
    );

    expect(getByTestId('mode').props.children).toBe('system');
    expect(getByTestId('scheme').props.children).toBe('dark');
    expect(getByTestId('background').props.children).toBe('#121417');

    await fireEvent.press(getByText('Enable dark mode'));

    expect(getByTestId('mode').props.children).toBe('dark');
    expect(getByTestId('scheme').props.children).toBe('dark');
    expect(getByTestId('background').props.children).toBe('#121417');
  });
});
