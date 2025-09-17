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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, Palette, User, Camera } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { UsersService } from '@/services/users';
import { AuthService } from '@/services/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { UpdatePasswordRequest, UpdateProfileRequest } from '@/types/user';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

export function Settings() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  const [name, setName] = useState<string>(user?.name ?? '');
  const [email] = useState<string>(user?.email ?? '');
  const [bio, setBio] = useState<string>(user?.bio ?? '');

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
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

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
  const maxAvatarBytes = 2 * 1024 * 1024; // 2 MB

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

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const payload: UpdatePasswordRequest = {
      currentPassword,
      newPassword,
    };
    setIsUpdatingPassword(true);
    try {
      await AuthService.updatePassword(payload);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // placeholder log can be removed after wiring UI preview of avatar/name

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              {t('settings.profile.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.profile.description')}
            </CardDescription>
            {user && (
              <div className="mt-4 flex items-center gap-2">
                <Dialog
                  open={isAvatarDialogOpen}
                  onOpenChange={open => {
                    setIsAvatarDialogOpen(open);
                    if (!open) {
                      setSelectedAvatarFile(null);
                      if (avatarPreviewUrl)
                        URL.revokeObjectURL(avatarPreviewUrl);
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
            )}
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

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              {t('settings.appearance.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.appearance.darkMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.darkModeDesc')}
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.appearance.compactMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.compactModeDesc')}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              {t('settings.notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notifications.email')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.emailDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notifications.push')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.pushDesc')}
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notifications.taskReminders')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.taskRemindersDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              {t('settings.security.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.security.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <Button
              onClick={handlePasswordUpdate}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword
                ? t('common.saving')
                : t('auth.updatePassword')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
