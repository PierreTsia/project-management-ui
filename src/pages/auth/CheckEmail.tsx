import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';

export const CheckEmail = () => {
  const { t } = useTranslations();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.checkEmail.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('auth.checkEmail.description')}
          </p>
          {email && (
            <p className="text-sm font-medium bg-muted p-3 rounded-md">
              {email}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {t('auth.checkEmail.instructions')}
          </p>

          <div className="pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.checkEmail.backToLogin')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmail;
