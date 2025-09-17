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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Camera } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import type { User } from '@/types/user';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useUpdateUserProfile } from '@/hooks/useUpdateUserProfile';
import { parseISO, format } from 'date-fns';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'settings.profile.validation.nameMinLength')
    .max(50, 'settings.profile.validation.nameMaxLength'),
  bio: z
    .string()
    .max(280, 'settings.profile.validation.bioMaxLength')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/u, 'settings.profile.validation.phoneFormat')
    .optional()
    .or(z.literal('')),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'settings.profile.validation.dobFormat')
    .optional()
    .or(z.literal('')),
});
type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileCardProps = {
  user: User;
  isLoading: boolean;
};

export function ProfileCard({ user, isLoading }: ProfileCardProps) {
  const { t } = useTranslations();
  const [email] = useState<string>(user?.email ?? '');

  const {
    isDialogOpen: isAvatarDialogOpen,
    setIsDialogOpen: setIsAvatarDialogOpen,
    isUploading: isUploadingAvatar,
    selectedFile: selectedAvatarFile,
    previewUrl: avatarPreviewUrl,
    allowedImageTypes,
    handleFileSelect: handleAvatarFileSelect,
    handleUpload: handleAvatarUpload,
    resetPreview,
  } = useAvatarUpload();

  const defaultValues = useMemo(
    () => ({
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      phone: user?.phone ?? '',
      dob: user?.dob ? format(parseISO(user.dob), 'yyyy-MM-dd') : '',
    }),
    [user?.name, user?.bio, user?.phone, user?.dob]
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const updateProfile = useUpdateUserProfile();

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      const updated = await updateProfile.mutateAsync({
        name: data.name,
        bio: data?.bio ?? null,
        phone: data?.phone ?? null,
        dob: data?.dob ?? null,
      });
      form.reset({
        name: updated.name,
        bio: updated.bio ?? '',
        phone: updated.phone ?? '',
        dob: updated.dob ? format(parseISO(updated.dob), 'yyyy-MM-dd') : '',
      });
      toast.success('Saved');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  useEffect(() => {
    return () => {
      resetPreview();
    };
  }, [resetPreview]);

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
                resetPreview();
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
                    className="h-24 w-24 rounded-full object-cover border"
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.fullName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('settings.profile.fullNamePlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t('common.email')}</FormLabel>
              <Input
                type="email"
                placeholder={t('auth.common.emailPlaceholder')}
                value={email}
                disabled
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.bio')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('settings.profile.bioPlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.phone')}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('settings.profile.phonePlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.dob')}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder={t('settings.profile.dobPlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 min-h-10 justify-end">
              {form.formState.isDirty && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.clearErrors();
                      form.reset(defaultValues);
                    }}
                    disabled={updateProfile.isPending || isLoading}
                  >
                    {t('common.reset')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending || isLoading}
                  >
                    {updateProfile.isPending
                      ? t('common.saving')
                      : t('common.save')}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
