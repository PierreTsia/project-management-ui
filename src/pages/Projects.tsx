import { useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useTranslations } from '@/hooks/useTranslations';
import { useProjects } from '@/hooks/useProjects';
import { useProjectsQueryParams } from '@/hooks/useProjectsQueryParams';
import { LoadingCard } from '@/components/LoadingStates';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectsPageSkeleton } from '@/components/projects/ProjectsPageSkeleton';
import { ProjectPagination } from '@/components/projects/ProjectPagination';
import { ProjectsPageHeader } from '@/components/projects/ProjectsPageHeader';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import type { Project } from '@/types/project';

export function Projects() {
  const { t } = useTranslations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use the query params hook
  const { filters, updateFilters, updatePage, clearFilters } =
    useProjectsQueryParams();

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    page: filters.page || 1,
    limit: filters.limit || 6,
    ...(filters.query && { query: filters.query }),
    ...(filters.status && { status: filters.status }),
  });

  // Create debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        updateFilters(
          {
            query: searchQuery,
          },
          true
        ); // Reset to first page when searching
      }, 500),
    [updateFilters]
  );

  const handlePageSizeChange = (newPageSize: number) => {
    updateFilters(
      {
        limit: newPageSize,
      },
      true
    ); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    updatePage(page);
  };

  const handleSearchChange = (newQuery: string) => {
    debouncedSearch(newQuery);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'all') {
      updateFilters({}, true); // Reset to first page when filtering
    } else {
      updateFilters(
        {
          status: newStatus as 'ACTIVE' | 'ARCHIVED',
        },
        true
      ); // Reset to first page when filtering
    }
  };

  const handleClearFilters = () => {
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    clearFilters();
  };

  const handleNewProject = () => {
    setIsCreateModalOpen(true);
  };

  const pageSize = filters.limit || 6;
  const query = filters.query || '';
  const status = filters.status;
  const currentPage = filters.page || 1;

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
          onClearFilters={handleClearFilters}
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
        onClearFilters={handleClearFilters}
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
