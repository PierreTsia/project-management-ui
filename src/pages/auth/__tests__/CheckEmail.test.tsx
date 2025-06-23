import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TestAppWithRouting } from '../../../test/TestAppWithRouting';

// Mock useUser to return null for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth pages
    isLoading: false,
  }),
}));

describe('CheckEmail Page', () => {
  it('should render the check email page with all required elements', () => {
    render(<TestAppWithRouting url="/auth/check-email" />);

    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(
      screen.getByText(
        "We've sent you a confirmation email with a link to activate your account."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Click the link in the email to complete your registration.'
      )
    ).toBeInTheDocument();

    const backButton = screen.getByRole('link', { name: 'Back to Login' });
    expect(backButton).toBeInTheDocument();
    expect(backButton.getAttribute('href')).toBe('/login');
  });

  it('should display the email when provided in location state', () => {
    const testEmail = 'test@example.com';
    render(
      <TestAppWithRouting
        url="/auth/check-email"
        locationState={{ email: testEmail }}
      />
    );

    expect(screen.getByText(testEmail)).toBeInTheDocument();
  });

  it('should not display email section when no email is provided', () => {
    render(<TestAppWithRouting url="/auth/check-email" />);

    // Should not find any email-like text in a styled container
    const emailContainers = screen.queryAllByText(/\S+@\S+\.\S+/);
    expect(emailContainers).toHaveLength(0);
  });

  it('should have proper title', () => {
    render(<TestAppWithRouting url="/auth/check-email" />);

    // The title is rendered as a div with card-title, not a heading
    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
  });

  it('should have correct navigation link', () => {
    render(<TestAppWithRouting url="/auth/check-email" />);

    const backButton = screen.getByRole('link', { name: 'Back to Login' });
    expect(backButton.getAttribute('href')).toBe('/login');
  });

  it('should handle empty email string gracefully', () => {
    render(
      <TestAppWithRouting
        url="/auth/check-email"
        locationState={{ email: '' }}
      />
    );

    // Should not display the email section when email is empty
    // Just check that the main content is there without any email display
    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(screen.queryByText(/\S+@\S+\.\S+/)).not.toBeInTheDocument();
  });

  it('should handle different email formats', () => {
    const testEmails = [
      'user@domain.com',
      'test.email+tag@example.org',
      'user123@sub.domain.co.uk',
    ];

    testEmails.forEach(email => {
      const { unmount } = render(
        <TestAppWithRouting url="/auth/check-email" locationState={{ email }} />
      );
      expect(screen.getByText(email)).toBeInTheDocument();
      unmount();
    });
  });
});
