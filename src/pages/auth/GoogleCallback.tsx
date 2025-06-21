import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FullPageSpinner } from '@/components/LoadingStates';
import { useTranslations } from '@/hooks/useTranslations';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const provider = searchParams.get('provider');

      if (!accessToken || !refreshToken || provider !== 'google') {
        // Redirect to error page if tokens are missing
        navigate('/auth/error?message=Invalid callback parameters');
        return;
      }

      try {
        // Store tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch user data to cache it
        // We'll use the existing useUser hook logic by invalidating queries
        queryClient.invalidateQueries({ queryKey: ['user'] });

        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error handling Google OAuth callback:', error);
        navigate('/auth/error?message=Failed to complete authentication');
      }
    };

    handleCallback();
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FullPageSpinner />
        <p className="mt-4 text-muted-foreground">
          {t('auth.callback.processing')}
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
