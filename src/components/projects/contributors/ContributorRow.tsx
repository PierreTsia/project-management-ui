import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectRole } from '@/types/project';
import { MoreHorizontal } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { useTranslations } from '@/hooks/useTranslations';

export type ContributorRowData = {
  id: string;
  name: string;
  avatar?: string;
  role: ProjectRole;
  projectContributorId: string;
};

type Props = {
  data: ContributorRowData;
  canManage: boolean;
  onChangeRole: (data: ContributorRowData) => void;
  onRemove: (data: ContributorRowData) => void;
};

export const ContributorRow = ({
  data,
  canManage,
  onChangeRole,
  onRemove,
}: Props) => {
  const { t } = useTranslations();
  const { id, name, avatar, role } = data;
  const testId =
    role === 'OWNER'
      ? 'project-owner-avatar'
      : `project-contributor-avatar-${id}`;

  return (
    <li className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar
                className="h-8 w-8 border-2 border-background cursor-pointer"
                data-testid={testId}
              >
                <AvatarImage
                  src={
                    avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
                  }
                  alt={name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="text-xs">
                  {name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {role !== 'OWNER' && (
                <DropdownMenuItem
                  onClick={() => onChangeRole(data)}
                  data-testid={`change-role-${id}`}
                >
                  {t('projects.contributors.actions.changeRole')}
                </DropdownMenuItem>
              )}
              {role !== 'OWNER' && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRemove(data)}
                  data-testid={`remove-contributor-${id}`}
                >
                  {t('projects.contributors.actions.remove')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Avatar
            className="h-8 w-8 border-2 border-background"
            data-testid={testId}
          >
            <AvatarImage
              src={
                avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
              }
              alt={name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback className="text-xs">
              {name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-sm text-foreground truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <RoleBadge role={role} />
        {canManage && role !== 'OWNER' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                data-testid={`contributor-actions-${id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onChangeRole(data)}
                data-testid={`change-role-${id}`}
              >
                {t('projects.contributors.actions.changeRole')}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onRemove(data)}
                data-testid={`remove-contributor-${id}`}
              >
                {t('projects.contributors.actions.remove')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </li>
  );
};
