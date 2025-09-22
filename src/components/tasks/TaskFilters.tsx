import { memo, useState, useEffect, useCallback } from 'react';

import { useForm } from 'react-hook-form';
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
import { X, Search, Filter, ChevronDown } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useActiveFilters } from '@/hooks/useActiveFilters';
import { createPayload } from '@/lib/object-utils';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/types/task';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, format } from 'date-fns';
import { AsyncMultiSelect } from '@/components/ui/async-multi-select';
import { ProjectsService } from '@/services/projects';

import { useProjectStatusesFromCache } from '@/hooks/useProjectStatusesFromCache';
import { useProjectLabelsFromCache } from '@/hooks/useProjectLabelsFromCache';

interface TaskFiltersProps {
  filters: GlobalSearchTasksParams;
  onFiltersChange: (filters: Partial<GlobalSearchTasksParams>) => void;
  onClose?: () => void;
}

const ALL_SENTINEL = '__ALL__';

export type FilterFormValues = {
  query: string;
  status?: string | undefined;
  priority?: string | undefined;
  assigneeFilter?: string | undefined;
  sortBy?: string | undefined;
  projectIds: string[];
  includeArchived: boolean;
  dueDateFrom?: Date | undefined;
  dueDateTo?: Date | undefined;
  isOverdue: boolean;
  hasDueDate: boolean;
};

const toFormDefaults = (f: GlobalSearchTasksParams): FilterFormValues => ({
  query: f.query ?? '',
  status: f.status ?? undefined,
  priority: f.priority ?? undefined,
  assigneeFilter: f.assigneeFilter ?? undefined,
  sortBy: f.sortBy ?? undefined,
  projectIds: f.projectIds ?? [],
  includeArchived: Boolean(f.includeArchived),
  dueDateFrom: f.dueDateFrom ? parseISO(f.dueDateFrom) : undefined,
  dueDateTo: f.dueDateTo ? parseISO(f.dueDateTo) : undefined,
  isOverdue: Boolean(f.isOverdue),
  hasDueDate: Boolean(f.hasDueDate),
});

const baseline: FilterFormValues = {
  query: '',
  status: undefined,
  priority: undefined,
  assigneeFilter: undefined,
  sortBy: undefined,
  projectIds: [],
  includeArchived: false,
  dueDateFrom: undefined,
  dueDateTo: undefined,
  isOverdue: false,
  hasDueDate: false,
};

const buildPayload = (
  values: FilterFormValues
): Partial<GlobalSearchTasksParams> =>
  createPayload<GlobalSearchTasksParams>([
    [Boolean(values.query?.trim()), 'query', values.query.trim()],
    [
      values.status !== ALL_SENTINEL,
      'status',
      values.status as GlobalSearchTasksParams['status'],
    ],
    [
      values.priority !== ALL_SENTINEL,
      'priority',
      values.priority as GlobalSearchTasksParams['priority'],
    ],
    [
      values.assigneeFilter !== ALL_SENTINEL,
      'assigneeFilter',
      values.assigneeFilter as GlobalSearchTasksParams['assigneeFilter'],
    ],
    [
      values.sortBy !== ALL_SENTINEL,
      'sortBy',
      values.sortBy as GlobalSearchTasksParams['sortBy'],
    ],
    [
      Array.isArray(values.projectIds) && values.projectIds.length > 0,
      'projectIds',
      values.projectIds,
    ],
    [values.includeArchived, 'includeArchived', true],
    [
      Boolean(values.dueDateFrom),
      'dueDateFrom',
      values.dueDateFrom ? format(values.dueDateFrom, 'yyyy-MM-dd') : undefined,
    ],
    [
      Boolean(values.dueDateTo),
      'dueDateTo',
      values.dueDateTo ? format(values.dueDateTo, 'yyyy-MM-dd') : undefined,
    ],
    [values.isOverdue, 'isOverdue', true],
    [values.hasDueDate, 'hasDueDate', true],
  ]);

