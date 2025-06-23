import { Calendar, CheckCircle, Archive } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import { useTranslations } from '@/hooks/useTranslations';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslations();

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge
            variant={
              project.status === ProjectStatus.ACTIVE ? 'default' : 'outline'
            }
            className="whitespace-nowrap"
          >
            {project.status === ProjectStatus.ACTIVE ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <Archive className="mr-1 h-3 w-3" />
            )}
            {project.status === ProjectStatus.ACTIVE
              ? t('projects.status.active')
              : t('projects.status.archived')}
          </Badge>
        </div>
        {project.description && (
          <CardDescription className="pt-1">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {t('projects.dates.created')}{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {t('projects.dates.updated')}{' '}
              {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
