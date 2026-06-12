import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../lib/api';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 30_000,
  });
};
