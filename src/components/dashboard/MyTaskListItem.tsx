import { Link } from 'react-router-dom';
import type { DashboardTask } from '@/types/dashboard';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { TaskStatus } from '@/types/task';

type Props = {
  task: DashboardTask;
};

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  if (status === 'DONE') {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (status === 'IN_PROGRESS') {
    return <Loader2 className="h-4 w-4" />;
  }
  return <Circle className="h-4 w-4" />;
};

export const MyTaskListItem = ({ task }: Props) => {
  return (
    <Link
      to={`/projects/${task.project.id}/${task.id}`}
      key={task.id}
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
      data-testid={`dashboard-task-link-${task.id}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
        <StatusIcon status={task.status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">
          {task.project.name} • {task.priority}
        </p>
      </div>
    </Link>
  );
};
