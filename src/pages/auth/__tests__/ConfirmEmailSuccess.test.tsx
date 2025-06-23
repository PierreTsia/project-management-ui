import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../../test/TestAppWithRouting';

// Mock useUser to return null for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth pages
    isLoading: false,
  }),
}));

describe('ConfirmEmailSuccess Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Confirmation Success Flow', () => {
    it('should display success message and provide navigation back to login', () => {
      render(<TestAppWithRouting url="/confirm-email-success" />);

      // Success confirmation
      expect(screen.getByText('Email Confirmed!')).toBeInTheDocument();
      expect(
        screen.getByText('Your email has been successfully confirmed.')
      ).toBeInTheDocument();

      // Navigation to continue the flow
      const loginLink = screen.getByRole('link', { name: 'Back to Login' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.getAttribute('href')).toBe('/login');
    });

    it('should render without errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<TestAppWithRouting url="/confirm-email-success" />);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
