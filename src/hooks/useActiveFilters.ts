import { useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { format } from 'date-fns';
import type { FilterFormValues } from '@/components/tasks/TaskFilters';

type ActiveFilter = {
  key: string;
  label: string;
};

export const useActiveFilters = (values: FilterFormValues) => {
  const { t } = useTranslations();

  const activeFilters = useMemo((): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    if (values.query) {
      filters.push({ key: 'query', label: `"${values.query}"` });
    }

    if (values.status) {
      filters.push({ key: 'status', label: values.status.replace('_', ' ') });
    }

    if (values.priority) {
      filters.push({ key: 'priority', label: values.priority });
    }

    if (Array.isArray(values.projectIds) && values.projectIds.length > 0) {
      const count = values.projectIds.length;
      filters.push({ key: 'projectIds', label: `Projects: ${count}` });
    }

    if (values.includeArchived) {
      filters.push({ key: 'includeArchived', label: 'Include archived' });
    }

    if (values.assigneeFilter) {
      const assigneeLabels = {
        me: t('tasks.filters.assignedToMe'),
        unassigned: t('tasks.filters.unassigned'),
        any: t('tasks.filters.anyAssignee'),
      };
      filters.push({
        key: 'assigneeFilter',
        label:
          assigneeLabels[values.assigneeFilter as keyof typeof assigneeLabels],
      });
    }

    if (values.dueDateFrom) {
      filters.push({
        key: 'dueDateFrom',
        label: `From ${format(values.dueDateFrom, 'MMM dd, yyyy')}`,
      });
    }

    if (values.dueDateTo) {
      filters.push({
        key: 'dueDateTo',
        label: `To ${format(values.dueDateTo, 'MMM dd, yyyy')}`,
      });
    }

    if (values.isOverdue) {
      filters.push({ key: 'isOverdue', label: t('tasks.filters.overdueOnly') });
    }

    if (values.hasDueDate) {
      filters.push({ key: 'hasDueDate', label: t('tasks.filters.hasDueDate') });
    }

    return filters;
  }, [values, t]);

  const hasActive = useMemo(() => {
    return Object.entries(values).some(([key, val]) => {
      if (key === 'query') return Boolean(val);
      if (typeof val === 'boolean') return val;
      return Boolean(val);
    });
  }, [values]);

  return {
    activeFilters,
    hasActive,
  };
};
