import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface TaskCompletionChartProps {
  data: {
    completed: number;
    inProgress: number;
    todo: number;
  };
  loading?: boolean;
  className?: string;
}

const COLORS = {
  completed: '#10b981', // green-500
  inProgress: '#f59e0b', // amber-500
  todo: '#6b7280', // gray-500
};

// Note: DARK_COLORS could be used for theme-aware colors in the future
// const DARK_COLORS = {
//   completed: '#34d399', // green-400
//   inProgress: '#fbbf24', // amber-400
//   todo: '#9ca3af', // gray-400
// };

export function TaskCompletionChart({
  data,
  loading = false,
  className,
}: TaskCompletionChartProps) {
  const { t } = useTranslations();

  if (loading) {
    return (
      <Card className={cn('', className)}>
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
      name: 'Completed',
      value: data.completed,
      color: COLORS.completed,
    },
    {
      name: 'In Progress',
      value: data.inProgress,
      color: COLORS.inProgress,
    },
    {
      name: 'To Do',
      value: data.todo,
      color: COLORS.todo,
    },
  ];

  const total = data.completed + data.inProgress + data.todo;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('dashboard.charts.taskDistribution')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} tasks (${Math.round((value / total) * 100)}%)`,
                  name,
                ]}
                labelFormatter={label => `Status: ${label}`}
                contentStyle={{
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={value => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {chartData.map(item => (
            <div key={item.name} className="space-y-1">
              <div
                className="w-3 h-3 rounded-full mx-auto"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-sm font-medium">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