const TaskFiltersInner = ({
  filters,
  onFiltersChange,
  onClose,
}: TaskFiltersProps) => {
  const { t } = useTranslations();

  const OVERFLOW_COUNTS = {
    xs: 2,
    sm: 3,
    md: 5,
    lg: 7,
  } as const;

  // Check if there are any active filters initially
  const hasInitialFilters = Object.entries(filters).some(([key, val]) => {
    if (key === 'page' || key === 'limit') return false; // Ignore pagination
    if (key === 'query') return Boolean(val);
    if (typeof val === 'boolean') return val;
    return Boolean(val);
  });

  const [isExpanded, setIsExpanded] = useState(!hasInitialFilters);

  const form = useForm<FilterFormValues>({
    defaultValues: toFormDefaults(filters),
    mode: 'onChange',
  });

  const { handleSubmit, reset, watch, formState } = form;

  const onSubmit = (values: FilterFormValues) => {
    const payload = buildPayload(values);
    onFiltersChange(payload);
    setIsExpanded(false); // Collapse after applying
  };

  const handleClear = () => {
    reset(baseline, { keepDirty: false, keepTouched: false });
    const payload = buildPayload(baseline);
    onFiltersChange(payload);

    // After clearing, if we were showing summary, close the entire component
    // If we were showing form, keep it expanded since there are no filters to show
    if (!isExpanded && onClose) {
      onClose();
    } else {
      setIsExpanded(true); // Keep expanded to show the form
    }
  };

  const values = watch();
  const { activeFilters, hasActive } = useActiveFilters(values);

  // Auto-expand when no filters are active to avoid empty summary
  useEffect(() => {
    if (!hasActive && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasActive, isExpanded]);

  // When includeArchived is off, prune archived selections using domain cache adapter
  const projectsStatusMap = useProjectStatusesFromCache(values.projectIds);
  const projectLabelsMap = useProjectLabelsFromCache(values.projectIds);

  const handleFetchProjects = useCallback(
    async (q?: string) => {
      const params: {
        limit: number;
        page: number;
        query?: string;
        status?: 'ACTIVE' | 'ARCHIVED';
      } = {
        limit: 20,
        page: 1,
        ...(q ? { query: q } : {}),
        ...(values.includeArchived ? {} : { status: 'ACTIVE' }),
      };
      const res = await ProjectsService.getProjects(params);
      return res.projects;
    },
    [values.includeArchived]
  );
  useEffect(() => {
    if (values.includeArchived) return;
    const currentIds = values.projectIds || [];
    if (currentIds.length === 0) return;
    const filtered = currentIds.filter(
      id => projectsStatusMap.get(id) !== 'ARCHIVED'
    );
    if (filtered.length !== currentIds.length) {
      form.setValue('projectIds', filtered, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [values.includeArchived, values.projectIds, projectsStatusMap, form]);

  return (
    <Card>
      <motion.div
        animate={{ height: 'auto' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {!isExpanded ? (
          // Summary Bar
          <CardHeader className="pb-3" data-testid="filters-summary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">
                  {hasActive
                    ? t('tasks.filters.activeFilters')
                    : t('tasks.filters.title')}
                </span>
                {hasActive && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilters.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActive && (
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <X className="mr-2 h-4 w-4" />
                    {t('tasks.filters.clear')}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  data-testid="filters-edit"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {t('tasks.filters.edit')}
                </Button>
              </div>
            </div>
            {hasActive && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.map(filter => (
                  <Badge key={filter.key} variant="outline">
                    {filter.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        ) : (
          // Full Form
          <>
            <CardHeader data-testid="filters-form-header">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg" data-testid="filters-title">
                  {t('tasks.filters.title')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {(hasActive || formState.isDirty) && (
                    <Button variant="outline" size="sm" onClick={handleClear}>
                      <X className="mr-2 h-4 w-4" />
                      {t('tasks.filters.clear')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    data-testid="filters-apply"
                  >
                    {t('tasks.filters.apply')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">{t('common.search')}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              id="search"
                              placeholder={t('tasks.filters.searchPlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                        )}
                      />
                      <FormMessage />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('tasks.filters.status')}</FormLabel>
                          <FormControl>
                            <Select
                              value={value ?? ALL_SENTINEL}
                              onValueChange={v =>
                                onChange(v === ALL_SENTINEL ? undefined : v)
                              }
                            >
                              <SelectTrigger className="w-full h-10 sm:h-9">
                                <SelectValue
                                  placeholder={t('tasks.filters.allStatuses')}
                                />
                              </SelectTrigger>
                              <SelectContent className="max-h-[60vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto">
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('tasks.filters.priority')}</FormLabel>
                          <FormControl>
                            <Select
                              value={value ?? ALL_SENTINEL}
                              onValueChange={v =>
                                onChange(v === ALL_SENTINEL ? undefined : v)
                              }
                            >
                              <SelectTrigger className="w-full h-10 sm:h-9">
                                <SelectValue
                                  placeholder={t('tasks.filters.allPriorities')}
                                />
                              </SelectTrigger>
                              <SelectContent className="max-h-[60vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto">
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Assignee */}
                    <FormField
                      control={form.control}
                      name="assigneeFilter"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('tasks.filters.assignee')}</FormLabel>
                          <FormControl>
                            <Select
                              value={value ?? ALL_SENTINEL}
                              onValueChange={v =>
                                onChange(v === ALL_SENTINEL ? undefined : v)
                              }
                            >
                              <SelectTrigger className="w-full h-10 sm:h-9">
                                <SelectValue
                                  placeholder={t('tasks.filters.allAssignees')}
                                />
                              </SelectTrigger>
                              <SelectContent className="max-h-[60vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto">
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sort By */}
                    <FormField
                      control={form.control}
                      name="sortBy"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('tasks.filters.sortBy')}</FormLabel>
                          <FormControl>
                            <Select
                              value={value ?? ALL_SENTINEL}
                              onValueChange={v =>
                                onChange(v === ALL_SENTINEL ? undefined : v)
                              }
                            >
                              <SelectTrigger className="w-full h-10 sm:h-9">
                                <SelectValue
                                  placeholder={t('tasks.filters.sortBy')}
                                />
                              </SelectTrigger>
                              <SelectContent className="max-h-[60vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto">
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Projects next to search */}
                  <div className="space-y-2">
                    <FormLabel>{t('tasks.filters.projects')}</FormLabel>
                    <FormField
                      control={form.control}
                      name="projectIds"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="space-y-2">
                          <FormControl>
                            <AsyncMultiSelect
                              label={t('tasks.filters.projects')}
                              placeholder={t('tasks.filters.selectProjects')}
                              value={value}
                              onChange={onChange}
                              maxSelected={20}
                              disabled={false}
                              resolveLabel={(id: string) =>
                                projectLabelsMap.get(id)
                              }
                              fetcher={handleFetchProjects}
                              mapOption={(p: {
                                id: string;
                                name: string;
                                status?: string;
                              }) => ({
                                raw: p,
                                value: p.id,
                                label:
                                  p.status === 'ARCHIVED'
                                    ? `${p.name} (Archived)`
                                    : p.name,
                              })}
                              notFoundLabel={t('projects.noResults')}
                              showOverflowCount={OVERFLOW_COUNTS.sm}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date Filters */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDateFrom"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel htmlFor="dueDateFrom">
                            {t('tasks.filters.dueDateFrom')}
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t('tasks.filters.dueDateFrom')}
                              id="dueDateFrom"
                              aria-label={t('tasks.filters.dueDateFrom')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dueDateTo"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel htmlFor="dueDateTo">
                            {t('tasks.filters.dueDateTo')}
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t('tasks.filters.dueDateTo')}
                              id="dueDateTo"
                              aria-label={t('tasks.filters.dueDateTo')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-2">
                    <FormLabel>{t('tasks.filters.quickFilters')}</FormLabel>
                    <div className="flex flex-wrap gap-4 overflow-x-auto sm:overflow-visible pr-1">
                      <FormField
                        control={form.control}
                        name="isOverdue"
                        render={({ field: { value, onChange } }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                id="isOverdue"
                                checked={value}
                                onCheckedChange={onChange}
                              />
                            </FormControl>
                            <FormLabel htmlFor="isOverdue" className="text-sm">
                              {t('tasks.filters.overdueOnly')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hasDueDate"
                        render={({ field: { value, onChange } }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                id="hasDueDate"
                                checked={value}
                                onCheckedChange={onChange}
                              />
                            </FormControl>
                            <FormLabel htmlFor="hasDueDate" className="text-sm">
                              {t('tasks.filters.hasDueDate')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="includeArchived"
                        render={({ field: { value, onChange } }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                id="includeArchived"
                                checked={value}
                                onCheckedChange={(checked: boolean) =>
                                  onChange(checked)
                                }
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="includeArchived"
                              className="text-sm"
                            >
                              Include archived projects
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Hidden submit to allow Enter key */}
                  <button type="submit" className="hidden" />
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </motion.div>
    </Card>
  );
};

// Important: We intentionally block re-renders after the first mount.
// Context: Radix Select components inside this form can get stuck in a
// re-initialization loop when the parent re-renders during menu interactions.
// Using a comparator that always returns true sidesteps that by freezing the
// component after initial mount. This is a deliberate trade-off: it can hide
// legit re-renders, so any state updates must flow through controlled inputs
// and explicit callbacks. See docs/TECH_DEBT.md for the tracking note.
export const TaskFilters = memo(TaskFiltersInner, () => true);

export default TaskFilters;
