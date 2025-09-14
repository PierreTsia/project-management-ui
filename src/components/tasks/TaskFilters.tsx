import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search, Calendar } from 'lucide-react';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/types/task';

interface TaskFiltersProps {
  filters: GlobalSearchTasksParams;
  onFiltersChange: (filters: Partial<GlobalSearchTasksParams>) => void;
}

export const TaskFilters = ({ filters, onFiltersChange }: TaskFiltersProps) => {
  const [localFilters, setLocalFilters] =
    useState<Partial<GlobalSearchTasksParams>>(filters);

  const handleFilterChange = (
    key: keyof GlobalSearchTasksParams,
    value: string | boolean | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      status: undefined,
      priority: undefined,
      assigneeId: undefined,
      projectId: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      assigneeFilter: undefined,
      isOverdue: undefined,
      hasDueDate: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    value => value !== undefined && value !== '' && value !== false
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
            <Button size="sm" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search tasks..."
              value={localFilters.query || ''}
              onChange={e => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={value =>
                handleFilterChange('status', value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {TASK_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={localFilters.priority || ''}
              onValueChange={value =>
                handleFilterChange('priority', value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                {TASK_PRIORITIES.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={localFilters.assigneeFilter || ''}
              onValueChange={value =>
                handleFilterChange('assigneeFilter', value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All assignees</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="any">Any assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={localFilters.sortBy || ''}
              onValueChange={value =>
                handleFilterChange('sortBy', value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="createdAt">Created date</SelectItem>
                <SelectItem value="dueDate">Due date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDateFrom">Due date from</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dueDateFrom"
                type="date"
                value={localFilters.dueDateFrom || ''}
                onChange={e =>
                  handleFilterChange('dueDateFrom', e.target.value || undefined)
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDateTo">Due date to</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dueDateTo"
                type="date"
                value={localFilters.dueDateTo || ''}
                onChange={e =>
                  handleFilterChange('dueDateTo', e.target.value || undefined)
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label>Quick filters</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOverdue"
                checked={localFilters.isOverdue || false}
                onCheckedChange={checked =>
                  handleFilterChange('isOverdue', checked)
                }
              />
              <Label htmlFor="isOverdue" className="text-sm">
                Overdue only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDueDate"
                checked={localFilters.hasDueDate || false}
                onCheckedChange={checked =>
                  handleFilterChange('hasDueDate', checked)
                }
              />
              <Label htmlFor="hasDueDate" className="text-sm">
                Has due date
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
