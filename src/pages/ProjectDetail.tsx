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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectContributors } from '@/components/projects/ProjectContributors';
import { ProjectDetailsHeader } from '@/components/projects/ProjectDetailsHeader';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { ProjectAttachments } from '@/components/projects/ProjectAttachments';
import { ProjectTasks } from '@/components/projects/ProjectTasks';
import { ArrowLeft, Calendar } from 'lucide-react';

import { ProjectStatus } from '@/types/project';
import { formatDate } from '@/lib/utils';

// Mock data for now - will be replaced with API data
const mockContributors = [
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

export const ProjectDetail = () => {
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

  const handleAttachmentClick = (attachment: {
    id: string;
    name: string;
    size: string;
  }) => {
    // TODO: Handle attachment download/view
    console.log('Attachment clicked:', attachment);
  };

  const handleTaskToggle = (taskId: string) => {
    // TODO: Handle task completion toggle
    console.log('Task toggle:', taskId);
  };

  const handleTaskAction = (taskId: string) => {
    // TODO: Handle task actions menu
    console.log('Task action:', taskId);
  };

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
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
        <ProjectDetailsHeader
          projectName={project.name}
          status={project.status}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />

        {/* Main Content */}
        <div className="space-y-8">
          {/* People Section */}
          <ProjectContributors
            owner={{
              id: project.ownerId,
              name: project.ownerId, // Will be replaced with actual user name from API
            }}
            contributors={mockContributors}
          />

          {/* Dates */}
          <div className="flex items-center gap-6">
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
          <ProjectAttachments
            attachments={mockAttachments}
            onAttachmentClick={handleAttachmentClick}
          />

          {/* Tasks Section */}
          <ProjectTasks
            tasks={mockTasks}
            onTaskToggle={handleTaskToggle}
            onTaskAction={handleTaskAction}
          />
        </div>
      </div>
    </div>
  );
};
