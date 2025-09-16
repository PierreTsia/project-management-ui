import { memo, useState, useEffect } from 'react';
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
import {
  X,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

interface TaskFiltersProps {
  filters: GlobalSearchTasksParams;
  onFiltersChange: (filters: Partial<GlobalSearchTasksParams>) => void;
  onClose?: () => void;
}

const ALL_SENTINEL = '__ALL__';

type FilterFormValues = {
  query: string;
  status?: string | undefined;
  priority?: string | undefined;
  assigneeFilter?: string | undefined;
  sortBy?: string | undefined;
  dueDateFrom?: string | undefined;
  dueDateTo?: string | undefined;
  isOverdue: boolean;
  hasDueDate: boolean;
};

const toFormDefaults = (f: GlobalSearchTasksParams): FilterFormValues => ({
  query: f.query ?? '',
  status: f.status ?? undefined,
  priority: f.priority ?? undefined,
  assigneeFilter: f.assigneeFilter ?? undefined,
  sortBy: f.sortBy ?? undefined,
  dueDateFrom: f.dueDateFrom ?? undefined,
  dueDateTo: f.dueDateTo ?? undefined,
  isOverdue: Boolean(f.isOverdue),
  hasDueDate: Boolean(f.hasDueDate),
});

const baseline: FilterFormValues = {
  query: '',
  status: undefined,
  priority: undefined,
  assigneeFilter: undefined,
  sortBy: undefined,
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
    [Boolean(values.dueDateFrom), 'dueDateFrom', values.dueDateFrom],
    [Boolean(values.dueDateTo), 'dueDateTo', values.dueDateTo],
    [values.isOverdue, 'isOverdue', true],
    [values.hasDueDate, 'hasDueDate', true],
  ]);

const TaskFiltersInner = ({
  filters,
  onFiltersChange,
  onClose,
}: TaskFiltersProps) => {
  const { t } = useTranslations();

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
              <div className="flex items-center justify-between">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    <ChevronUp className="h-4 w-4" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('tasks.filters.allStatuses')}
                                />
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
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('tasks.filters.allPriorities')}
                                />
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
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('tasks.filters.allAssignees')}
                                />
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
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('tasks.filters.sortBy')}
                                />
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDateFrom"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel htmlFor="dueDateFrom">
                            {t('tasks.filters.dueDateFrom')}
                          </FormLabel>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                id="dueDateFrom"
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
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
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                id="dueDateTo"
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-2">
                    <FormLabel>{t('tasks.filters.quickFilters')}</FormLabel>
                    <div className="flex flex-wrap gap-4">
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
