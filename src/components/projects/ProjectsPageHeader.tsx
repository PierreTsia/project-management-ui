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
import { useTranslations } from '@/hooks/useTranslations';
import { PageSizeSelector } from './PageSizeSelector';
import { ProjectStatus } from '@/types/project';

interface ProjectsPageHeaderProps {
  query: string;
  status: ProjectStatus | undefined;
  pageSize: number;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClearFilters: () => void;
  onNewProject: () => void;
}

export const ProjectsPageHeader = ({
  query,
  status,
  pageSize,
  onSearchChange,
  onStatusChange,
  onPageSizeChange,
  onClearFilters,
  onNewProject,
}: ProjectsPageHeaderProps) => {
  const { t } = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.projects')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Button onClick={onNewProject}>
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
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          <Select value={status || 'all'} onValueChange={onStatusChange}>
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
            <Button variant="ghost" onClick={onClearFilters}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('projects.filter.clear')}
            </Button>
          )}
        </div>

        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};
