import { Calendar, CheckCircle, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { useTranslations } from '@/hooks/useTranslations';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t, currentLanguage } = useTranslations();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow flex flex-col cursor-pointer hover:bg-accent/50"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge
            variant={project.status === 'ACTIVE' ? 'default' : 'outline'}
            className="whitespace-nowrap"
          >
            {project.status === 'ACTIVE' ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <Archive className="mr-1 h-3 w-3" />
            )}
            {project.status === 'ACTIVE'
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
              {formatDate(project.createdAt, currentLanguage)}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {t('projects.dates.updated')}{' '}
              {formatDate(project.updatedAt, currentLanguage)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
