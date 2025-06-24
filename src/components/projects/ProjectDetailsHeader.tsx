import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Archive, Trash2, Paperclip } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { ProjectStatus } from '@/types/project';

type Props = {
  projectName: string;
  status: ProjectStatus;
  isDeleting: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export const ProjectDetailsHeader = ({
  projectName,
  status,
  isDeleting,
  onEdit,
  onArchive,
  onDelete,
}: Props) => {
  const { t } = useTranslations();

  return (
    <div className="flex items-start justify-between w-full gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold leading-tight truncate">
              {projectName}
            </h1>
            {/* Status badge below name on mobile, inline on desktop */}
            <span className="block sm:hidden mt-1">
              <Badge
                variant={status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {status === 'ACTIVE'
                  ? t('projects.status.active')
                  : t('projects.status.archived')}
              </Badge>
            </span>
          </div>
          {/* Status badge inline on desktop */}
          <span className="hidden sm:block">
            <Badge
              variant={status === 'ACTIVE' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {status === 'ACTIVE'
                ? t('projects.status.active')
                : t('projects.status.archived')}
            </Badge>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mt-3">
          <span>Figma Design System</span>
          <span>›</span>
          <span className="truncate">{projectName}</span>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="flex-shrink-0 ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-testid="project-actions-menu"
              className="w-8 h-8 p-0 flex items-center justify-center"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {status === 'ACTIVE'
                ? t('projects.detail.archive')
                : t('projects.detail.unarchive')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? t('projects.detail.deleting') : t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
