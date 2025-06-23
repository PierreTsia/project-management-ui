import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { LoadingCard, Skeleton } from '@/components/LoadingStates';
import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/types/project';

export function Projects() {
  const { t } = useTranslations();
  const { data: projectsResponse, isLoading, error } = useProjects();

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  const PageHeader = () => (
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

  return (
    <div className="space-y-6">
      <PageHeader />

      {projects.length === 0 ? (
        <LoadingCard
          title={t('projects.emptyState')}
          description={t('projects.emptyStateDescription')}
          showSpinner={false}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
