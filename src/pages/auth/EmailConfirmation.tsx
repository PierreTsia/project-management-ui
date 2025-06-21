import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AuthService } from '@/services/auth';

export const EmailConfirmation = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending');
  const [errorMessage, setErrorMessage] = useState('');

  // Get email from navigation state or URL params
  const email = location.state?.email || searchParams.get('email') || '';
  const token = searchParams.get('token');

  const formSchema = z.object({
    token: z
      .string()
      .min(1, { message: t('auth.confirmation.validation.tokenRequired') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: token || '',
    },
  });

  const handleConfirmEmail = async (values: z.infer<typeof formSchema>) => {
    setIsConfirming(true);
    setErrorMessage('');

    try {
      await AuthService.confirmEmail({
        token: values.token,
        email,
      });
      setConfirmationStatus('success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: t('auth.confirmation.successMessage') },
        });
      }, 2000);
    } catch (error: unknown) {
      setConfirmationStatus('error');
      const errorMsg =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : t('auth.confirmation.errorMessage');
      setErrorMessage(errorMsg || t('auth.confirmation.errorMessage'));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMessage(t('auth.confirmation.noEmailError'));
      return;
    }

    setIsResending(true);
    setErrorMessage('');

    try {
      await AuthService.resendConfirmation({ email });
      // Show success message
      setErrorMessage(''); // Clear any previous errors
      // You might want to show a success toast here
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : t('auth.confirmation.resendErrorMessage');
      setErrorMessage(errorMsg || t('auth.confirmation.resendErrorMessage'));
    } finally {
      setIsResending(false);
    }
  };

  if (confirmationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {t('auth.confirmation.successTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('auth.confirmation.successDescription')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('auth.confirmation.redirectMessage')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.confirmation.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              {t('auth.confirmation.description')}
            </p>
            {email && <p className="mt-2 text-sm font-medium">{email}</p>}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleConfirmEmail)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirmation.tokenLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.confirmation.tokenPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isConfirming}>
                {isConfirming
                  ? t('auth.confirmation.confirming')
                  : t('auth.confirmation.confirmButton')}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t('auth.confirmation.didntReceive')}
            </p>
            <Button
              variant="outline"
              onClick={handleResendConfirmation}
              disabled={isResending || !email}
              className="w-full"
            >
              {isResending
                ? t('auth.confirmation.resending')
                : t('auth.confirmation.resendButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
