import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`
        bg-white rounded-2xl
        ${paddings[padding]}
        ${shadow ? 'shadow-lg shadow-gray-200/50' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};