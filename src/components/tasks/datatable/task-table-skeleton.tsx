import { Skeleton } from '@/components/ui/skeleton';

type TaskTableSkeletonProps = {
  rows?: number;
};

export const TaskTableSkeleton = ({ rows = 20 }: TaskTableSkeletonProps) => {
  const items = Array.from({ length: rows });
  return (
    <div className="py-2">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        {items.map((_, idx) => (
          <Skeleton key={idx} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
};

export default TaskTableSkeleton;
