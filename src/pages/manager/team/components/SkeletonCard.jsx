import React from 'react';
import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse bg-gray-200 rounded-md', className)}
    {...props}
  />
);

const SkeletonCard = () => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
};

export default SkeletonCard;