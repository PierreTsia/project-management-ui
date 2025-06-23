import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { LoadingCard } from '@/components/LoadingStates';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectsPageSkeleton } from '@/components/projects/ProjectsPageSkeleton';
import { ProjectPagination } from '@/components/projects/ProjectPagination';
import { PageSizeSelector } from '@/components/projects/PageSizeSelector';
import { ProjectStatus } from '@/types/project';
import type { Project } from '@/types/project';

export function Projects() {
  const { t } = useTranslations();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get all params from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('limit') || '6', 10);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') as ProjectStatus | undefined;

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    page: currentPage,
    limit: pageSize,
    ...(query && { query }),
    ...(status && { status }),
  });

  const updateUrlParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Create debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        updateUrlParams({
          query: searchQuery,
          page: '1', // Reset to first page when searching
        });
      }, 500),
    [updateUrlParams]
  );

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrlParams({
      limit: String(newPageSize),
      page: '1', // Reset to first page
    });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: String(page) });
  };

  const handleSearchChange = (newQuery: string) => {
    debouncedSearch(newQuery);
  };

  const handleStatusChange = (newStatus: string) => {
    updateUrlParams({
      status: newStatus === 'all' ? undefined : newStatus,
      page: '1', // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    updateUrlParams({
      query: undefined,
      status: undefined,
      page: '1',
    });
  };

  if (isLoading) {
    return <ProjectsPageSkeleton pageSize={pageSize} />;
  }

  const PageHeader = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.projects')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('projects.newProject')}
        </Button>
      </div>

      {/* Search, Filter, and Pagination Section */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('projects.search.placeholder')}
              defaultValue={query}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          <Select value={status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('projects.filter.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('projects.filter.allStatuses')}
              </SelectItem>
              <SelectItem value={ProjectStatus.ACTIVE}>
                {t('projects.status.active')}
              </SelectItem>
              <SelectItem value={ProjectStatus.ARCHIVED}>
                {t('projects.status.archived')}
              </SelectItem>
            </SelectContent>
          </Select>

          {(query || status) && (
            <Button variant="ghost" onClick={clearFilters}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('projects.filter.clear')}
            </Button>
          )}
        </div>

        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <LoadingCard
          title={t('projects.loadError')}
          description={t('projects.loadErrorDescription')}
          showSpinner={false}
        />
      </div>
    );
  }

  const projects = projectsResponse?.projects || [];
  const total = projectsResponse?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader />

      {!projects.length ? (
        <LoadingCard
          title={
            query || status ? t('projects.noResults') : t('projects.emptyState')
          }
          description={
            query || status
              ? t('projects.noResultsDescription')
              : t('projects.emptyStateDescription')
          }
          showSpinner={false}
        />
      ) : (
        <>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {t('projects.results.showing', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, total),
                total,
              })}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <ProjectPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
