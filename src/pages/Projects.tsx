import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { LoadingCard } from '@/components/LoadingStates';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectsPageSkeleton } from '@/components/projects/ProjectsPageSkeleton';
import { ProjectPagination } from '@/components/projects/ProjectPagination';
import { PageSizeSelector } from '@/components/projects/PageSizeSelector';
import type { Project } from '@/types/project';

export function Projects() {
  const { t } = useTranslations();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(6);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // First, get the total count with a minimal request
  const { data: countResponse } = useProjects({
    page: 1,
    limit: 1,
  });

  // Update total count when we get the response
  useEffect(() => {
    if (countResponse?.total !== undefined) {
      setTotalCount(countResponse.total);
    }
  }, [countResponse]);

  // Main data fetch with proper limit
  const actualLimit =
    pageSize === 'all' && totalCount ? totalCount : (pageSize as number);
  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    page: currentPage,
    limit: actualLimit,
  });

  if (isLoading) {
    return (
      <ProjectsPageSkeleton pageSize={pageSize === 'all' ? 6 : pageSize} />
    );
  }

  const PageHeader = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.projects')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('projects.newProject')}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <PageSizeSelector
          pageSize={pageSize}
          totalItems={projectsResponse?.total || totalCount || 0}
          onPageSizeChange={newPageSize => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
        />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
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
  const totalPages =
    pageSize === 'all' ? 1 : Math.ceil(total / (pageSize as number));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <PageHeader />

      {!projects.length ? (
        <LoadingCard
          title={t('projects.emptyState')}
          description={t('projects.emptyStateDescription')}
          showSpinner={false}
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {pageSize !== 'all' && (
            <ProjectPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
