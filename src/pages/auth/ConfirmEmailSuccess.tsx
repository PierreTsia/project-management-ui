import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';

export const ConfirmEmailSuccess = () => {
  const { t } = useTranslations();

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
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('auth.confirmation.successDescription')}
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
};

export default ConfirmEmailSuccess;
