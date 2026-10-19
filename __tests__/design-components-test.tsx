import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import {
  AppText,
  Button,
  Card,
  FeedbackState,
  IconButton,
  Input,
  Screen,
} from '../src/shared/design-system/components';
import { ColorTokens } from '../src/shared/design-system/colors';
import { useColorScheme } from '../src/hooks/use-color-scheme';
import { AppThemeProvider } from '../src/shared/design-system/theme-provider';

jest.mock('../src/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = jest.mocked(useColorScheme);

function renderInTheme(ui: React.ReactElement) {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>);
}

describe('design-system components', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders tokenized text, screen, and card content', async () => {
    const { getByRole, getByText } = await renderInTheme(
      <Screen>
        <AppText variant="h1">Workout</AppText>
        <Card>
          <AppText>Today</AppText>
        </Card>
      </Screen>,
    );

    expect(getByRole('header', { name: 'Workout' })).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
  });

  it('keeps text scalable and screens safe-area-aware and scrollable', async () => {
    const { getByTestId, getByText } = await renderInTheme(
      <Screen testID="design-screen" scrollable>
        <AppText variant="h1">A long workout title that can wrap on a narrow screen</AppText>
      </Screen>,
    );
    const screen = getByTestId('design-screen');
    const heading = getByText('A long workout title that can wrap on a narrow screen');

    expect(screen.props.edges).toEqual({
      top: 'additive',
      right: 'additive',
      bottom: 'additive',
      left: 'additive',
    });
    expect(heading.props.allowFontScaling).toBe(true);
    expect(heading.props.numberOfLines).toBeUndefined();
  });

  it('supports disabled and loading button states without firing disabled actions', async () => {
    const onPress = jest.fn();
    const { getByRole, getByText, rerender } = await renderInTheme(
      <Button label="Save" onPress={onPress} disabled />,
    );
    const disabledButton = getByRole('button', { name: 'Save' });

    expect(disabledButton.props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
    await fireEvent.press(disabledButton);
    expect(onPress).not.toHaveBeenCalled();

    await rerender(
      <AppThemeProvider>
        <Button label="Saving" onPress={onPress} loading />
      </AppThemeProvider>,
    );

    expect(getByRole('button', { name: 'Saving' }).props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(getByText('Saving')).toBeTruthy();
  });

  it('keeps compact buttons, icon buttons, and inputs at least 44 points high', async () => {
    const { getByLabelText, getByRole } = await renderInTheme(
      <>
        <Button label="Compact" onPress={jest.fn()} size="compact" variant="outline" />
        <IconButton
          accessibilityLabel="Close"
          icon={(color) => <Text>{color}</Text>}
          onPress={jest.fn()}
        />
        <Input label="Weight" />
        <Input label="Invalid weight" error="Enter a valid weight" />
      </>,
    );
    const compactButtonStyle = StyleSheet.flatten(
      getByRole('button', { name: 'Compact' }).props.style,
    );
    const iconButtonStyle = StyleSheet.flatten(getByRole('button', { name: 'Close' }).props.style);
    const inputStyle = StyleSheet.flatten(getByLabelText('Weight').props.style);
    const errorInputStyle = StyleSheet.flatten(
      getByLabelText('Invalid weight').props.style,
    );

    expect(compactButtonStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(compactButtonStyle.borderColor).toBe(ColorTokens.light.textSecondary);
    expect(iconButtonStyle.width).toBeGreaterThanOrEqual(44);
    expect(iconButtonStyle.height).toBeGreaterThanOrEqual(44);
    expect(inputStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(inputStyle.borderColor).toBe(ColorTokens.light.textSecondary);
    expect(errorInputStyle.borderColor).toBe(ColorTokens.light.danger);
    expect(getByLabelText('Weight').props.allowFontScaling).toBe(true);
  });

  it('labels inputs, reports validation errors, and forwards input changes', async () => {
    const onChangeText = jest.fn();
    const { getByLabelText, getByText } = await renderInTheme(
      <Input
        label="Repetitions"
        error="Enter a valid number"
        keyboardType="number-pad"
        onChangeText={onChangeText}
      />,
    );
    const input = getByLabelText('Repetitions');

    expect(input.props.accessibilityHint).toBe('Enter a valid number');
    expect(getByText('Enter a valid number')).toBeTruthy();
    await fireEvent.changeText(input, '8');
    expect(onChangeText).toHaveBeenCalledWith('8');
  });

  it('provides a labeled icon button with a theme-aware icon color', async () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = await renderInTheme(
      <IconButton
        accessibilityLabel="Close"
        icon={(color) => <Text>{color}</Text>}
        onPress={onPress}
      />,
    );

    expect(getByText('#171A1F')).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Close' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('communicates feedback state with visible status text and semantic error role', async () => {
    const { getByRole, getByText, rerender } = await renderInTheme(
      <FeedbackState
        variant="loading"
        title="Loading workouts"
        description="Your plans are being loaded."
      />,
    );

    expect(getByText('Đang tải')).toBeTruthy();
    expect(getByText('Loading workouts')).toBeTruthy();

    await rerender(
      <AppThemeProvider>
        <FeedbackState variant="error" title="Unable to load workouts" />
      </AppThemeProvider>,
    );

    expect(getByText('Đã xảy ra lỗi')).toBeTruthy();
    expect(getByRole('alert', { name: 'Unable to load workouts' })).toBeTruthy();
  });
});
