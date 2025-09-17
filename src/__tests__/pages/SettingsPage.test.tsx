import { render, screen } from '@testing-library/react';
import { TestAppWithRouting } from '@/test/TestAppWithRouting';
import { describe, it, expect } from 'vitest';

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
});
