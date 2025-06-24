import { Skeleton } from '@/components/ui/skeleton';

export const ProjectDetailsSkeleton = () => {
  return (
    <div className="space-y-8" data-testid="project-details-skeleton">
      {/* Back Button Skeleton */}
      <div className="flex items-center">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-9" />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* People Section Skeleton */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex -space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Dates Skeleton */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="pl-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Attachments Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="flex gap-2 pl-4">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-32" />
            </div>
          </div>

          {/* Tasks Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="bg-card border border-border/50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-8">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-1">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
