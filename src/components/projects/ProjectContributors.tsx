import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User2Icon } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { AddProjectContributorModal } from './AddProjectContributorModal';

type User = {
  id: string;
  name: string;
  avatar?: string;
};

type Props = {
  owner: User;
  contributors: User[];
  projectId: string;
};

export const ProjectContributors = ({
  owner,
  contributors,
  projectId,
}: Props) => {
  const { t } = useTranslations();
  const [showAddContributorModal, setShowAddContributorModal] = useState(false);

  const handleAddContributor = () => {
    setShowAddContributorModal(true);
  };

  const handleCloseAddContributorModal = () => {
    setShowAddContributorModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-y-3 sm:gap-y-0 sm:gap-x-8 w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {t('projects.detail.owner')}
          </span>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6" data-testid="project-owner-avatar">
              <AvatarImage
                src={
                  owner.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`
                }
                alt={owner.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />

              <AvatarFallback className="text-xs">
                {owner.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {t('projects.detail.contributors')}:
          </span>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {contributors.length > 0 ? (
                contributors.map(contributor => (
                  <Avatar
                    key={contributor.id}
                    className="h-8 w-8 border-2 border-background"
                    data-testid={`project-contributor-avatar-${contributor.id}`}
                  >
                    <AvatarImage
                      src={
                        contributor.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.id}`
                      }
                      alt={contributor.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />

                    <AvatarFallback className="text-xs">
                      {contributor.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  {t('projects.detail.noContributorsYet')}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={handleAddContributor}
            >
              <User2Icon className="h-3 w-3 mr-1" />
              {t('projects.detail.addContributor')}
            </Button>
          </div>
        </div>
      </div>

      <AddProjectContributorModal
        isOpen={showAddContributorModal}
        onClose={handleCloseAddContributorModal}
        projectId={projectId}
      />
    </>
  );
};
