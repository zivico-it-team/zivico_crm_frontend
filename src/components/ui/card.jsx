import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`border-b border-gray-200 px-6 py-4 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
