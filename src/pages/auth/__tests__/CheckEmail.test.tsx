import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TestApp } from '@/test/TestApp';
import CheckEmail from '../CheckEmail';

describe('CheckEmail Page', () => {
  const renderWithProviders = (
    initialEntries = ['/auth/check-email'],
    state = {}
  ) => {
    return render(
      <TestApp initialEntries={initialEntries} locationState={state}>
        <CheckEmail />
      </TestApp>
    );
  };

  it('should render the check email page with all required elements', () => {
    renderWithProviders();

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
    renderWithProviders(['/auth/check-email'], { email: testEmail });

    expect(screen.getByText(testEmail)).toBeInTheDocument();
  });

  it('should not display email section when no email is provided', () => {
    renderWithProviders();

    // Should not find any email-like text in a styled container
    const emailContainers = screen.queryAllByText(/\S+@\S+\.\S+/);
    expect(emailContainers).toHaveLength(0);
  });

  it('should have proper title', () => {
    renderWithProviders();

    // The title is rendered as a div with card-title, not a heading
    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
  });

  it('should have correct navigation link', () => {
    renderWithProviders();

    const backButton = screen.getByRole('link', { name: 'Back to Login' });
    expect(backButton.getAttribute('href')).toBe('/login');
  });

  it('should handle empty email string gracefully', () => {
    renderWithProviders(['/auth/check-email'], { email: '' });

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
      const { unmount } = renderWithProviders(['/auth/check-email'], { email });
      expect(screen.getByText(email)).toBeInTheDocument();
      unmount();
    });
  });
});
