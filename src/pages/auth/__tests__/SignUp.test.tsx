import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import SignUpForm from '../SignUp';
import { fireEvent } from '@testing-library/react';

// Mock the useAuth hook
const mockRegister = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useRegister: () => ({
    mutateAsync: mockRegister,
    isPending: false,
  }),
}));

describe('SignUp Page', () => {
  const renderWithProviders = () => {
    return render(
      <TestApp initialEntries={['/signup']}>
        <SignUpForm />
      </TestApp>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    renderWithProviders();
  });

  it('should render the signup page with all required elements', () => {
    expect(
      screen.getByRole('heading', { name: 'Sign Up' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign up with Google' })
    ).toBeInTheDocument();

    const signInLink = screen.getByRole('link', { name: 'Sign in' });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.getAttribute('href')).toBe('/login');
  });

  it('should show validation errors when submitting with empty data', async () => {
    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters.')
      ).toBeInTheDocument();
    });
  });

  it('should show validation errors when submitting with invalid data', async () => {
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '456' } });

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters.')
      ).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('should show password format validation error for weak password', async () => {
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'weakpassword' } });

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should show password mismatch error when passwords do not match', async () => {
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'Password456!' },
    });

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('should call the register function when submitting with valid data', async () => {
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'Password123!' },
    });

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });
  });

  it('should accept valid password with all required characters', async () => {
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Test with a password that has all required characters
    const validPassword = 'MySecure123!';
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: validPassword },
    });

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@test.com',
        password: validPassword,
        confirmPassword: validPassword,
      });
    });

    // Should not show password format error
    expect(
      screen.queryByText(
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
      )
    ).not.toBeInTheDocument();
  });

  it('should redirect to Google OAuth when clicking Google signup button', () => {
    const googleButton = screen.getByRole('button', {
      name: 'Sign up with Google',
    });
    fireEvent.click(googleButton);

    expect(window.location.href).toBe(
      'http://localhost:3000/api/v1/auth/google'
    );
  });

  it('should have correct form field placeholders', () => {
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument();
  });

  it('should have proper form field types', () => {
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
