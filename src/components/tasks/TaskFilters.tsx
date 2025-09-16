import { useState } from 'react';
import { memo } from 'react';
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
import { useTranslations } from '@/hooks/useTranslations';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/types/task';

interface TaskFiltersProps {
  filters: GlobalSearchTasksParams;
  onFiltersChange: (filters: Partial<GlobalSearchTasksParams>) => void;
}

const ALL_SENTINEL = '__ALL__';

const TaskFiltersInner = ({ filters, onFiltersChange }: TaskFiltersProps) => {
  const { t } = useTranslations();
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
    const clearedFilters: Partial<GlobalSearchTasksParams> = {
      query: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('tasks.filters.title')}</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                {t('tasks.filters.clear')}
              </Button>
            )}
            <Button size="sm" onClick={applyFilters}>
              {t('tasks.filters.apply')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{t('common.search')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('tasks.filters.searchPlaceholder')}
              value={localFilters.query || ''}
              onChange={e => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>{t('tasks.filters.status')}</Label>
            <Select
              value={localFilters.status ?? ALL_SENTINEL}
              onValueChange={value =>
                handleFilterChange(
                  'status',
                  value === ALL_SENTINEL ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.filters.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>
                  {t('tasks.filters.allStatuses')}
                </SelectItem>
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
            <Label>{t('tasks.filters.priority')}</Label>
            <Select
              value={localFilters.priority ?? ALL_SENTINEL}
              onValueChange={value =>
                handleFilterChange(
                  'priority',
                  value === ALL_SENTINEL ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.filters.allPriorities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>
                  {t('tasks.filters.allPriorities')}
                </SelectItem>
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
            <Label>{t('tasks.filters.assignee')}</Label>
            <Select
              value={localFilters.assigneeFilter ?? ALL_SENTINEL}
              onValueChange={value =>
                handleFilterChange(
                  'assigneeFilter',
                  value === ALL_SENTINEL ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.filters.allAssignees')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>
                  {t('tasks.filters.allAssignees')}
                </SelectItem>
                <SelectItem value="me">
                  {t('tasks.filters.assignedToMe')}
                </SelectItem>
                <SelectItem value="unassigned">
                  {t('tasks.filters.unassigned')}
                </SelectItem>
                <SelectItem value="any">
                  {t('tasks.filters.anyAssignee')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>{t('tasks.filters.sortBy')}</Label>
            <Select
              value={localFilters.sortBy ?? ALL_SENTINEL}
              onValueChange={value =>
                handleFilterChange(
                  'sortBy',
                  value === ALL_SENTINEL ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.filters.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>
                  {t('tasks.filters.defaultSort')}
                </SelectItem>
                <SelectItem value="createdAt">
                  {t('tasks.filters.createdDate')}
                </SelectItem>
                <SelectItem value="dueDate">
                  {t('tasks.filters.dueDate')}
                </SelectItem>
                <SelectItem value="priority">
                  {t('tasks.filters.priority')}
                </SelectItem>
                <SelectItem value="status">
                  {t('tasks.filters.status')}
                </SelectItem>
                <SelectItem value="title">
                  {t('tasks.filters.titleField')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDateFrom">
              {t('tasks.filters.dueDateFrom')}
            </Label>
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
            <Label htmlFor="dueDateTo">{t('tasks.filters.dueDateTo')}</Label>
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
          <Label>{t('tasks.filters.quickFilters')}</Label>
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
                {t('tasks.filters.overdueOnly')}
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
                {t('tasks.filters.hasDueDate')}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Prevent re-rendering after initial mount to avoid Radix Select re-init loops
export const TaskFilters = memo(TaskFiltersInner, () => true);

export default TaskFilters;
