import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { useProjects } from '@/hooks/useProjects';
import { useContributors } from '@/hooks/useContributors';
import type { ContributorsParams } from '@/types/contributor';
import type { ProjectRole } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationItems } from '@/components/PaginationItems';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { RoleBadge } from '@/components/projects/contributors/RoleBadge';

const PROJECTS_PREVIEW_LIMIT = 5;
const DEFAULT_PAGE_SIZE = 20;
const CLEAR_VALUE = '__CLEAR__';

export const Team = () => {
  const { t } = useTranslations();

  const [params, setParams] = useState<ContributorsParams>({
    q: '',
    sort: 'name',
    order: 'asc',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const { data: projectsData } = useProjects();
  const { data, isLoading, isError } = useContributors(params);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(
      1,
      Math.ceil(data.total / (data.limit || DEFAULT_PAGE_SIZE))
    );
  }, [data]);

  const contributors = data?.contributors ?? [];

  return (
    <div className="container mx-auto max-w-7xl px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">{t('navigation.team')}</h1>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('common.add')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Input
            placeholder={t('tasks.assign.searchPlaceholder')}
            value={params.q}
            onChange={e =>
              setParams(p => ({ ...p, q: e.target.value, page: 1 }))
            }
            className="w-full sm:w-[260px] md:w-[320px] lg:w-[360px] xl:w-[400px]"
          />
          <Select
            value={params.role ?? CLEAR_VALUE}
            onValueChange={val =>
              setParams(p => {
                if (val === CLEAR_VALUE) {
                  const { role: _role, ...rest } = p as {
                    role?: ProjectRole;
                  } & ContributorsParams;
                  return { ...rest, page: 1 } as ContributorsParams;
                }
                return {
                  ...p,
                  role: val as ProjectRole,
                  page: 1,
                } as ContributorsParams;
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('projects.contributors.role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CLEAR_VALUE}>
                {t('projects.contributors.role')}
              </SelectItem>
              <SelectItem value="READ">READ</SelectItem>
              <SelectItem value="WRITE">WRITE</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="OWNER">OWNER</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={params.projectId ?? CLEAR_VALUE}
            onValueChange={val =>
              setParams(p => {
                if (val === CLEAR_VALUE) {
                  const { projectId: _projectId, ...rest } = p as {
                    projectId?: string;
                  } & ContributorsParams;
                  return { ...rest, page: 1 } as ContributorsParams;
                }
                return { ...p, projectId: val, page: 1 } as ContributorsParams;
              })
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t('projects.title')} />
            </SelectTrigger>
            {!!projectsData?.projects?.length && (
              <SelectContent>
                <SelectItem value={CLEAR_VALUE}>
                  {t('projects.title')}
                </SelectItem>
                {projectsData?.projects?.map(prj => (
                  <SelectItem key={prj.id} value={prj.id}>
                    {prj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <div className="text-muted-foreground">{t('common.loading')}</div>
          )}
          {isError && (
            <div className="text-destructive">{t('common.error')}</div>
          )}
          {!isLoading && contributors.length === 0 && (
            <div className="text-muted-foreground">
              {t('projects.noResults')}
            </div>
          )}

          {contributors.map(c => {
            const preview = c.projectsPreview.slice(0, PROJECTS_PREVIEW_LIMIT);
            const overflow = Math.max(
              0,
              c.projectsPreview.length - PROJECTS_PREVIEW_LIMIT
            );
            return (
              <Card
                key={c.user.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <UserAvatar user={c.user} size="lg" />
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">
                      {c.user.name || c.user.email}
                    </CardTitle>
                    <div className="truncate text-sm text-muted-foreground">
                      {c.user.email}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 min-h-[80px]">
                    {preview.map(p => {
                      return (
                        <Link
                          key={p.id}
                          to={`/projects/${p.id}`}
                          title={p.name}
                        >
                          <Badge
                            variant="default"
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-1 border text-sm"
                          >
                            <span className="truncate max-w-[180px]">
                              {p.name}
                            </span>
                            <RoleBadge role={p.role as ProjectRole} />
                          </Badge>
                        </Link>
                      );
                    })}
                    {overflow > 0 && (
                      <Badge variant="outline">+{overflow}</Badge>
                    )}
                  </div>
                  <CardFooter className="flex border-t justify-between items-center pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {c.projectsCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projects
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{c.roles.length}</div>
                      <div className="text-sm text-muted-foreground">Roles</div>
                    </div>
                  </CardFooter>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {contributors.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() =>
                  setParams(p => ({
                    ...p,
                    page: Math.max(1, (p.page || 1) - 1),
                  }))
                }
              />
              <PaginationItems
                currentPage={params.page || 1}
                totalPages={totalPages}
                onPageChange={page => setParams(p => ({ ...p, page }))}
              />
              <PaginationNext
                className="cursor-pointer"
                onClick={() =>
                  setParams(p => ({
                    ...p,
                    page: Math.min(totalPages, (p.page || 1) + 1),
                  }))
                }
              />
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};
