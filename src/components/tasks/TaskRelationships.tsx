import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskLinkBadge } from './TaskLinkBadge';
import { CreateSubtaskModal } from './CreateSubtaskModal';
import type { Task, TaskLinkType, TaskLinkWithTask } from '@/types/task';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface TaskRelationshipsProps {
  projectId: string;
  taskId: string;
  task: Task;
  availableTasks: Task[];
  className?: string;
}

export const TaskRelationships = ({
  projectId,
  taskId,
  task,
  availableTasks,
  className,
}: TaskRelationshipsProps) => {
  // Extract data from task prop (no separate API calls needed!)
  const links = task.links || [];
  const children = task.hierarchy?.children || [];
  const parents = task.hierarchy?.parents || [];

  const hasSubtasks = children.length > 0;
  const hasLinkedTasks = links.length > 0;
  const hasParents = parents.length > 0;

  // Auto-collapse sections when empty, expand when they have content
  const [expandedSections, setExpandedSections] = useState({
    subtasks: hasSubtasks,
    linkedTasks: hasLinkedTasks,
  });

  // Add subtask modal state
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);

  // Get current task for the modal
  const currentTask = availableTasks.find(task => task.id === taskId);

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
        <Card className={cn(!expandedSections.subtasks && 'pb-1')}>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateSubtaskModal(true)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subtask
                </Button>
              </div>
            </CardHeader>
            {expandedSections.subtasks && (
              <CardContent className="pt-0">
                {hasSubtasks && (
                  <div className="space-y-1">
                    {children?.map(hierarchyItem => {
                      const subtask = hierarchyItem.childTask;
                      if (!subtask) {
                        console.warn(
                          'Child task is undefined for hierarchy item:',
                          hierarchyItem
                        );
                        return null;
                      }

                      return (
                        <div
                          key={hierarchyItem.id}
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
                          <Link to={`/projects/${projectId}/${subtask.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
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
                {hasLinkedTasks && (
                  <div className="space-y-1">
                    {(() => {
                      // Get unique linked tasks (backend now handles bidirectional relationships correctly)
                      const uniqueLinks =
                        links?.reduce(
                          (acc, link) => {
                            // Determine which task to show based on the relationship
                            const relatedTask =
                              link.sourceTaskId === taskId
                                ? link.targetTask ||
                                  getTaskById(link.targetTaskId)
                                : link.sourceTask ||
                                  getTaskById(link.sourceTaskId);

                            if (!relatedTask) return acc;

                            // Check if we already have this related task
                            const existingIndex = acc.findIndex(
                              item => item.relatedTask.id === relatedTask.id
                            );

                            if (existingIndex === -1) {
                              acc.push({
                                link,
                                relatedTask,
                                displayType: link.type,
                              });
                            }

                            return acc;
                          },
                          [] as Array<{
                            link: TaskLinkWithTask;
                            relatedTask: Task;
                            displayType: TaskLinkType;
                          }>
                        ) || [];

                      return uniqueLinks.map(
                        ({ link, relatedTask, displayType }) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <TaskLinkBadge type={displayType} size="sm" />
                              <span className="text-sm font-medium">
                                {relatedTask.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-xs',
                                  getTaskStatusColor(relatedTask.status)
                                )}
                              >
                                {relatedTask.status}
                              </Badge>
                            </div>
                            <Link
                              to={`/projects/${projectId}/${relatedTask.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        )
                      );
                    })()}
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
              {parents?.map(hierarchyItem => {
                const parent = hierarchyItem.parentTask;
                if (!parent) {
                  console.warn(
                    'Parent task is undefined for hierarchy item:',
                    hierarchyItem
                  );
                  return null;
                }

                return (
                  <div
                    key={hierarchyItem.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm font-medium">
                        {parent.title}
                      </span>
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
                    <Link to={`/projects/${projectId}/${parent.id}`}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Subtask Modal */}
      {currentTask && (
        <CreateSubtaskModal
          isOpen={showCreateSubtaskModal}
          onClose={() => setShowCreateSubtaskModal(false)}
          parentTask={currentTask}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default TaskRelationships;
