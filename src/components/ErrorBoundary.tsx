import React, { useState, useEffect, type ReactNode } from 'react';
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

// Custom hook for error boundary functionality
const useErrorBoundary = (
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  useEffect(() => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      setErrorState({ hasError: true, error, errorInfo });

      // Call the onError callback if provided
      onError?.(error, errorInfo);

      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }

      // In production, you might want to send this to an error reporting service
      // Example: Sentry.captureException(error, { extra: errorInfo });
    };

    // Add global error handler
    const originalErrorHandler = window.onerror;
    const originalUnhandledRejectionHandler = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        handleError(error, { componentStack: `${source}:${lineno}:${colno}` });
      }
      return originalErrorHandler?.(message, source, lineno, colno, error);
    };

    window.onunhandledrejection = event => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      handleError(error, { componentStack: 'Unhandled Promise Rejection' });
      if (originalUnhandledRejectionHandler) {
        return originalUnhandledRejectionHandler.call(window, event);
      }
    };

    return () => {
      window.onerror = originalErrorHandler;
      window.onunhandledrejection = originalUnhandledRejectionHandler;
    };
  }, [onError]);

  const resetError = () => {
    setErrorState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  return { errorState, resetError };
};

// Error display component
const ErrorDisplay = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
}: {
  error?: Error;
  errorInfo?: React.ErrorInfo;
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

export const ErrorBoundary = ({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) => {
  const { errorState, resetError } = useErrorBoundary(onError);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (errorState.hasError) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default error UI with i18n
    return (
      <ErrorDisplay
        error={errorState.error}
        errorInfo={errorState.errorInfo}
        onRetry={resetError}
        onGoHome={handleGoHome}
      />
    );
  }

  return <>{children}</>;
};
