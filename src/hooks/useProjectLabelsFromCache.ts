import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getNameMapFromCache,
  getStatusMapFromCache,
  subscribeToProjectCache,
} from '@/lib/project-cache';

export const useProjectLabelsFromCache = (
  ids?: ReadonlyArray<string>
): ReadonlyMap<string, string> => {
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);
  const [labels, setLabels] = useState<ReadonlyMap<string, string>>(new Map());

  useEffect(() => {
    const unsub = subscribeToProjectCache(queryClient, () =>
      setTick(t => t + 1)
    );
    return unsub;
  }, [queryClient]);

  useEffect(() => {
    const names = getNameMapFromCache(queryClient, ids);
    const statuses = getStatusMapFromCache(queryClient, ids);
    if (!ids) {
      setLabels(names);
      return;
    }
    const entries = ids.map(id => {
      const name = names.get(id);
      if (!name) return [id, id] as const;
      const status = statuses.get(id);
      const label = status === 'ARCHIVED' ? `${name} (Archived)` : name;
      return [id, label] as const;
    });
    setLabels(new Map(entries));
  }, [queryClient, ids, tick]);

  return labels;
};

export default useProjectLabelsFromCache;
