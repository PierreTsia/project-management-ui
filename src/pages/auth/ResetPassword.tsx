import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useResetPassword } from '@/hooks/useAuth';
import { PASSWORD_REGEX } from '@/lib/constants';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'auth.signup.validation.passwordTooShort')
      .regex(PASSWORD_REGEX, 'auth.signup.validation.passwordFormat'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'auth.signup.validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const { t } = useTranslations();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      // Redirect to forgot password page if no token
      navigate('/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
      });
      setPasswordReset(true);
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Password reset failed:', error);
    }
  };

  if (passwordReset) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {t('auth.resetPassword.success.title')}
            </h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.resetPassword.success.description')}
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

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {t('auth.resetPassword.error.title')}
            </h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.resetPassword.error.description')}
            </p>
          </div>
          <div className="text-center">
            <Link to="/forgot-password" className="underline">
              {t('auth.resetPassword.error.requestNew')}
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
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-balance text-muted-foreground">
            {t('auth.resetPassword.description')}
          </p>
        </div>
        <div className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {resetPasswordMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {t('auth.resetPassword.error.alertTitle')}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        {resetPasswordMutation.error.response?.data?.message ||
                          t('auth.resetPassword.error.generic')}
                      </p>
                      <p>
                        <Link
                          to="/forgot-password"
                          className="underline hover:no-underline"
                        >
                          {t('auth.resetPassword.error.requestNew')}
                        </Link>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.signup.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                      />
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
                    <FormLabel>
                      {t('auth.signup.confirmPasswordLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
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
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? t('common.loading')
                  : t('auth.resetPassword.submit')}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm">
            {t('auth.resetPassword.backToLogin')}{' '}
            <Link to="/login" className="underline">
              {t('auth.login.title')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
