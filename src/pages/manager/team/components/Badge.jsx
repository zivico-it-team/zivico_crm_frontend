import React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 bg-transparent text-gray-700'
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;