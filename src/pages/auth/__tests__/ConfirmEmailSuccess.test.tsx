import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import ConfirmEmailSuccess from '../ConfirmEmailSuccess';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
  };
});

describe('ConfirmEmailSuccess Page', () => {
  const renderWithProviders = () => {
    return render(
      <TestApp initialEntries={['/confirm-email-success']}>
        <ConfirmEmailSuccess />
      </TestApp>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Confirmation Success Flow', () => {
    it('should display success message and provide navigation back to login', () => {
      renderWithProviders();

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

      renderWithProviders();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
