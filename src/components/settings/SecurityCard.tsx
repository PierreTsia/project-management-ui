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
import { Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import { useUpdatePassword } from '@/hooks/useUpdatePassword';
import { PASSWORD_REGEX } from '@/lib/constants';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'auth.resetPassword.error.alertTitle'),
    newPassword: z
      .string()
      .min(8, 'auth.login.validation.passwordTooShort')
      .regex(PASSWORD_REGEX, 'auth.signup.validation.passwordFormat'),
    confirmPassword: z
      .string()
      .min(8, 'auth.login.validation.passwordTooShort'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.signup.validation.passwordsDoNotMatch',
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecurityCard() {
  const { t } = useTranslations();
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const updatePassword = useUpdatePassword();

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await updatePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      form.reset();
      toast.success('Password updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          {t('settings.security.title')}
        </CardTitle>
        <CardDescription>{t('settings.security.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.updatePassword.newPasswordLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.signup.confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="min-h-10 flex justify-end gap-3">
              {form.formState.isDirty && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.clearErrors();
                      form.reset();
                    }}
                    disabled={updatePassword.isPending}
                  >
                    {t('common.reset')}
                  </Button>
                  <Button type="submit" disabled={updatePassword.isPending}>
                    {updatePassword.isPending
                      ? t('common.saving')
                      : t('auth.updatePasswordAction')}
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
