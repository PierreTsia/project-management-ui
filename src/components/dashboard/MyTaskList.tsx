import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { DashboardTask } from '@/types/dashboard';
import { CheckCircle2 } from 'lucide-react';
import { MyTaskListItem } from './MyTaskListItem';
import { useTranslations } from '@/hooks/useTranslations';

type Props = {
  tasks: DashboardTask[] | undefined;
  loading: boolean;
};

export const MyTaskList = ({ tasks, loading }: Props) => {
  const { t } = useTranslations();
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks && tasks.length > 0) {
    return (
      <div className="space-y-3">
        {tasks.slice(0, 5).map(task => (
          <MyTaskListItem key={task.id} task={task} />
        ))}
        <Button variant="outline" asChild className="w-full mt-3">
          <Link to="/tasks">{t('dashboard.tasks.viewAll')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">
        {t('dashboard.tasks.noTasks')}
      </p>
    </div>
  );
};
