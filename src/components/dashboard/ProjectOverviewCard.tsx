import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DashboardProject } from '@/types/dashboard';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, Clock, Circle } from 'lucide-react';

interface ProjectOverviewCardProps {
  project: DashboardProject;
  loading?: boolean;
  className?: string;
  testId?: string;
}

export function ProjectOverviewCard({
  project,
  loading = false,
  className,
  testId,
}: ProjectOverviewCardProps) {
  if (loading) {
    return (
      <Card
        className={cn('', className)}
        data-testid={testId ?? 'project-overview-card-skeleton'}
      >
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'archived':
        return <Circle className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <Card
      className={cn('hover:shadow-md transition-shadow', className)}
      data-testid={testId}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <Badge
            className={cn(
              'flex items-center gap-1 text-xs',
              getStatusColor(project.status)
            )}
          >
            {getStatusIcon(project.status)}
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.taskCount} tasks</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">My Tasks: </span>
            <span className="font-medium">
              {project.assignedTaskCount || 0}
            </span>
          </div>
          <Button asChild size="sm">
            <Link to={`/projects/${project.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
