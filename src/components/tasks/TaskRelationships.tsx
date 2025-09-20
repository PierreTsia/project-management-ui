import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskLinkBadge } from './TaskLinkBadge';
import {
  useTaskLinksDetailed,
  useTaskChildren,
  useTaskParents,
} from '@/hooks/useTasks';
import type { Task } from '@/types/task';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TaskRelationshipsProps {
  projectId: string;
  taskId: string;
  availableTasks: Task[];
  className?: string;
}

export const TaskRelationships = ({
  projectId,
  taskId,
  availableTasks,
  className,
}: TaskRelationshipsProps) => {
  const { data: links, isLoading: isLoadingLinks } = useTaskLinksDetailed(
    projectId,
    taskId
  );
  const { data: children, isLoading: isLoadingChildren } = useTaskChildren(
    projectId,
    taskId
  );
  const { data: parents } = useTaskParents(projectId, taskId);

  const hasSubtasks = (children?.length || 0) > 0;
  const hasLinkedTasks = (links?.length || 0) > 0;
  const hasParents = (parents?.length || 0) > 0;

  // Auto-collapse sections when empty, expand when they have content
  const [expandedSections, setExpandedSections] = useState({
    subtasks: hasSubtasks,
    linkedTasks: hasLinkedTasks,
  });

  // Update expanded state when data changes
  useEffect(() => {
    setExpandedSections(prev => ({
      subtasks: hasSubtasks ? true : prev.subtasks,
      linkedTasks: hasLinkedTasks ? true : prev.linkedTasks,
    }));
  }, [hasSubtasks, hasLinkedTasks]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskById = (taskId: string) => {
    return availableTasks.find(task => task.id === taskId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Subtasks Section - Below Description */}
      {hasSubtasks && (
        <Card>
          <motion.div
            animate={{ height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('subtasks')}
                    className="p-0 h-auto"
                  >
                    {expandedSections.subtasks ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Subtasks
                    {children && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {children.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            {expandedSections.subtasks && (
              <CardContent className="pt-0">
                {isLoadingChildren && (
                  <div className="text-sm text-muted-foreground py-2">
                    Loading subtasks...
                  </div>
                )}
                {!isLoadingChildren && hasSubtasks && (
                  <div className="space-y-1">
                    {children?.map(subtask => (
                      <div
                        key={subtask.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm font-medium">
                            {subtask.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              getTaskStatusColor(subtask.status)
                            )}
                          >
                            {subtask.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `/projects/${projectId}/tasks/${subtask.id}`,
                              '_blank'
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </motion.div>
        </Card>
      )}

      {/* Linked Tasks Section */}
      {hasLinkedTasks && (
        <Card>
          <motion.div
            animate={{ height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('linkedTasks')}
                    className="p-0 h-auto"
                  >
                    {expandedSections.linkedTasks ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Linked Tasks
                    {links && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {links.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            {expandedSections.linkedTasks && (
              <CardContent className="pt-0">
                {isLoadingLinks && (
                  <div className="text-sm text-muted-foreground py-2">
                    Loading linked tasks...
                  </div>
                )}
                {!isLoadingLinks && hasLinkedTasks && (
                  <div className="space-y-1">
                    {links?.map(link => {
                      const targetTask =
                        link.targetTask || getTaskById(link.targetTaskId);
                      if (!targetTask) return null;

                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <TaskLinkBadge type={link.type} size="sm" />
                            <span className="text-sm font-medium">
                              {targetTask.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                getTaskStatusColor(targetTask.status)
                              )}
                            >
                              {targetTask.status}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `/projects/${projectId}/tasks/${targetTask.id}`,
                                '_blank'
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </motion.div>
        </Card>
      )}

      {/* Parent Tasks Section (if any) */}
      {hasParents && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4 rotate-180" />
              Parent Tasks
              <Badge variant="secondary" className="ml-2 text-xs">
                {parents?.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {parents?.map(parent => (
                <div
                  key={parent.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm font-medium">{parent.title}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        getTaskStatusColor(parent.status)
                      )}
                    >
                      {parent.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/projects/${projectId}/tasks/${parent.id}`,
                        '_blank'
                      )
                    }
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskRelationships;
