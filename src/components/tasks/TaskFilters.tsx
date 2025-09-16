import { memo } from 'react';
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
import { X, Search, Calendar } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
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

interface TaskFiltersProps {
  filters: GlobalSearchTasksParams;
  onFiltersChange: (filters: Partial<GlobalSearchTasksParams>) => void;
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
): Partial<GlobalSearchTasksParams> => ({
  query: values.query?.trim() ? values.query.trim() : undefined,
  status: values.status || undefined,
  priority: values.priority || undefined,
  assigneeFilter: values.assigneeFilter || undefined,
  sortBy: values.sortBy || undefined,
  dueDateFrom: values.dueDateFrom || undefined,
  dueDateTo: values.dueDateTo || undefined,
  isOverdue: values.isOverdue ? true : undefined,
  hasDueDate: values.hasDueDate ? true : undefined,
});

const TaskFiltersInner = ({ filters, onFiltersChange }: TaskFiltersProps) => {
  const { t } = useTranslations();

  const form = useForm<FilterFormValues>({
    defaultValues: toFormDefaults(filters),
    mode: 'onChange',
  });

  const { handleSubmit, reset, watch, formState } = form;

  const onSubmit = (values: FilterFormValues) => {
    const payload = buildPayload(values);
    console.debug('[TaskFilters] submit', payload);
    onFiltersChange(payload);
  };

  const handleClear = () => {
    reset(baseline, { keepDirty: false, keepTouched: false });
    const payload = buildPayload(baseline);
    console.debug('[TaskFilters] clear');
    onFiltersChange(payload);
  };

  const values = watch();
  const hasActive = Object.entries(values).some(([key, val]) => {
    if (key === 'query') return Boolean(val);
    if (typeof val === 'boolean') return val;
    return Boolean(val);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('tasks.filters.title')}</CardTitle>
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
              disabled={formState.isSubmitting || !formState.isDirty}
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
    </Card>
  );
};

// Prevent re-rendering after initial mount to avoid Radix Select re-init loops
export const TaskFilters = memo(TaskFiltersInner, () => true);

export default TaskFilters;
