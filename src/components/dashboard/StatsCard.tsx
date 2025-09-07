import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  loading = false,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 md:px-6 md:py-6">
          <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
          <Skeleton className="h-3 w-3 md:h-4 md:w-4" />
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <Skeleton className="h-6 w-12 md:h-8 md:w-16 mb-1" />
          <Skeleton className="h-3 w-24 hidden sm:block" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 md:px-6 md:py-6">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="text-xl md:text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-1">
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1 hidden sm:inline">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
