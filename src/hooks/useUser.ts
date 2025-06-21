import { useQuery } from '@tanstack/react-query';
import { UsersService } from '@/services/users';

const FIVE_MINUTES = 1000 * 60 * 5;

export const useUser = () => {
  const token = localStorage.getItem('token');

  return useQuery({
    queryKey: ['user'],
    queryFn: () => UsersService.whoami(),
    enabled: !!token,
    staleTime: FIVE_MINUTES,
    retry: 1,
  });
};
