import { useState, useEffect, useMemo } from 'react';
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SimplePagination } from '@/components/SimplePagination';
import type { GlobalSearchTasksParams } from '@/types/task';
import { useSearchAllUserTasks } from '@/hooks/useTasks';
import { taskColumns } from './task-columns';

type TaskDataTableProps = {
  initialParams?: GlobalSearchTasksParams;
};

export const TaskDataTable: React.FC<TaskDataTableProps> = ({
  initialParams,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [page, setPage] = useState<number>(initialParams?.page ?? 1);
  const [limit, _setLimit] = useState<number>(initialParams?.limit ?? 10);
  const [searchInput, setSearchInput] = useState<string>(
    initialParams?.query ?? ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      250
    );
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const sortBy = sorting[0]?.id as
    | GlobalSearchTasksParams['sortBy']
    | undefined;
  const sortDesc = sorting[0]?.desc ?? false;

  const params = useMemo<GlobalSearchTasksParams>(() => {
    const base: GlobalSearchTasksParams = {
      page,
      limit,
      sortBy: sortBy || 'createdAt',
    };
    if (debouncedSearch) {
      base.query = debouncedSearch;
    }
    if (sortBy !== undefined) {
      const sortOrderStrict: 'ASC' | 'DESC' = sortDesc ? 'DESC' : 'ASC';
      base.sortOrder = sortOrderStrict;
    }
    return base;
  }, [page, limit, debouncedSearch, sortBy, sortDesc]);

  const { data, isLoading } = useSearchAllUserTasks(params);

  const columns = useMemo(() => taskColumns(), []);

  const table = useReactTable({
    data: data?.tasks ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="w-full p-6">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search tasks..."
          value={searchInput}
          onChange={e => {
            setPage(1);
            setSearchInput(e.target.value);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              table.getRowModel().rows?.length > 0 &&
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && table.getRowModel().rows?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{' '}
            of {total} tasks
          </div>
          <SimplePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default TaskDataTable;
