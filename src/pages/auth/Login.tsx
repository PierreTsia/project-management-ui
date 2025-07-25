import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FaGoogle } from 'react-icons/fa';

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
import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';

import { useLogin } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import type { ApiError } from '@/types/api';

const loginSchema = z.object({
  email: z.string().email('auth.login.validation.invalidEmail'),
  password: z.string().min(8, 'auth.login.validation.passwordTooShort'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { t } = useTranslations();
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormData) => {
    login(values);
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{t('auth.login.title')}</h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.login.description')}
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('auth.login.loginFailed')}</AlertTitle>
                  <AlertDescription>
                    {(error as ApiError).response?.data?.message ||
                      'Please check your credentials and try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.login.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                      >
                        {t('auth.login.forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  t('auth.login.submitButton')
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                {t('auth.login.googleButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('auth.login.noAccount')}{' '}
            <Link to="/signup" className="underline">
              {t('auth.login.signUpLink')}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden items-center justify-center bg-muted p-12 lg:flex">
        <img
          src="/login.svg"
          alt="Login Illustration"
          className="h-auto lg:max-w-xl xl:max-w-2xl"
        />
      </div>
    </div>
  );
};

export default LoginForm;
