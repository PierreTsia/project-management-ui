import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ProjectStatus } from '@/types/project';
import {
  getStatusMapFromCache,
  subscribeToProjectCache,
} from '@/lib/project-cache';

export const useProjectStatusesFromCache = (
  ids?: ReadonlyArray<string>
): ReadonlyMap<string, ProjectStatus> => {
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeToProjectCache(queryClient, () =>
      setTick(t => t + 1)
    );
    return unsub;
  }, [queryClient]);

  return useMemo(
    () => getStatusMapFromCache(queryClient, ids),
    [queryClient, ids, tick]
  );
};

export default useProjectStatusesFromCache;
