import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
import { useTranslations } from '@/hooks/useTranslations';
import { useProjects } from '@/hooks/useProjects';
import { LoadingCard } from '@/components/LoadingStates';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectsPageSkeleton } from '@/components/projects/ProjectsPageSkeleton';
import { ProjectPagination } from '@/components/projects/ProjectPagination';
import { ProjectsPageHeader } from '@/components/projects/ProjectsPageHeader';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { ProjectStatus } from '@/types/project';
import type { Project } from '@/types/project';

export function Projects() {
  const { t } = useTranslations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get all params from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('limit') || '6', 10);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') as ProjectStatus | undefined;

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    page: currentPage,
    limit: pageSize,
    ...(query && { query }),
    ...(status && { status }),
  });

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
          query: searchQuery,
          page: '1', // Reset to first page when searching
        });
      }, 500),
    [updateUrlParams]
  );

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrlParams({
      limit: String(newPageSize),
      page: '1', // Reset to first page
    });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: String(page) });
  };

  const handleSearchChange = (newQuery: string) => {
    debouncedSearch(newQuery);
  };

  const handleStatusChange = (newStatus: string) => {
    updateUrlParams({
      status: newStatus === 'all' ? undefined : newStatus,
      page: '1', // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    updateUrlParams({
      query: undefined,
      status: undefined,
      page: '1',
    });
  };

  const handleNewProject = () => {
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return <ProjectsPageSkeleton pageSize={pageSize} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ProjectsPageHeader
          query={query}
          status={status}
          pageSize={pageSize}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageSizeChange={handlePageSizeChange}
          onClearFilters={clearFilters}
          onNewProject={handleNewProject}
        />
        <LoadingCard
          title={t('projects.loadError')}
          description={t('projects.loadErrorDescription')}
          showSpinner={false}
        />
      </div>
    );
  }

  const projects = projectsResponse?.projects || [];
  const total = projectsResponse?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <ProjectsPageHeader
        query={query}
        status={status}
        pageSize={pageSize}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPageSizeChange={handlePageSizeChange}
        onClearFilters={clearFilters}
        onNewProject={handleNewProject}
      />

      {!projects.length ? (
        <LoadingCard
          title={
            query || status ? t('projects.noResults') : t('projects.emptyState')
          }
          description={
            query || status
              ? t('projects.noResultsDescription')
              : t('projects.emptyStateDescription')
          }
          showSpinner={false}
        />
      ) : (
        <>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {t('projects.results.showing', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, total),
                total,
              })}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <ProjectPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
