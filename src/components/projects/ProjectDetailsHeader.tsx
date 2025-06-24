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
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">{projectName}</h1>
          <Badge
            variant={status === 'ACTIVE' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {status === 'ACTIVE'
              ? t('projects.status.active')
              : t('projects.status.archived')}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Figma Design System</span>
          <span>›</span>
          <span>{projectName}</span>
        </div>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="project-actions-menu"
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
  );
};
