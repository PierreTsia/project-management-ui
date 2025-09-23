import type { ColumnDef } from '@tanstack/react-table';
import type { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';

import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu';
import DueDateCell from './due-date-cell';
import ProjectNameCell from './project-name-cell';
import { getStatusBadgeVariant } from './cell-utils';

export const taskColumns = ({
  onToggleAll,
  onViewTask,
  onEditTask,
  onAssignToMeTask,
  onDeleteTask,
}: {
  onToggleAll?: (selected: boolean) => void;
  onViewTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onAssignToMeTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
} = {}): ColumnDef<Task>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => {
          table.toggleAllPageRowsSelected(!!value);
          onToggleAll?.(!!value);
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Title
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <Link
          to={`/projects/${row.original.projectId}/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
        </Link>
        {row.original.description ? (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.original.description}
          </div>
        ) : null}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'projectName',
    header: 'Project',
    cell: ({ row }) => <ProjectNameCell name={row.original.projectName} />,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {row.original.status.replace('_', ' ')}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Priority
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-1">
        {row.original.priority === 'HIGH' ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : null}
        <span className="text-sm">{row.original.priority}</span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'assignee',
    header: 'Assignee',
    cell: ({ row }) =>
      row.original.assignee ? (
        <UserAvatar user={row.original.assignee} size="sm" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-muted" />
      ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Due Date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <DueDateCell value={row.original.dueDate ?? ''} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <TaskActionsMenu
        onView={() => onViewTask?.(row.original)}
        onEdit={() => onEditTask?.(row.original)}
        onAssignToMe={() => onAssignToMeTask?.(row.original)}
        onDelete={() => onDeleteTask?.(row.original)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
];
