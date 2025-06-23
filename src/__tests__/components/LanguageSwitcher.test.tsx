import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TestWrapper } from '../../test/TestWrapper';
import { LanguageSwitcher } from '../../components/sidebar/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders current language flag', () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    // Should show current language flag (default is English)
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('shows dropdown trigger button', () => {
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    // Should show the dropdown trigger button
    const triggerButton = screen.getByRole('button', { name: /🇺🇸/ });
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('can be clicked to open dropdown', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LanguageSwitcher />
      </TestWrapper>
    );

    const triggerButton = screen.getByRole('button', { name: /🇺🇸/ });
    await user.click(triggerButton);

    // After clicking, the button should be expanded
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
  });
});
