import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useTranslations } from '@/hooks/useTranslations';
import { useProjects } from '@/hooks/useProjects';
import { useContributors } from '@/hooks/useContributors';
import type { ContributorsParams } from '@/types/contributor';
import type { ProjectRole } from '@/types/project';
import { TeamPageHeader } from '@/components/team/TeamPageHeader';
import { TeamFilters } from '@/components/team/TeamFilters';
import { TeamCard } from '@/components/team/TeamCard';
import { TeamPagination } from '@/components/team/TeamPagination';

const DEFAULT_PAGE_SIZE = 20;
const CLEAR_VALUE = '__CLEAR__';

export const Team = () => {
  const { t } = useTranslations();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get all params from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(
    searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE),
    10
  );
  const query = searchParams.get('q') || '';
  const role = searchParams.get('role') as ProjectRole | undefined;
  const projectId = searchParams.get('projectId') || undefined;
  const sort =
    (searchParams.get('sort') as 'name' | 'joinedAt' | 'projectsCount') ||
    'name';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  const params: ContributorsParams = {
    ...(query && { q: query }),
    ...(role && { role }),
    ...(projectId && { projectId }),
    sort,
    order,
    page: currentPage,
    pageSize,
  };

  const { data: projectsData } = useProjects();
  const { data, isLoading, isError } = useContributors(params);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Create debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        updateUrlParams({
          q: searchQuery,
          page: '1', // Reset to first page when searching
        });
      }, 500),
    [updateUrlParams]
  );

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: String(page) });
  };

  const handleSearchChange = (newQuery: string) => {
    debouncedSearch(newQuery);
  };

  const handleRoleChange = (newRole: string) => {
    updateUrlParams({
      role: newRole === CLEAR_VALUE ? undefined : newRole,
      page: '1', // Reset to first page when filtering
    });
  };

  const handleProjectChange = (newProjectId: string) => {
    updateUrlParams({
      projectId: newProjectId === CLEAR_VALUE ? undefined : newProjectId,
      page: '1', // Reset to first page when filtering
    });
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(
      1,
      Math.ceil(data.total / (data.limit || DEFAULT_PAGE_SIZE))
    );
  }, [data]);

  const contributors = data?.contributors ?? [];

  const handleAddClick = () => {
    // TODO: Implement global invite modal
    console.log('Add contributor clicked');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4">
      <div className="space-y-6">
        <TeamPageHeader onAddClick={handleAddClick} />

        <TeamFilters
          query={query}
          {...(role && { role })}
          {...(projectId && { projectId })}
          projects={projectsData?.projects || []}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onProjectChange={handleProjectChange}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <div className="text-muted-foreground">{t('common.loading')}</div>
          )}
          {isError && (
            <div className="text-destructive">{t('common.error')}</div>
          )}
          {!isLoading && contributors.length === 0 && (
            <div className="text-muted-foreground">
              {t('projects.noResults')}
            </div>
          )}

          {contributors.map(contributor => (
            <TeamCard key={contributor.user.id} contributor={contributor} />
          ))}
        </div>

        {contributors.length > 0 && (
          <TeamPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={data?.total || 0}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};
