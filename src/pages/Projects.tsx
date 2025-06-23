import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Get pagination params from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('limit') || '6', 10);

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    page: currentPage,
    limit: pageSize,
  });

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', String(newPageSize));
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
  };

  if (isLoading) {
    return <ProjectsPageSkeleton pageSize={pageSize} />;
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
          onPageSizeChange={handlePageSizeChange}
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
  const totalPages = Math.ceil(total / pageSize);

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

          <ProjectPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
