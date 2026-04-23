import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatTime } from '../utils/dateFormatters';
import { STATUS_COLORS } from '../utils/attendanceConfig';

export const AttendanceList = ({ 
  records, 
  onDeleteRecord,
  currentMonthString 
}) => {
  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    if (status === 'leave') return 'On Leave';
    if (status === 'off') return 'Off';
    if (status === 'late') return 'Late';
    if (status === 'present') return 'Present';
    if (status === 'absent') return 'Absent';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Attendance Records</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Showing {records.length} records for {currentMonthString}
        </p>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {records.length > 0 ? records.map(record => {
          const today = isToday(record.date);
          const statusColors = STATUS_COLORS[record.status] || STATUS_COLORS.default;
          
          return (
            <div key={record.id || record.date.getTime()} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1 gap-4">
                  {/* Date Box */}
                  <div className={cn(
                    "w-16 h-16 rounded-lg flex flex-col items-center justify-center",
                    today ? "bg-blue-100 dark:bg-blue-500/20" : statusColors.bg
                  )}>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {record.date.getDate()}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-slate-300">
                      {record.date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium px-2 py-1 rounded-full",
                          statusColors.bg,
                          statusColors.text
                        )}>
                          {getStatusLabel(record.status)}
                        </span>
                        {today && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>
                      
                      {/* {record.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )} */}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Check In</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                          {record.check_in_time ? formatTime(record.check_in_time) : '--:--'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Check Out</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                          {record.check_out_time ? formatTime(record.check_out_time) : '--:--'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600 dark:text-slate-300">
                        Working hours
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {record.working_hours || '0.0'}h
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-500 dark:text-slate-400">No attendance records for this month</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">Start by checking in from your dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};
