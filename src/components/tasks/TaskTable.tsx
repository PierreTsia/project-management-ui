import { useState } from 'react';
// removed unused Button import
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { PaginationItems } from '@/components/PaginationItems';
import { Calendar, AlertCircle } from 'lucide-react';
import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu';
import type { Task } from '@/types/task';
import { format } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  selectedTasks: string[];
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onPageChange: (page: number) => void;
}

export const TaskTable = ({
  tasks,
  pagination,
  selectedTasks,
  onTaskSelect,
  onSelectAll,
  onPageChange,
}: TaskTableProps) => {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'TODO':
        return 'outline';
      default:
        return 'outline';
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

  const allTasksSelected =
    tasks.length > 0 && tasks.every(task => selectedTasks.includes(task.id));

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allTasksSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No tasks found. Try adjusting your filters.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => (
                <TableRow
                  key={task.id}
                  className="group hover:bg-muted/50"
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked: boolean) =>
                        onTaskSelect(task.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{task.projectName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(task.priority)}
                      <span className="text-sm">{task.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <UserAvatar
                        user={task.assignee}
                        size="sm"
                        className="flex items-center gap-2"
                        showName
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm whitespace-nowrap ${
                          isOverdue(task.dueDate)
                            ? 'text-red-500 font-medium'
                            : ''
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TaskActionsMenu
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        hoveredTask === task.id ? 'opacity-100' : ''
                      }`}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} tasks
          </div>
          <PaginationItems
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
