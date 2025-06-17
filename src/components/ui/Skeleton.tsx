import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded-2xl ${className}`}
        />
      ))}
    </>
  );
};

export const GuardianSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};