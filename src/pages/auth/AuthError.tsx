import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';

export const AuthError = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslations();
  const errorMessage = searchParams.get('message') || 'Unknown error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.error.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {t('auth.error.description')}
          </p>
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Error:</strong> {decodeURIComponent(errorMessage)}
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/login">{t('auth.error.backToLogin')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthError;
