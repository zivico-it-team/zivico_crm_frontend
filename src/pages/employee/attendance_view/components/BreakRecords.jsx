import React from 'react';
import { 
  Timer, 
  AlertCircle, 
  PlayCircle, 
  Trash2, 
  Coffee, 
  Utensils, 
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatDurationSeconds } from '../utils/dateFormatters';
import { BREAK_STATUS_COLORS } from '../utils/attendanceConfig';

export const BreakRecords = ({ 
  breaks, 
  onDeleteBreak 
}) => {
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Coffee': return Coffee;
      case 'Utensils': return Utensils;
      case 'Timer': return Clock; // Changed from Timer to Clock
      case 'Users': return Users;
      default: return Clock;
    }
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const getBreakStatus = (breakItem) => {
    if (breakItem.active) return 'active';
    if (breakItem.exceededSeconds > 0) return 'exceeded';
    return 'completed';
  };

  const getStatusColors = (status) => {
    return BREAK_STATUS_COLORS[status] || BREAK_STATUS_COLORS.default;
  };

  const getColorClasses = (color) => {
    switch(color) {
      case 'orange':
        return { bg: 'bg-orange-50 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-100 dark:border-orange-500/30' };
      case 'emerald':
        return { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-500/30' };
      case 'blue':
        return { bg: 'bg-blue-50 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-500/30' };
      case 'purple':
        return { bg: 'bg-purple-50 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-100 dark:border-purple-500/30' };
      default:
        return { bg: 'bg-gray-50 dark:bg-slate-800', text: 'text-gray-600 dark:text-slate-300', border: 'border-gray-100 dark:border-slate-700' };
    }
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Break Records</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Showing {breaks.length} breaks for {breaks.length > 0 ? 
                new Date(breaks[0].date).toLocaleString('default', { month: 'long', year: 'numeric' }) : 
                'this month'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span>Exceeded</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {breaks.length > 0 ? breaks.map(breakItem => {
          const Icon = getIcon(breakItem.icon);
          const status = getBreakStatus(breakItem);
          const statusColors = getStatusColors(status);
          const today = isToday(breakItem.date);
          const colorClasses = getColorClasses(breakItem.color);
          
          return (
            <div key={breakItem.id} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1 gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start flex-1 gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          breakItem.active ? statusColors.bg : colorClasses.bg
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            breakItem.active ? statusColors.text : colorClasses.text
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 dark:text-slate-100">{breakItem.title}</div>
                            {breakItem.active && (
                              <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                                <PlayCircle className="w-3 h-3" />
                                <span>Active</span>
                              </div>
                            )}
                            {today && !breakItem.active && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-sm text-gray-600 dark:text-slate-300">
                            {breakItem.active ? (
                              `${formatDateTime(breakItem.startTime)} → Active`
                            ) : (
                              breakItem.endTime ? 
                                `${formatDateTime(breakItem.startTime)} → ${formatDateTime(breakItem.endTime)}` :
                                `${formatDateTime(breakItem.startTime)} → Completed`
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "text-right",
                        statusColors.text
                      )}>
                        <div className="text-lg font-bold">
                          {formatDurationSeconds(breakItem.durationSeconds)}
                        </div>
                        {breakItem.exceededSeconds > 0 && (
                          <div className="text-xs font-medium text-rose-500">
                            +{formatDurationSeconds(breakItem.exceededSeconds)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-3">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">Start Time</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {formatDateTime(breakItem.startTime)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">End Time</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {breakItem.endTime ? formatDateTime(breakItem.endTime) : 
                           breakItem.active ? 'Still Active' : 'Completed'}
                        </div>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg",
                        statusColors.bg
                      )}>
                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">Status</div>
                        <div className={cn(
                          "text-sm font-semibold",
                          statusColors.text
                        )}>
                          {breakItem.active ? 'Active' : 
                           breakItem.exceededSeconds > 0 ? 'Time Exceeded' : 
                           'Completed'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-600 dark:text-slate-300">
                        Total Duration: <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {formatDurationSeconds(breakItem.durationSeconds)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteBreak(breakItem.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {breakItem.exceededSeconds > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-rose-50 dark:bg-rose-500/15 border-rose-100 dark:border-rose-500/30">
                          <AlertCircle className="flex-shrink-0 w-4 h-4 text-rose-600 dark:text-rose-300" />
                          <span className="text-sm text-rose-700 dark:text-rose-300">
                            Exceeded time limit by {formatDurationSeconds(breakItem.exceededSeconds)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-8 text-center">
            <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
            <h3 className="mb-1 text-lg font-medium text-gray-700 dark:text-slate-200">No Break Records</h3>
            <p className="text-gray-500 dark:text-slate-400">You haven't taken any breaks this month</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
              Start a break from Quick Actions to see records here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
