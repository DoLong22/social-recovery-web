import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  iconSize?: number;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📄',
  iconSize = 48,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <span style={{ fontSize: iconSize }}>{icon}</span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  );
};