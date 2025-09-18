import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/useTranslations';
import type { ProjectRole } from '@/types/project';
import type { Project } from '@/types/project';

const CLEAR_VALUE = '__CLEAR__';

interface TeamFiltersProps {
  query: string;
  role?: ProjectRole;
  projectId?: string;
  projects?: Project[];
  onSearchChange: (query: string) => void;
  onRoleChange: (role: string) => void;
  onProjectChange: (projectId: string) => void;
}

export function TeamFilters({
  query,
  role,
  projectId,
  projects = [],
  onSearchChange,
  onRoleChange,
  onProjectChange,
}: TeamFiltersProps) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <Input
        placeholder={t('tasks.assign.searchPlaceholder')}
        value={query}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full sm:w-[260px] md:w-[320px] lg:w-[360px] xl:w-[400px]"
      />
      <Select value={role ?? CLEAR_VALUE} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[150px]" data-testid="role-select">
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
      <Select value={projectId ?? CLEAR_VALUE} onValueChange={onProjectChange}>
        <SelectTrigger className="w-[220px]" data-testid="project-select">
          <SelectValue placeholder={t('projects.title')} />
        </SelectTrigger>
        {projects.length > 0 && (
          <SelectContent>
            <SelectItem value={CLEAR_VALUE}>{t('projects.title')}</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
