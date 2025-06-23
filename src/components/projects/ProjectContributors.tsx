import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslations } from '@/hooks/useTranslations';

type User = {
  id: string;
  name: string;
  avatar?: string;
};

type Props = {
  owner: User;
  contributors: User[];
};

export const ProjectContributors = ({ owner, contributors }: Props) => {
  const { t } = useTranslations();

  return (
    <div className="bg-card border border-border/50 rounded-lg p-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {t('projects.detail.owner')}
          </span>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={
                  owner.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`
                }
                alt={owner.name}
              />
              <AvatarFallback className="text-xs">
                {owner.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {t('projects.detail.contributors')}
          </span>
          <div className="flex -space-x-2">
            {contributors.map(contributor => (
              <Avatar
                key={contributor.id}
                className="h-8 w-8 border-2 border-background"
              >
                <AvatarImage
                  src={
                    contributor.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.id}`
                  }
                  alt={contributor.name}
                />
                <AvatarFallback className="text-xs">
                  {contributor.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
