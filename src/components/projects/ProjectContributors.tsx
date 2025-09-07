import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User2Icon } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { AddProjectContributorModal } from './AddProjectContributorModal';
import { useRemoveContributor } from '@/hooks/useProjects';
import { useUpdateContributorRole } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import type { ProjectRole } from '@/types/project';

type Contributor = {
  id: string;
  name: string;
  avatar?: string;
  projectContributorId: string;
  role: ProjectRole;
};

type Owner = {
  id: string;
  name: string;
  avatar?: string;
};

type Props = {
  owner: Owner;
  contributors: Contributor[];
  projectId: string;
  canManage?: boolean;
};

export const ProjectContributors = ({
  owner,
  contributors,
  projectId,
  canManage = false,
}: Props) => {
  const { t } = useTranslations();
  const [showAddContributorModal, setShowAddContributorModal] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] =
    useState<Contributor | null>(null);
  const { mutateAsync: removeContributor, isPending: isRemoving } =
    useRemoveContributor();
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'WRITE' | 'READ'>(
    'WRITE'
  );
  const { mutateAsync: updateContributorRole, isPending: isUpdatingRole } =
    useUpdateContributorRole();

  const handleAddContributor = () => {
    setShowAddContributorModal(true);
  };

  const handleCloseAddContributorModal = () => {
    setShowAddContributorModal(false);
  };

  const handleOpenRemoveConfirm = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setConfirmRemoveOpen(true);
  };

  const handleCloseRemoveConfirm = () => {
    if (isRemoving) return;
    setConfirmRemoveOpen(false);
    setSelectedContributor(null);
  };

  const handleConfirmRemove = async () => {
    if (!selectedContributor) return;
    try {
      await removeContributor({
        projectId,
        contributorId: selectedContributor.projectContributorId,
      });
      toast.success(t('projects.contributors.remove.success'));
      handleCloseRemoveConfirm();
    } catch (error) {
      const message =
        getApiErrorMessage(error) || t('projects.contributors.remove.error');
      toast.error(message);
      handleCloseRemoveConfirm();
    }
  };

  const handleOpenChangeRole = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    const initialRole =
      contributor.role === 'OWNER' ? 'ADMIN' : contributor.role;
    setSelectedRole(initialRole as 'ADMIN' | 'WRITE' | 'READ');
    setChangeRoleOpen(true);
  };

  const handleCloseChangeRole = () => {
    if (isUpdatingRole) return;
    setChangeRoleOpen(false);
    setSelectedContributor(null);
  };

  const handleConfirmChangeRole = async () => {
    if (!selectedContributor) return;
    try {
      await updateContributorRole({
        projectId,
        contributorId: selectedContributor.projectContributorId,
        data: { role: selectedRole },
      });
      toast.success(t('projects.contributors.changeRole.success'));
      handleCloseChangeRole();
    } catch (error) {
      const message =
        getApiErrorMessage(error) ||
        t('projects.contributors.changeRole.error');
      toast.error(message);
      handleCloseChangeRole();
    }
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
                contributors.map(contributor =>
                  canManage ? (
                    <DropdownMenu key={contributor.id}>
                      <DropdownMenuTrigger asChild>
                        <Avatar
                          className="h-8 w-8 border-2 border-background cursor-pointer"
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
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {contributor.role !== 'OWNER' && (
                          <DropdownMenuItem
                            onClick={() => handleOpenChangeRole(contributor)}
                            data-testid={`change-role-${contributor.id}`}
                          >
                            {t('projects.contributors.actions.changeRole')}
                          </DropdownMenuItem>
                        )}
                        {contributor.role !== 'OWNER' && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleOpenRemoveConfirm(contributor)}
                            data-testid={`remove-contributor-${contributor.id}`}
                          >
                            {t('projects.contributors.actions.remove')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
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
                  )
                )
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  {t('projects.detail.noContributorsYet')}
                </span>
              )}
            </div>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={handleAddContributor}
                data-testid="add-contributor-button"
              >
                <User2Icon className="h-3 w-3 mr-1" />
                {t('projects.detail.addContributor')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AddProjectContributorModal
        isOpen={showAddContributorModal}
        onClose={handleCloseAddContributorModal}
        projectId={projectId}
      />

      <Dialog open={confirmRemoveOpen} onOpenChange={handleCloseRemoveConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('projects.contributors.remove.title')}</DialogTitle>
            <DialogDescription>
              {t('projects.contributors.remove.confirm', {
                name: selectedContributor?.name ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseRemoveConfirm}
              disabled={isRemoving}
              data-testid="cancel-remove-contributor"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              data-testid="confirm-remove-contributor"
            >
              {t('projects.contributors.actions.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changeRoleOpen} onOpenChange={handleCloseChangeRole}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('projects.contributors.changeRole.title')}
            </DialogTitle>
            <DialogDescription>
              {t('projects.contributors.changeRole.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select
              onValueChange={value =>
                setSelectedRole(value as 'ADMIN' | 'WRITE' | 'READ')
              }
              defaultValue={selectedRole}
              disabled={isUpdatingRole}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('projects.contributors.selectRole')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">
                  {t('projects.contributors.roles.admin')}
                </SelectItem>
                <SelectItem value="WRITE">
                  {t('projects.contributors.roles.write')}
                </SelectItem>
                <SelectItem value="READ">
                  {t('projects.contributors.roles.read')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseChangeRole}
              disabled={isUpdatingRole}
              data-testid="cancel-change-role"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmChangeRole}
              disabled={isUpdatingRole}
              data-testid="confirm-change-role"
            >
              {t('projects.contributors.changeRole.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
