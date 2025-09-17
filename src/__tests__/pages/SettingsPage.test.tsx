import { render, screen } from '@testing-library/react';
import { TestAppWithRouting } from '@/test/TestAppWithRouting';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Use the global configurable mock provided by setup.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseUser = (globalThis as any).__mockUseUser as ReturnType<
  typeof vi.fn
>;

// Mock profile update hook with configurable mutateAsync
const mockUpdateProfile = vi.fn();
vi.mock('@/hooks/useUpdateUserProfile', () => ({
  useUpdateUserProfile: () => ({
    mutateAsync: mockUpdateProfile,
    isPending: false,
  }),
}));

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

describe('Settings Page - Profile update flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProfile.mockReset();
    mockUseUser.mockReturnValue({
      data: {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'local',
        canChangePassword: true,
        isEmailConfirmed: true,
        bio: 'Hello there',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
    });
  });

  it('shows user name, email, and bio in Profile card', async () => {
    render(<TestAppWithRouting url="/settings" />);
    const page = await screen.findByTestId('settings-page');
    expect(page).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    // Email label is not associated to input; assert via value instead
    const emailInput = screen.getByDisplayValue(
      'jane@example.com'
    ) as HTMLInputElement;
    const bioField = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;

    expect(nameInput).toHaveValue('Jane Doe');
    expect(emailInput).toHaveValue('jane@example.com');
    expect(emailInput).toBeDisabled();
    expect(bioField).toHaveValue('Hello there');
  });

  it('does not show Save button initially', async () => {
    render(<TestAppWithRouting url="/settings" />);
    await screen.findByTestId('settings-page');
    expect(
      screen.queryByRole('button', { name: /save/i })
    ).not.toBeInTheDocument();
  });

  it('shows Reset and Save when name changes, and submits correct payload', async () => {
    const user = userEvent.setup();
    // mock successful API response with updated user
    mockUpdateProfile.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      provider: 'local',
      canChangePassword: true,
      isEmailConfirmed: true,
      bio: 'Hello there',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    });

    render(<TestAppWithRouting url="/settings" />);
    await screen.findByTestId('settings-page');

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Smith');

    // Buttons should appear once form is dirty
    const resetButton = screen.getByRole('button', { name: /reset/i });
    const saveButton = screen.getByRole('button', {
      name: /save|enregistrer/i,
    });
    expect(resetButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();

    await user.click(saveButton);

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      name: 'Jane Smith',
      bio: 'Hello there',
    });
  });
});
