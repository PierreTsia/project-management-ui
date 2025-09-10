import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TaskPriorityChartProps {
  data: {
    low: number;
    medium: number;
    high: number;
  };
  loading?: boolean;
  className?: string;
  testId?: string;
}

const COLORS = {
  high: '#ef4444', // red-500
  medium: '#f59e0b', // amber-500
  low: '#10b981', // green-500
};

export function TaskPriorityChart({
  data,
  loading = false,
  className,
  testId,
}: TaskPriorityChartProps) {
  const { t } = useTranslations();

  if (loading) {
    return (
      <Card
        className={cn('', className)}
        data-testid={testId ?? 'task-priority-chart-skeleton'}
      >
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      priority: 'High',
      value: data.high,
      fill: COLORS.high,
    },
    {
      priority: 'Medium',
      value: data.medium,
      fill: COLORS.medium,
    },
    {
      priority: 'Low',
      value: data.low,
      fill: COLORS.low,
    },
  ];

  return (
    <Card className={cn('', className)} data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('dashboard.charts.taskPriority')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="priority"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip
                formatter={(value: number) => [`${value} tasks`, 'Count']}
                labelFormatter={label => `Priority: ${label}`}
                contentStyle={{
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: COLORS.high,
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:brightness-110"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="hover:brightness-110 transition-all duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
