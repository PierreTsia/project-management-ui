import { Button } from '@/components/ui/button';
import { AnimatedList } from '@/components/ui/animated-list';
import { SquareCheckBig } from 'lucide-react';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';

export type ProjectTasksListViewProps = {
  tasks: ReadonlyArray<Task>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onCreate: () => void;
  renderItem: (task: Task) => ReactNode;
  ctaLabel: string;
};

export const ProjectTasksListView = ({
  tasks,
  renderItem,
  onCreate,
  ctaLabel,
}: ProjectTasksListViewProps): ReactNode => (
  <div className="space-y-3 px-2 sm:px-4">
    <AnimatedList
      items={tasks}
      getKey={task => task.id}
      renderItem={renderItem}
    />
    <div className="pt-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => onCreate?.()}
      >
        <SquareCheckBig className="h-3 w-3 mr-1" />
        {ctaLabel}
      </Button>
    </div>
  </div>
);

export default ProjectTasksListView;
