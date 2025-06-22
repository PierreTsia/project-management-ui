import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';
import { useForgotPassword } from '@/hooks/useAuth';

export const ForgotPassword = () => {
  const { t } = useTranslations();
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.login.validation.invalidEmail')),
  });

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    await forgotPasswordMutation.mutateAsync(data);
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {t('auth.forgotPassword.emailSent.title')}
            </h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.forgotPassword.emailSent.description')}
            </p>
          </div>
          <div className="text-center">
            <Link to="/login" className="underline">
              {t('auth.checkEmail.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-balance text-muted-foreground">
            {t('auth.forgotPassword.description')}
          </p>
        </div>
        <div className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.common.email')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.common.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending
                  ? t('common.loading')
                  : t('auth.forgotPassword.submit')}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm">
            {t('auth.forgotPassword.backToLogin')}{' '}
            <Link to="/login" className="underline">
              {t('auth.login.title')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
