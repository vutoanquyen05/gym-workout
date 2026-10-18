import { render } from '@testing-library/react-native';

import { RoutePlaceholder } from '../src/components/route-placeholder';
import { ThemedText } from '../src/components/themed-text';

jest.mock('../src/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#111111',
    background: '#ffffff',
    backgroundElement: '#f0f0f0',
    backgroundSelected: '#e0e0e0',
    textSecondary: '#606060',
  }),
}));

jest.mock('../src/constants/theme', () => ({
  Fonts: { mono: 'monospace' },
}));

describe('RoutePlaceholder', () => {
  it('renders the screen title, description, and child actions', async () => {
    const { getByText } = await render(
      <RoutePlaceholder title="Profile" description="Manage your profile">
        <ThemedText>Open settings</ThemedText>
      </RoutePlaceholder>,
    );

    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Manage your profile')).toBeTruthy();
    expect(getByText('Open settings')).toBeTruthy();
  });
});
