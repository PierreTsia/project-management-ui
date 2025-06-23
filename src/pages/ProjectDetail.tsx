import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ProjectStatus } from '@/types/project';
import { formatDate } from '@/lib/utils';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: project, isLoading, error } = useProject(id!);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit project:', id);
  };

  const handleArchive = async () => {
    if (!project) return;

    const newStatus =
      project.status === ProjectStatus.ACTIVE
        ? ProjectStatus.ARCHIVED
        : ProjectStatus.ACTIVE;

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  const handleDelete = async () => {
    if (!project || !window.confirm(t('projects.detail.deleteConfirm'))) return;

    setIsDeleting(true);
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t('projects.detail.loadError')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              {t('projects.detail.subtitle')}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {project.status === ProjectStatus.ACTIVE
                ? t('projects.detail.archive')
                : t('projects.detail.unarchive')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? t('projects.detail.deleting') : t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {project.name}
              <Badge
                variant={
                  project.status === ProjectStatus.ACTIVE
                    ? 'default'
                    : 'secondary'
                }
              >
                {project.status === ProjectStatus.ACTIVE
                  ? t('projects.status.active')
                  : t('projects.status.archived')}
              </Badge>
            </CardTitle>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('projects.dates.created')}</span>
              <span>{formatDate(project.createdAt, currentLanguage)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('projects.dates.updated')}</span>
              <span>{formatDate(project.updatedAt, currentLanguage)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{t('projects.detail.owner')}</span>
              <span>{project.ownerId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Add more sections like tasks, team members, etc. */}
    </div>
  );
}
