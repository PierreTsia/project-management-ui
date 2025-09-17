import { render, screen } from '@testing-library/react';
import { TestAppWithRouting } from '@/test/TestAppWithRouting';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use the global configurable mock provided by setup.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseUser = (globalThis as any).__mockUseUser as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({
    data: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      provider: 'local',
      canChangePassword: true,
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
  });
});

// Basic visibility smoke tests for Settings page
describe('Settings Page', () => {
  it('renders all cards for local user (can change password)', async () => {
    // Navigate directly to /settings
    render(<TestAppWithRouting url="/settings" />);

    // Page container
    expect(await screen.findByTestId('settings-page')).toBeInTheDocument();

    // Grid and cards
    expect(screen.getByTestId('settings-grid')).toBeInTheDocument();
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('appearance-card')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-card')).toBeInTheDocument();

    // One of the two security variants should render; local user path should show the editable card
    expect(screen.getByTestId('security-card')).toBeInTheDocument();
  });

  it('shows SSO security card for google users', async () => {
    mockUseUser.mockReturnValue({
      data: {
        id: 'user-1',
        name: 'Google User',
        email: 'google@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'google',
        canChangePassword: false,
        isEmailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
    });

    render(<TestAppWithRouting url="/settings" />);
    expect(await screen.findByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('security-card-sso')).toBeInTheDocument();
  });
});
