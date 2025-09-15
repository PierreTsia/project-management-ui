import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu';
import type { Task } from '@/types/task';
import { TASK_STATUSES } from '@/types/task';
import { format } from 'date-fns';

interface TaskBoardProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string, selected: boolean) => void;
}

export const TaskBoard = ({
  tasks,
  selectedTasks,
  onTaskSelect,
}: TaskBoardProps) => {
  const [_hoveredTask, setHoveredTask] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-muted/50 border-border hover:bg-muted/70';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15';
      case 'DONE':
        return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15';
      default:
        return 'bg-muted/50 border-border hover:bg-muted/70';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'HIGH') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd');
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const groupTasksByStatus = () => {
    const grouped: Record<string, Task[]> = {};
    TASK_STATUSES.forEach(status => {
      grouped[status] = tasks.filter(task => task.status === status);
    });
    return grouped;
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Done';
      default:
        return status;
    }
  };

  const groupedTasks = groupTasksByStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TASK_STATUSES.map(status => (
        <div key={status} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{getStatusTitle(status)}</h3>
            <Badge variant="outline" className="text-xs">
              {groupedTasks[status].length}
            </Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {groupedTasks[status].length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No tasks
              </div>
            ) : (
              groupedTasks[status].map(task => (
                <Card
                  key={task.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getStatusColor(task.status)} ${
                    selectedTasks.includes(task.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={checked =>
                            onTaskSelect(task.id, !!checked)
                          }
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium line-clamp-2 text-foreground">
                            {task.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(task.priority)}
                        <TaskActionsMenu />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {/* Project */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">
                          {task.projectName}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {task.assignee ? (
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs">
                                {task.assignee.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={`text-xs whitespace-nowrap ${
                            task.dueDate && isOverdue(task.dueDate)
                              ? 'text-red-500 font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
