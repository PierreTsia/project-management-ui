import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from '@/types/auth';
import type { ApiError } from '@/types/api';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: (response: LoginResponse) => {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      queryClient.setQueryData(['user'], response.user);
      navigate('/');
    },
    onError: (error: ApiError) => {
      // Log error for debugging, let component handle UI feedback
      console.error(
        'Login failed:',
        error.response?.data?.message || error.message
      );
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (_response: RegisterResponse, variables: RegisterRequest) => {
      navigate('/auth/check-email', {
        state: { email: variables.email },
      });
    },
  });
};

export const useConfirmEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { token: string }) => AuthService.confirmEmail(data),
    onSuccess: () => {
      navigate('/confirm-email-success');
    },
    onError: (error: ApiError) => {
      const errorMsg =
        error.response?.data?.message ||
        'Failed to confirm email. Please try again.';
      navigate(`/confirm-email-error?message=${encodeURIComponent(errorMsg)}`);
    },
  });
};

export const useResendConfirmation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      AuthService.resendConfirmation(data),
    onError: (error: ApiError) => {
      // Log error for debugging, let component handle UI feedback
      console.error(
        'Failed to resend confirmation email:',
        error.response?.data?.message || error.message
      );
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      queryClient.removeQueries({ queryKey: ['user'], exact: true });
      navigate('/login');
    },
  });
};
