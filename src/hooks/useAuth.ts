import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from '@/types/auth';

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
    // We can add onError for user feedback later
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (response: LoginResponse) => {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      queryClient.setQueryData(['user'], response.user);
      navigate('/');
    },
  });
};
