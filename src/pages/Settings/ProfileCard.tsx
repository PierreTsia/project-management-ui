import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Camera } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UsersService } from '@/services/users';
import type { UpdateProfileRequest, User } from '@/types/user';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ProfileCardProps = {
  user: User;
  isLoading: boolean;
};

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
const maxAvatarBytes = 2 * 1024 * 1024;

export function ProfileCard({ user, isLoading }: ProfileCardProps) {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [email] = useState<string>(user?.email ?? '');
  const [bio, setBio] = useState<string>(user?.bio ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState<boolean>(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
    // email is read-only
  }, [user?.name, user?.bio]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const payload: UpdateProfileRequest = { name, bio };
      const updated = await UsersService.updateProfile(payload);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      setName(updated.name);
      setBio(updated.bio ?? '');
      toast.success('Saved');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedAvatarFile(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;
    const file = selectedAvatarFile;
    if (
      !allowedImageTypes.includes(
        file.type as (typeof allowedImageTypes)[number]
      )
    ) {
      toast.error('Invalid file type');
      return;
    }
    if (file.size > maxAvatarBytes) {
      toast.error('File is too large (max 2 MB)');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      await UsersService.uploadAvatar(file);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Saved');
      setIsAvatarDialogOpen(false);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserIcon className="mr-2 h-5 w-5" />
          {t('settings.profile.title')}
        </CardTitle>
        <CardDescription>{t('settings.profile.description')}</CardDescription>

        <div className="mt-4 flex items-center gap-2">
          <Dialog
            open={isAvatarDialogOpen}
            onOpenChange={open => {
              setIsAvatarDialogOpen(open);
              if (!open) {
                setSelectedAvatarFile(null);
                if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                setAvatarPreviewUrl(null);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <UserAvatar user={user} size="xl" />
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={t('settings.profile.changeAvatar')}
                  title={t('settings.profile.changeAvatar')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('settings.profile.updateAvatarTitle')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt={t('settings.profile.previewAlt')}
                    className="h-24 w-24 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('settings.profile.previewPrompt')}
                  </div>
                )}
                <input
                  aria-label="Upload avatar"
                  type="file"
                  accept={allowedImageTypes.join(',')}
                  onChange={handleAvatarFileSelect}
                  disabled={isUploadingAvatar}
                />
                <p className="text-sm text-muted-foreground">
                  {t('settings.profile.acceptedTypes')}
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar || !selectedAvatarFile}
                >
                  {isUploadingAvatar
                    ? t('common.uploading')
                    : t('attachments.upload.button')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('settings.profile.fullName')}</Label>
          <Input
            id="name"
            placeholder={t('settings.profile.fullNamePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('common.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.common.emailPlaceholder')}
            value={email}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">{t('settings.profile.bio')}</Label>
          <Input
            id="bio"
            placeholder={t('settings.profile.bioPlaceholder')}
            value={bio ?? ''}
            onChange={e => setBio(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleProfileSave}
            disabled={isSavingProfile || isLoading}
          >
            {isSavingProfile ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
