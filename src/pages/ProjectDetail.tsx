import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  ArrowLeft,
  Calendar,
  Paperclip,
  CheckSquare,
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

// Mock data for now - will be replaced with API data
const mockAssignees = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
];

const mockAttachments = [
  { id: '1', name: 'Design wireframes.pdf', size: '4.2MB' },
  { id: '2', name: 'User research.pdf', size: '2.8MB' },
  { id: '3', name: 'Technical specs.pdf', size: '1.5MB' },
];

const mockTasks = [
  {
    id: '1',
    name: 'Project management dashboard',
    completed: false,
    assignees: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
    ],
    dueDate: 'Today',
    isToday: true,
  },
  {
    id: '2',
    name: 'Fix errors',
    completed: false,
    assignees: [
      {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      },
    ],
    dueDate: 'Tomorrow',
    isToday: false,
  },
  {
    id: '3',
    name: 'Meeting with dev. team',
    completed: false,
    assignees: [
      {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    ],
    dueDate: '16 Jul',
    isToday: false,
  },
];

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
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
    <div className="space-y-8">
      {/* Back Button - Full Width */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge
                variant={
                  project.status === ProjectStatus.ACTIVE
                    ? 'default'
                    : 'secondary'
                }
                className="text-xs"
              >
                {project.status === ProjectStatus.ACTIVE
                  ? t('projects.status.active')
                  : t('projects.status.archived')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Figma Design System</span>
              <span>›</span>
              <span>{project.name}</span>
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
                {isDeleting
                  ? t('projects.detail.deleting')
                  : t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* People Section */}
          <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t('projects.detail.owner')}
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.ownerId}`}
                    />
                    <AvatarFallback className="text-xs">
                      {project.ownerId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* <span className="text-sm text-muted-foreground">
                    {project.ownerId}
                  </span> */}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t('projects.detail.contributors')}
                </span>
                <div className="flex -space-x-2">
                  {mockAssignees.map(contributor => (
                    <Avatar
                      key={contributor.id}
                      className="h-8 w-8 border-2 border-background"
                    >
                      <AvatarImage
                        src={contributor.avatar}
                        alt={contributor.name}
                      />
                      <AvatarFallback className="text-xs">
                        {contributor.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-6 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t('projects.dates.created')}
                </span>
                <Badge variant="outline" className="text-xs font-normal">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(project.createdAt, currentLanguage)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t('projects.dates.updated')}
                </span>
                <Badge variant="outline" className="text-xs font-normal">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(project.updatedAt, currentLanguage)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                {t('projects.detail.description')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                {project.description}
              </p>
            </div>
          )}

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
              {t('projects.detail.attachments')}
            </h3>
            <div className="flex gap-2 pl-4">
              {mockAttachments.map(attachment => (
                <Button
                  key={attachment.id}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-3 flex items-center gap-2 text-left hover:bg-muted border border-border/50"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs">
                    <div className="font-medium text-foreground">
                      {attachment.name}
                    </div>
                    <div className="text-muted-foreground">
                      {attachment.size}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                {t('projects.detail.tasks')}
              </h3>

              <div className="bg-card border border-border/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-8 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="flex-1">{t('projects.detail.subtask')}</span>
                  <span className="w-24 text-center">
                    {t('projects.detail.activity')}
                  </span>
                </div>

                <div className="space-y-2">
                  {mockTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-3 hover:bg-secondary/80 rounded-md px-3 -mx-1 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-4 h-4 border border-border rounded-sm bg-background">
                          {task.completed && (
                            <CheckSquare className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <span className="text-sm text-foreground font-medium">
                          {task.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-1">
                          {task.assignees.map(assignee => (
                            <Avatar
                              key={assignee.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarImage
                                src={assignee.avatar}
                                alt={assignee.name}
                              />
                              <AvatarFallback className="text-xs">
                                {assignee.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>

                        <Badge
                          variant={task.isToday ? 'destructive' : 'outline'}
                          className="text-xs font-normal min-w-[70px] justify-center"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.dueDate}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
