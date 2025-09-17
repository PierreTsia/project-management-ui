import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@/services/auth';
import type { UpdatePasswordRequest } from '@/types/user';

type UseUpdatePasswordResult = {
  mutateAsync: (payload: UpdatePasswordRequest) => Promise<{ message: string }>;
  isPending: boolean;
};

export function useUpdatePassword(): UseUpdatePasswordResult {
  const mutation = useMutation({
    mutationFn: (payload: UpdatePasswordRequest) =>
      AuthService.updatePassword(payload),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
