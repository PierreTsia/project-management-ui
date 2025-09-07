import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ContributorRow } from './contributors/ContributorRow';
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
import { MoreHorizontal } from 'lucide-react';

type Contributor = {
  id: string;
  name: string;
  email?: string;
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
  const totalContributors = (owner?.id ? 1 : 0) + (contributors?.length ?? 0);

  const ownerContributor: Contributor = {
    id: owner.id,
    name: owner.name,
    avatar: owner.avatar ?? '',
    projectContributorId: 'owner',
    role: 'OWNER',
  };
  const contributorsWithOwner: Contributor[] = [
    ownerContributor,
    ...contributors,
  ];

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
    setSelectedRole(initialRole);
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
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">
              {t('projects.detail.contributors')} ({totalContributors})
            </h3>
          </div>
          <div className="flex items-center gap-2">
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
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard
                        .writeText(window.location.href)
                        .then(() => toast.success('Link copied'))
                        .catch(() => toast.error(t('common.error')));
                    }}
                    data-testid="copy-invite-link"
                  >
                    Copy invite link
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Import CSV (coming soon)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Owner moved into the list below as the first row */}

        <div className="space-y-3">
          {contributorsWithOwner.length > 0 ? (
            <ul className="divide-y divide-border/50 rounded-md border border-border/50">
              {contributorsWithOwner.map(contributor => (
                <ContributorRow
                  key={contributor.id}
                  data={contributor}
                  canManage={canManage}
                  onChangeRole={handleOpenChangeRole}
                  onRemove={handleOpenRemoveConfirm}
                />
              ))}
            </ul>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {t('projects.detail.noContributorsYet')}
            </span>
          )}
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {t('projects.contributors.changeRole.title')}
            </DialogTitle>
            <DialogDescription>
              {t('projects.contributors.changeRole.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="flex items-center justify-center gap-5">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    selectedContributor?.avatar ||
                    (selectedContributor
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContributor.id}`
                      : undefined)
                  }
                  alt={selectedContributor?.name ?? ''}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="text-xs">
                  {selectedContributor?.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex flex-col leading-tight text-center">
                <div className="text-sm font-medium truncate">
                  {selectedContributor?.name}
                </div>
                {selectedContributor?.email && (
                  <div className="text-xs text-muted-foreground truncate">
                    {selectedContributor.email}
                  </div>
                )}
              </div>
              <div className="w-[200px]">
                <Select
                  onValueChange={value =>
                    setSelectedRole(value as 'ADMIN' | 'WRITE' | 'READ')
                  }
                  defaultValue={selectedRole}
                  disabled={isUpdatingRole}
                >
                  <SelectTrigger className="h-8">
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
            </div>
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
