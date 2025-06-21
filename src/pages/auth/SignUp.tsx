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

export const SignUpForm = () => {
  const { t } = useTranslations();

  const formSchema = z
    .object({
      name: z
        .string()
        .min(1, { message: t('auth.signup.validation.nameRequired') }),
      email: z
        .string()
        .email({ message: t('auth.signup.validation.invalidEmail') }),
      password: z
        .string()
        .min(8, { message: t('auth.signup.validation.passwordTooShort') }),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('auth.signup.validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do nothing for now.
    console.log(values);
  }

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
              <Button type="submit" className="w-full">
                {t('auth.signup.submitButton')}
              </Button>
              <Button variant="outline" className="w-full">
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
