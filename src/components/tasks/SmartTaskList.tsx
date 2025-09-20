import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useIntersectionObserver } from '@uidotdev/usehooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedList } from '@/components/ui/animated-list';
import { SquareCheckBig } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types/task';
import type { ReactNode } from 'react';

// Backend API sort options
export type TaskSortField =
  | 'createdAt'
  | 'dueDate'
  | 'priority'
  | 'status'
  | 'title';
export type TaskSortOrder = 'ASC' | 'DESC';
export type TaskSortOption = `${TaskSortField}-${TaskSortOrder}`;

export type SmartTaskListProps = {
  tasks: ReadonlyArray<Task>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onCreate: () => void;
  renderItem: (task: Task) => ReactNode;
  ctaLabel: string;
  emptyMessage?: string;
  emptyCtaLabel?: string;
  showSearch?: boolean;
  showSort?: boolean;
  showFilters?: boolean;
  showFloatingButton?: boolean;
  maxHeight?: string | number;
  className?: string;
};

const SORT_OPTIONS: Array<{ value: TaskSortOption; label: string }> = [
  { value: 'title-ASC', label: 'Title A-Z' },
  { value: 'title-DESC', label: 'Title Z-A' },
  { value: 'status-ASC', label: 'Status A-Z' },
  { value: 'status-DESC', label: 'Status Z-A' },
  { value: 'priority-ASC', label: 'Priority Low-High' },
  { value: 'priority-DESC', label: 'Priority High-Low' },
  { value: 'dueDate-ASC', label: 'Due Date Soonest' },
  { value: 'dueDate-DESC', label: 'Due Date Latest' },
  { value: 'createdAt-ASC', label: 'Created Oldest' },
  { value: 'createdAt-DESC', label: 'Created Newest' },
];

const STATUS_OPTIONS: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority | 'all'; label: string }> =
  [
    { value: 'all', label: 'All Priorities' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

export const SmartTaskList = ({
  tasks,
  onStatusChange: _onStatusChange,
  onDelete: _onDelete,
  onAssign: _onAssign,
  onEdit: _onEdit,
  onCreate,
  renderItem,
  ctaLabel,
  emptyMessage = 'No tasks found',
  emptyCtaLabel = 'Create a first task',
  showSearch = true,
  showSort = true,
  showFilters = true,
  showFloatingButton = true,
  maxHeight,
  className = '',
}: SmartTaskListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState<TaskSortOption>('createdAt-DESC');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(
    'all'
  );
  const [isFiltering, setIsFiltering] = useState(false);

  // Use the proven useIntersectionObserver hook
  const [headerRef, headerEntry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
  });
  const [containerRef, containerEntry] = useIntersectionObserver({
    threshold: 0,
    rootMargin: '0px',
  });
  const [listEndRef, listEndEntry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
  });

  // Extract intersection states
  const isHeaderInView = headerEntry?.isIntersecting ?? false;
  const isContainerInView = containerEntry?.isIntersecting ?? false;
  const isListEndInView = listEndEntry?.isIntersecting ?? false;

  // Button visibility logic - priority: header > bottom > floating
  const shouldShowHeaderButton = isHeaderInView;
  const shouldShowBottomButton = isListEndInView && !isHeaderInView;
  const shouldShowFloatingButton =
    showFloatingButton &&
    !isHeaderInView &&
    !isListEndInView &&
    isContainerInView;

  // Handle filtering state for better animations
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 100);
    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, statusFilter, priorityFilter, sortBy]);

  // Client-side filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      const [field, order] = sortBy.split('-') as [
        TaskSortField,
        TaskSortOrder,
      ];
      const isAsc = order === 'ASC';

      switch (field) {
        case 'title':
          return isAsc
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'status':
          return isAsc
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        case 'priority': {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const aPriority =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return isAsc ? aPriority - bPriority : bPriority - aPriority;
        }
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return isAsc ? aDate - bDate : bDate - aDate;
        }
        case 'createdAt':
        default: {
          const aCreated = new Date(a.createdAt).getTime();
          const bCreated = new Date(b.createdAt).getTime();
          return isAsc ? aCreated - bCreated : bCreated - aCreated;
        }
      }
    });

    return filtered;
  }, [tasks, debouncedSearchQuery, statusFilter, priorityFilter, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
    );
  }, [debouncedSearchQuery, statusFilter, priorityFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('createdAt-DESC');
  }, []);

  if (tasks.length === 0) {
    return (
      <div
        className={`flex items-center justify-center py-8 pl-4 ${className}`}
      >
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button variant="outline" size="sm" onClick={() => onCreate?.()}>
            <SquareCheckBig className="h-4 w-4 mr-2" />
            {emptyCtaLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* Header */}
      <div ref={headerRef} className="px-2 sm:px-4">
        {/* Top Row: Search + Add Button (when floating is disabled) */}
        <div className="flex items-center gap-3 mb-3">
          {/* Search Input */}
          {showSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add Task Button - Show when header is visible and floating is disabled */}
          {shouldShowHeaderButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreate?.()}
              className="whitespace-nowrap h-9"
            >
              <SquareCheckBig className="h-4 w-4 mr-2" />
              {ctaLabel}
            </Button>
          )}
        </div>

        {/* Bottom Row: Sort + Filters with Icons */}
        {(showSort || showFilters) && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort with Icon */}
            {showSort && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={sortBy}
                  onValueChange={value => setSortBy(value as TaskSortOption)}
                >
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filters Group with Icon */}
            {showFilters && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={value =>
                      setStatusFilter(value as TaskStatus | 'all')
                    }
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select
                    value={priorityFilter}
                    onValueChange={value =>
                      setPriorityFilter(value as TaskPriority | 'all')
                    }
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="px-2 sm:px-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                No tasks match your filters
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="space-y-4 overflow-y-auto custom-scrollbar"
            style={{
              maxHeight: maxHeight || 'none',
            }}
          >
            <AnimatedList
              items={filteredAndSortedTasks}
              getKey={task => task.id}
              renderItem={renderItem}
              className="space-y-2"
              motionProps={{
                layout: true,
                transition: {
                  duration: isFiltering ? 0.2 : 0.3,
                  ease: 'easeInOut',
                  layout: { duration: 0.15 },
                },
              }}
            />
            {/* Invisible element to detect when we reach the end of the list */}
            <div ref={listEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Bottom Fixed Button - Show when list end is visible AND header is not visible */}
      {shouldShowBottomButton && (
        <div className="flex justify-center pt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => onCreate?.()}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <SquareCheckBig className="h-4 w-4 mr-2" />
            {ctaLabel}
          </Button>
        </div>
      )}

      {/* Floating Add Button - Show when neither header nor list end is visible AND container is not in view */}
      {shouldShowFloatingButton && (
        <div className="fixed bottom-4 left-1/2 md:left-[calc(50%+8rem)] transform -translate-x-1/2 z-50">
          <Button
            variant="default"
            size="sm"
            onClick={() => onCreate?.()}
            className="shadow-lg hover:shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-2"
          >
            <SquareCheckBig className="h-4 w-4 mr-2" />
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartTaskList;
