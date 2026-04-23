import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { STATS_CONFIG } from '../utils/attendanceConfig';

export const AttendanceStats = ({ stats }) => {
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'CheckCircle': return CheckCircle;
      case 'XCircle': return XCircle;
      case 'AlertCircle': return AlertCircle;
      case 'Clock': return Clock;
      default: return Clock;
    }
  };

  const getValue = (stat) => {
    const value = stats[stat.valueKey];
    if (stat.format) {
      return stat.format(value);
    }
    return value;
  };

  const getColorClasses = (color) => {
    switch(color) {
      case 'green':
        return { 
          bg: 'bg-green-50 dark:bg-green-500/15', 
          iconBg: 'bg-green-100 dark:bg-green-500/25',
          text: 'text-green-600 dark:text-green-300',
          iconText: 'text-green-600 dark:text-green-300'
        };
      case 'red':
        return { 
          bg: 'bg-red-50 dark:bg-red-500/15', 
          iconBg: 'bg-red-100 dark:bg-red-500/25',
          text: 'text-red-600 dark:text-red-300',
          iconText: 'text-red-600 dark:text-red-300'
        };
      case 'yellow':
        return { 
          bg: 'bg-yellow-50 dark:bg-yellow-500/15', 
          iconBg: 'bg-yellow-100 dark:bg-yellow-500/25',
          text: 'text-yellow-600 dark:text-yellow-300',
          iconText: 'text-yellow-600 dark:text-yellow-300'
        };
      case 'blue':
        return { 
          bg: 'bg-blue-50 dark:bg-blue-500/15', 
          iconBg: 'bg-blue-100 dark:bg-blue-500/25',
          text: 'text-blue-600 dark:text-blue-300',
          iconText: 'text-blue-600 dark:text-blue-300'
        };
      default:
        return { 
          bg: 'bg-gray-50 dark:bg-slate-800', 
          iconBg: 'bg-gray-100 dark:bg-slate-700',
          text: 'text-gray-600 dark:text-slate-300',
          iconText: 'text-gray-600 dark:text-slate-300'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STATS_CONFIG.map(stat => {
        const Icon = getIcon(stat.icon);
        const colorClasses = getColorClasses(stat.color);
        const value = getValue(stat);
        
        return (
          <div 
            key={stat.title} 
            className={`p-4 transition-shadow bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-sm ${colorClasses.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{stat.title}</p>
                <h3 className={`mt-1 text-2xl font-bold ${colorClasses.text}`}>
                  {value}
                </h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${colorClasses.iconBg}`}>
                <Icon className={`w-5 h-5 ${colorClasses.iconText}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
