import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/services/users';
import type { UpdateProfileRequest, User } from '@/types/user';

type UseUpdateUserProfileResult = {
  mutateAsync: (payload: UpdateProfileRequest) => Promise<User>;
  isPending: boolean;
};

export function useUpdateUserProfile(): UseUpdateUserProfileResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      UsersService.updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
