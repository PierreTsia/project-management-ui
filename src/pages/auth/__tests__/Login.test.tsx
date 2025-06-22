import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import LoginForm from '../Login';
import { fireEvent } from '@testing-library/react';
import type { ApiError } from '@/types/api';

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockUseLogin = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => mockUseLogin(),
}));

describe('Login Page', () => {
  const renderWithProviders = () => {
    return render(
      <TestApp initialEntries={['/login']}>
        <LoginForm />
      </TestApp>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock implementation
    mockUseLogin.mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      error: null as ApiError | null,
    });

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    renderWithProviders();
  });

  it('should render the login page with all required elements', () => {
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Login with Google' })
    ).toBeInTheDocument();

    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();

    const signUpLink = screen.getByRole('link', { name: 'Sign up' });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.getAttribute('href')).toBe('/signup');
  });

  it('should show validation errors when submitting with empty data', async () => {
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters.')
      ).toBeInTheDocument();
    });
  });
  it('should show validation errors when submitting with invalid data', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });

    expect(emailInput).toHaveValue('invalid-email');
    expect(passwordInput).toHaveValue('123');

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters.')
      ).toBeInTheDocument();
    });
  });

  it('should call the login function when submitting with valid data', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password123!',
      });
    });
  });
  it('should redirect to Google OAuth when clicking Google login button', () => {
    const googleButton = screen.getByRole('button', {
      name: 'Login with Google',
    });
    fireEvent.click(googleButton);

    expect(window.location.href).toBe(
      'http://localhost:3000/api/v1/auth/google'
    );
  });

  it('should display error alert when login fails with invalid credentials', () => {
    // Mock the error state
    mockUseLogin.mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      error: {
        response: {
          data: {
            message: 'Identifiants invalides',
            status: 401,
          },
          status: 401,
        },
      } as ApiError,
    });

    // Re-render with error state
    render(
      <TestApp initialEntries={['/login']}>
        <LoginForm />
      </TestApp>
    );

    // Check that the error alert is displayed
    expect(screen.getByText('Login Failed')).toBeInTheDocument();
    expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();

    // Check that the alert has the correct styling (destructive variant)
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
