import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import type { ProjectRole } from '@/types/project';
import { useTranslations } from '@/hooks/useTranslations';

type Props = {
  role: ProjectRole;
};

export const RoleBadge = ({ role }: Props) => {
  const { t } = useTranslations();
  if (role === 'OWNER') {
    return (
      <Badge
        variant="secondary"
        className="h-5 px-2 text-[10px] gap-1 flex items-center"
      >
        <Crown className="h-3 w-3 text-amber-500" />
        {t('projects.contributors.roles.owner')}
      </Badge>
    );
  }

  const roleLabelMap: Record<ProjectRole, string> = {
    OWNER: t('projects.contributors.roles.owner'),
    ADMIN: t('projects.contributors.roles.admin'),
    WRITE: t('projects.contributors.roles.write'),
    READ: t('projects.contributors.roles.read'),
  };

  return (
    <Badge variant="secondary" className="h-5 px-2 text-[10px]">
      {roleLabelMap[role]}
    </Badge>
  );
};
