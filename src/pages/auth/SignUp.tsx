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
import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { useRegister } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { RegisterRequest } from '@/types/auth';
import { PASSWORD_REGEX } from '@/lib/constants';

const signUpSchema = z
  .object({
    name: z.string().min(1, 'auth.signup.validation.nameRequired'),
    email: z.string().email('auth.signup.validation.invalidEmail'),
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

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const { t } = useTranslations();
  const { mutateAsync: register, isPending } = useRegister();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormData) => {
    const request: RegisterRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
    };
    await register(request);
  };

  const handleGoogleSignUp = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{t('auth.signup.title')}</h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.signup.description')}
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.signup.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.signup.namePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.signup.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.signup.emailPlaceholder')}
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
                    <FormLabel>{t('auth.signup.passwordLabel')}</FormLabel>
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
                    <FormLabel>
                      {t('auth.signup.confirmPasswordLabel')}
                    </FormLabel>
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
                  t('auth.signup.submitButton')
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleSignUp}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                {t('auth.signup.googleButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('auth.signup.hasAccount')}{' '}
            <Link to="/login" className="underline">
              {t('auth.signup.signInLink')}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden items-center justify-center bg-muted p-12 lg:flex">
        <img
          src="/signup.svg"
          alt="Sign Up Illustration"
          className="h-auto lg:max-w-xl xl:max-w-2xl"
        />
      </div>
    </div>
  );
};

export default SignUpForm;
