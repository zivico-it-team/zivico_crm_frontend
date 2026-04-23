import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, CalendarDays } from 'lucide-react';

export const LeaveStats = ({ stats }) => {
  const iconStyles = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
  };

  const statItems = [
    { 
      label: 'Total Applications', 
      value: stats.totalApplied, 
      icon: FileText,
      color: 'blue'
    },
    { 
      label: 'Approved', 
      value: stats.approved, 
      icon: CheckCircle,
      color: 'emerald'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: Clock,
      color: 'amber'
    },
    { 
      label: 'Days Used', 
      value: stats.usedDays, 
      icon: CalendarDays,
      color: 'purple'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
            </div>
            <div className={`flex-shrink-0 rounded-full p-2.5 ${iconStyles[stat.color]}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
