import type { QueryClient, Query, QueryKey } from '@tanstack/react-query';
import { projectKeys } from '@/hooks/useProjects';
import type {
  ProjectStatus,
  SearchProjectsResponse,
  Project,
} from '@/types/project';

const isSameKeyPrefix = (target: QueryKey, prefix: QueryKey): boolean => {
  if (prefix.length > target.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (target[i] !== prefix[i]) return false;
  }
  return true;
};

const collectStatusesFromQueries = (
  queries: ReadonlyArray<Query>
): ReadonlyMap<string, ProjectStatus> => {
  const statusById = new Map<string, ProjectStatus>();
  queries.forEach(q => {
    const key = q.queryKey as QueryKey;
    const data = q.state.data as unknown;
    if (isSameKeyPrefix(key, projectKeys.lists())) {
      const list = data as SearchProjectsResponse | undefined;
      const projects = list?.projects || [];
      projects.forEach(p => {
        if (p.id && p.status) statusById.set(p.id, p.status);
      });
    } else if (isSameKeyPrefix(key, projectKeys.details())) {
      const detail = data as Project | undefined;
      if (detail?.id && detail?.status)
        statusById.set(detail.id, detail.status);
    }
  });
  return statusById;
};

export const getStatusMapFromCache = (
  queryClient: QueryClient,
  ids?: ReadonlyArray<string>
): ReadonlyMap<string, ProjectStatus> => {
  const queries = queryClient
    .getQueryCache()
    .getAll()
    .filter(q => {
      const key = q.queryKey as QueryKey;
      return (
        isSameKeyPrefix(key, projectKeys.lists()) ||
        isSameKeyPrefix(key, projectKeys.details())
      );
    });
  const all = collectStatusesFromQueries(queries);
  if (!ids || ids.length === 0) return all;
  const filtered = new Map<string, ProjectStatus>();
  ids.forEach(id => {
    const s = all.get(id);
    if (s) filtered.set(id, s);
  });
  return filtered;
};

export const getStatusByIdFromCache = (
  queryClient: QueryClient,
  id: string
): ProjectStatus | undefined =>
  getStatusMapFromCache(queryClient, [id]).get(id);

export type CacheUnsubscribe = () => void;

export const getNameMapFromCache = (
  queryClient: QueryClient,
  ids?: ReadonlyArray<string>
): ReadonlyMap<string, string> => {
  const nameById = new Map<string, string>();
  const queries = queryClient
    .getQueryCache()
    .getAll()
    .filter(q => {
      const key = q.queryKey as QueryKey;
      return (
        isSameKeyPrefix(key, projectKeys.lists()) ||
        isSameKeyPrefix(key, projectKeys.details())
      );
    });
  queries.forEach(q => {
    const key = q.queryKey as QueryKey;
    const data = q.state.data as unknown;
    if (isSameKeyPrefix(key, projectKeys.lists())) {
      const list = data as SearchProjectsResponse | undefined;
      const projects = list?.projects || [];
      projects.forEach(p => {
        if (p.id && p.name) nameById.set(p.id, p.name);
      });
    } else if (isSameKeyPrefix(key, projectKeys.details())) {
      const detail = data as Project | undefined;
      if (detail?.id && detail?.name) nameById.set(detail.id, detail.name);
    }
  });
  if (!ids || ids.length === 0) return nameById;
  const filtered = new Map<string, string>();
  ids.forEach(id => {
    const n = nameById.get(id);
    if (n) filtered.set(id, n);
  });
  return filtered;
};

export const getNameByIdFromCache = (
  queryClient: QueryClient,
  id: string
): string | undefined => getNameMapFromCache(queryClient, [id]).get(id);

export const subscribeToProjectCache = (
  queryClient: QueryClient,
  listener: () => void
): CacheUnsubscribe => {
  const unsubscribe = queryClient.getQueryCache().subscribe(event => {
    const key = (event.query?.queryKey || []) as QueryKey;
    if (
      isSameKeyPrefix(key, projectKeys.lists()) ||
      isSameKeyPrefix(key, projectKeys.details())
    ) {
      listener();
    }
  });
  return () => unsubscribe();
};
