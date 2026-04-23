import React from 'react';
import { cn } from '@/lib/utils';

export const Badge = ({ children, variant = 'default', className, ...props }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
  
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200",
    secondary: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    outline: "border border-gray-300 bg-transparent text-gray-700 dark:border-slate-700 dark:text-slate-300",
  };
  
  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
