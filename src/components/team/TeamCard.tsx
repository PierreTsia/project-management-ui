import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RoleBadge } from '@/components/projects/contributors/RoleBadge';
import { useTranslations } from '@/hooks/useTranslations';
import type { ContributorAggregate } from '@/types/contributor';
import type { ProjectRole } from '@/types/project';

const PROJECTS_PREVIEW_LIMIT = 5;

interface TeamCardProps {
  contributor: ContributorAggregate;
}

export function TeamCard({ contributor }: TeamCardProps) {
  const { t } = useTranslations();
  const preview = contributor.projectsPreview.slice(0, PROJECTS_PREVIEW_LIMIT);
  const overflow = Math.max(
    0,
    contributor.projectsPreview.length - PROJECTS_PREVIEW_LIMIT
  );

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3">
        <UserAvatar user={contributor.user} size="lg" />
        <div className="min-w-0">
          <CardTitle className="truncate text-base">
            {contributor.user.name || contributor.user.email}
          </CardTitle>
          <div className="truncate text-sm text-muted-foreground">
            {contributor.user.email}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 min-h-[80px]">
          {preview.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              title={project.name}
            >
              <Badge
                variant="default"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1 border text-sm"
              >
                <span className="truncate max-w-[180px]">{project.name}</span>
                <RoleBadge role={project.role as ProjectRole} />
              </Badge>
            </Link>
          ))}
          {overflow > 0 && <Badge variant="outline">+{overflow}</Badge>}
        </div>
        <CardFooter className="flex border-t justify-between items-center pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {contributor.projectsCount}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('projects.title')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{contributor.roles.length}</div>
            <div className="text-sm text-muted-foreground">
              {t('projects.contributors.role')}
            </div>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
