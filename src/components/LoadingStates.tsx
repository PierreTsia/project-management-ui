import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingCard = ({
  title,
  description,
  showSpinner = true,
  className = '',
}: LoadingCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
        {showSpinner && <LoadingSpinner size="lg" />}
        {title && (
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}
        {!title && !description && (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        )}
      </CardContent>
    </Card>
  );
};

type LoadingOverlayProps = {
  isVisible: boolean;
  message?: string;
  className?: string;
};

export const LoadingOverlay = ({
  isVisible,
  message,
  className = '',
}: LoadingOverlayProps) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card border shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">
          {message || t('common.loading')}
        </p>
      </div>
    </div>
  );
};

type SkeletonProps = {
  className?: string;
  count?: number;
};

export const Skeleton = ({
  className = 'h-4 w-full',
  count = 1,
}: SkeletonProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-muted rounded ${className}`}
        />
      ))}
    </div>
  );
};

type LoadingButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export const LoadingButton = ({
  children,
  loading = false,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
}: LoadingButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// Page-level loading component
export const PageLoading = ({ message }: { message?: string }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold text-center">
            {t('common.loading')}
          </h2>
          {message && (
            <p className="text-sm text-muted-foreground text-center">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const FullPageSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};
