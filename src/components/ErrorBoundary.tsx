import React, { type ReactNode, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

// Error display component
const ErrorDisplay = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
}: {
  error?: Error | undefined;
  errorInfo?: React.ErrorInfo | undefined;
  onRetry: () => void;
  onGoHome: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{t('errorBoundary.title')}</CardTitle>
          <CardDescription>{t('errorBoundary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <details className="rounded-lg border bg-muted p-3">
              <summary className="cursor-pointer font-medium text-sm">
                {t('errorBoundary.errorDetails')}
              </summary>
              <div className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {error.toString()}
                {errorInfo?.componentStack && (
                  <>
                    {'\n\n'}
                    {t('errorBoundary.componentStack')}
                    {errorInfo.componentStack}
                  </>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2 justify-center">
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('errorBoundary.tryAgain')}
            </Button>
            <Button variant="outline" onClick={onGoHome}>
              <Home className="mr-2 h-4 w-4" />
              {t('errorBoundary.goHome')}
            </Button>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              <Bug className="mr-1 h-3 w-3" />
              {t('errorBoundary.reportIssue')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Functional error boundary using global error handlers
export const ErrorBoundary = ({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      const errorInfo: React.ErrorInfo = {
        componentStack: error.error?.stack || '',
      };

      setErrorState({
        hasError: true,
        error: error.error,
        errorInfo,
      });

      onError?.(error.error, errorInfo);

      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error.error, errorInfo);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(
        event.reason?.message || 'Unhandled promise rejection'
      );
      const errorInfo: React.ErrorInfo = {
        componentStack: event.reason?.stack || '',
      };

      setErrorState({
        hasError: true,
        error,
        errorInfo,
      });

      onError?.(error, errorInfo);

      if (process.env.NODE_ENV === 'development') {
        console.error(
          'ErrorBoundary caught an unhandled rejection:',
          error,
          errorInfo
        );
      }
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Cleanup listeners
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [onError]);

  const handleRetry = () => {
    setErrorState({ hasError: false });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (errorState.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorDisplay
        error={errorState.error}
        errorInfo={errorState.errorInfo}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
      />
    );
  }

  return <>{children}</>;
};
