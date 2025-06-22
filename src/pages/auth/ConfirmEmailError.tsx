import { AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { useResendConfirmation } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import type { ApiError } from '@/types/api';

export const ConfirmEmailError = () => {
  const { t } = useTranslations();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  const resendMutation = useResendConfirmation();

  const resendSchema = z.object({
    email: z
      .string()
      .email({ message: t('auth.login.validation.invalidEmail') }),
  });

  const form = useForm<z.infer<typeof resendSchema>>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: '',
    },
  });

  // Get error message from URL params or use default
  const errorMessage =
    searchParams.get('message') || t('auth.confirmation.errorMessage');

  const onSubmit = async (data: z.infer<typeof resendSchema>) => {
    try {
      await resendMutation.mutateAsync(data);
      setShowSuccess(true);
    } catch (error) {
      // Error is displayed via resendMutation.error in the UI
      console.error('Resend confirmation failed:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {t('auth.confirmation.resendSuccess')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {t('auth.confirmation.resendSuccessMessage')}
            </p>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link to="/login">{t('auth.confirmation.backToLogin')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            {t('auth.confirmation.errorTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">{errorMessage}</p>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('auth.confirmation.resendDescription')}
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.confirmation.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.confirmation.emailPlaceholder')}
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
                  disabled={resendMutation.isPending}
                >
                  {resendMutation.isPending
                    ? t('auth.confirmation.resendSending')
                    : t('auth.confirmation.resendEmail')}
                </Button>

                {resendMutation.error && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    {(resendMutation.error as ApiError).response?.data
                      ?.message || t('auth.confirmation.resendErrorMessage')}
                  </p>
                )}
              </form>
            </Form>

            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">{t('auth.confirmation.backToLogin')}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailError;
