import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';
import { useConfirmEmail } from '@/hooks/useAuth';

export const EmailConfirmation = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirmedTokenRef = useRef<string | null | undefined>(undefined);

  const { mutate: confirmEmail } = useConfirmEmail();

  // Get token from URL params
  const token = searchParams.get('token');

  useEffect(() => {
    // Prevent multiple calls for the same token
    if (confirmedTokenRef.current === token) return;

    if (!token) {
      navigate(
        `/confirm-email-error?message=${encodeURIComponent(t('auth.confirmation.noTokenError'))}`
      );
      return;
    }

    confirmedTokenRef.current = token;
    confirmEmail({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, t]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.confirmation.confirming')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {t('auth.confirmation.processing')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
