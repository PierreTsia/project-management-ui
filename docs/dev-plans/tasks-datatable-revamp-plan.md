## Tasks Data Table Revamp — Battle Plan

Scope: Replace the current static `TaskTable` with a proper shadcn data table powered by TanStack Table, wired to our existing global tasks search API and query-state, with sortable columns, column visibility toggles, badge cells, and trailing actions.

### Goals

- Sortable columns mapped to API params
- Customizable (show/hide) columns with persistence
- Status and priority rendered as badges/icons
- Trailing action column using `TaskActionsMenu`
- Pagination integrated with server (page/limit/totalPages)

### References

- shadcn Data Table (pattern and API): [shadcn data table](https://www.shadcn.io/ui/data-table)
- Current `TaskTable` usage of shadcn primitives:

```1:15:/Users/pierre.tsiakkaros/Documents/project-management-ui/src/components/tasks/TaskTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
```

- Global search params and server-supported sorting/pagination:

```82:101:/Users/pierre.tsiakkaros/Documents/project-management-ui/src/types/task.ts
export type GlobalSearchTasksParams = {
  query?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectIds?: string[];
  includeArchived?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  assigneeFilter?: 'me' | 'unassigned' | 'any';
  isOverdue?: boolean;
  hasDueDate?: boolean;
  page?: number;
  limit?: number;
};
```

- React Query hooks for global tasks search:

```550:564:/Users/pierre.tsiakkaros/Documents/project-management-ui/src/hooks/useTasks.ts
export const useAllUserTasks = (params?: GlobalSearchTasksParams) => {
  return useQuery({
    queryKey: taskKeys.globalList(params || {}),
    queryFn: () => TasksService.getAllUserTasks(params),
    staleTime: TASK_STALE_TIME,
  });
};

export const useSearchAllUserTasks = (params?: GlobalSearchTasksParams) => {
  return useQuery({
    queryKey: taskKeys.globalSearch(params || {}),
    queryFn: () => TasksService.searchAllUserTasks(params),
    staleTime: TASK_STALE_TIME,
  });
};
```

- Actions menu to reuse in trailing column:

```20:36:/Users/pierre.tsiakkaros/Documents/project-management-ui/src/components/tasks/TaskActionsMenu.tsx
export const TaskActionsMenu = ({
  onView,
  onEdit,
  onAssignToMe,
  onDelete,
  className,
  onOpenChange,
}: TaskActionsMenuProps) => {
  // ...
  return (
    <DropdownMenu onOpenChange={onOpenChange || noop}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
```

### Architecture & Implementation Plan

1. Dependencies and Baseline

- Add `@tanstack/react-table`.
- Confirm shadcn primitives are in place (`Table`, `DropdownMenu`, `Checkbox`, `Button`) — they are.

2. Define typed columns for Tasks

- New: `src/components/tasks/datatable/task-columns.tsx`
- Export `columns: ColumnDef<Task>[]` with:
  - Use the TanStack ColumnDef API shape exactly (`accessorKey`, `header`, `cell`, `enableSorting`, `enableHiding`).
  - Example:

```ts
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    enableSorting: true,
    enableHiding: false,
  },
];
```

- Select column (checkbox)
- Title (with description line clamp)
- Project (dot + name)
- Status (Badge variant by status)
- Priority (icon for HIGH + label)
- Assignee (`UserAvatar` avatar-only, no name)
- Due date (calendar icon + formatted date; red if overdue)
- Actions (`TaskActionsMenu`)
- Enable sorting only on API-backed fields: `title`, `status`, `priority`, `dueDate`, `createdAt` (verify server support).
- Enable column hiding except for essential columns (title, actions).

3. Data Table wrapper with server-side state

- New: `src/components/tasks/datatable/TaskDataTable.tsx`
- Use `useReactTable` with state: `sorting`, `columnVisibility`, `rowSelection`, `columnFilters`.
- Wire state → server params:
  - Sorting: first sort rule → `sortBy` (`createdAt` | `dueDate` | `priority` | `status` | `title`), `sortOrder` (ASC/DESC)
  - Pagination: `page`, `limit`
  - Filters: `status`, `priority`, `assigneeId`, `query`
- Data fetching: `useSearchAllUserTasks(derivedParams)` using React Query keys from `taskKeys.globalSearch`.
- Column visibility: add Columns dropdown (shadcn pattern) and persist to `localStorage` under `taskTable.columns`.
- Pagination: render page info and controls using API `total`, `page`, `limit`, `totalPages`; reuse `SimplePagination` to drive `table.setPageIndex`/server params.

4. URL query-state sync

- New: `src/hooks/useTaskTableQueryState.ts`
- Sync `page`, `limit`, `sortBy`, `sortOrder`, `status`, `priority`, `assigneeId`, `query` <-> URL params.
- Initialize table state from URL on mount; update URL on changes (debounced for filters).
- Ensure params object is the single source of truth for React Query keys.

5. Integrate in Tasks page

- Update `src/pages/Tasks.tsx` to render `TaskDataTable` instead of the legacy `TaskTable`.
- Keep `TaskActionsMenu` as trailing column.
- Leave old `TaskTable` behind a feature flag while stabilizing, or remove after verification.

6. Cell utilities

- New: `src/components/tasks/datatable/cell-utils.ts`
- `getStatusBadgeVariant(status: TaskStatus): BadgeProps['variant']`
- `getPriorityIcon(priority: TaskPriority): ReactNode`
- `formatDueDate(d?: string): string`, `isOverdue(d?: string): boolean`

7. Tests & QA

- Sorting mapping tests: UI sort → params (`sortBy`, `sortOrder`).
- Pagination mapping tests: `page`, `limit`.
- Column visibility persistence test.
- Cell renderer tests: status badge, overdue date styling.
- Verify React Query key changes and server calls respond accordingly.

### API Param Mapping

- `title` ↔ `sortBy: 'title'`
- `status` ↔ `sortBy: 'status'`
- `priority` ↔ `sortBy: 'priority'`
- `dueDate` ↔ `sortBy: 'dueDate'`
- `createdAt` ↔ `sortBy: 'createdAt'`
- `ASC`/`DESC` from TanStack `SortingState`

### Deliverables Checklist

- [ ] `@tanstack/react-table` installed
- [ ] `task-columns.tsx` with `ColumnDef<Task>[]`
- [ ] `TaskDataTable.tsx` implementing shadcn pattern
- [ ] `cell-utils.ts` for badge/icon/date helpers
- [ ] `useTaskTableQueryState.ts` for URL sync
- [ ] `Tasks.tsx` updated to use `TaskDataTable`
- [ ] Tests for param mapping, visibility persistence, cell renderers

### Decisions

- Scope: Only the global Tasks page for now (no per-project table in this revamp).
- Column visibility persistence: Use localStorage for v1; consider per-user server persistence later.
- Backend sorting support (verified in API): supports `createdAt`, `dueDate`, `priority`, `status`, `title` with `ASC`/`DESC`.

Supported fields proof:

```690:733:/Users/pierre.tsiakkaros/Documents/project-management-api/src/tasks/tasks.service.ts
private applySorting(
  queryBuilder: SelectQueryBuilder<Task>,
  searchDto: GlobalSearchTasksDto,
): void {
  const sortBy = searchDto.sortBy || 'createdAt';
  const sortOrder = searchDto.sortOrder || 'DESC';
  const sortFieldMap = {
    createdAt: 'task.createdAt',
    dueDate: 'task.dueDate',
    priority: 'task.priority',
    status: 'task.status',
    title: 'task.title',
  };
  // priority/status handled specially; others orderBy(sortField, sortOrder)
}
```

```180:189:/Users/pierre.tsiakkaros/Documents/project-management-api/src/tasks/controllers/global-tasks.controller.ts
@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: ['createdAt', 'dueDate', 'priority', 'status', 'title'],
  description: 'Field to sort by',
})
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['ASC', 'DESC'],
  description: 'Sort order',
})
```

### Production Notes

- Handle empty states with helpful copy.
- Consider virtualized rows post-MVP if datasets are large.
- Use skeletons during loading.

### Link

- See shadcn docs for the canonical Data Table pattern: [shadcn data table](https://www.shadcn.io/ui/data-table)
