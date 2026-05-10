import { cn } from '../../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl', className)} />
);

export const TripCardSkeleton = () => (
  <div className="card p-4 space-y-3">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export const CityCardSkeleton = () => (
  <div className="card p-4 space-y-2">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
