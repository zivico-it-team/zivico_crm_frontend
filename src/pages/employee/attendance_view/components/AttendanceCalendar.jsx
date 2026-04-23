import React from 'react';
import { cn } from '@/lib/utils';
import { CalendarHeader } from './CalendarHeader';
import { getDaysInMonth } from '../utils/attendanceCalculations';
import { formatTime } from '../utils/dateFormatters';
import { STATUS_COLORS } from '../utils/attendanceConfig';

export const AttendanceCalendar = ({
  currentDate,
  attendanceData,
  onPrevMonth,
  onNextMonth,
  onToday
}) => {
  const getStatusLabel = (status) => {
    if (!status) return '';
    if (status === 'leave') return 'On Leave';
    if (status === 'off') return 'Off';
    if (status === 'late') return 'Late';
    if (status === 'present') return 'Present';
    if (status === 'absent') return 'Absent';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const getDayStatus = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return attendanceData.find((a) => a.date.toDateString() === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate()
      && currentDate.getMonth() === today.getMonth()
      && currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
      />

      <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-medium text-center text-gray-500 dark:text-slate-400">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 rounded-lg" />
        ))}

        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const record = getDayStatus(day);
          const today = isToday(day);
          const offDay = record?.status === 'off';
          const statusColors = record?.status
            ? (STATUS_COLORS[record.status] || STATUS_COLORS.default)
            : STATUS_COLORS.default;

          const hasDetails = !!record && (
            !!record.status
            || !!record.check_in_time
            || Number(record.working_hours || 0) > 0
          );

          return (
            <div
              key={day}
              className={cn(
                'h-24 p-2 rounded-lg border transition-all duration-200',
                today && 'ring-2 ring-blue-500',
                record?.status
                  ? `${statusColors.bg} ${statusColors.border} ${statusColors.hover}`
                  : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn(
                  'text-sm font-medium',
                  today ? 'text-blue-600'
                    : offDay ? 'text-gray-400 dark:text-slate-500' : 'text-gray-700 dark:text-slate-200'
                )}
                >
                  {day}
                </span>
                {today && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>

              {hasDetails && (
                <div className="mt-2 space-y-1">
                  {record.status && (
                    <div className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full w-fit',
                      statusColors.bg,
                      statusColors.text
                    )}
                    >
                      {getStatusLabel(record.status)}
                    </div>
                  )}

                  {record.check_in_time && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
                      <span>In:</span>
                      <span className="font-medium">{formatTime(record.check_in_time)}</span>
                    </div>
                  )}

                  {record.working_hours > 0 && (
                    <div className="text-xs font-medium text-gray-800 dark:text-slate-200">
                      {record.working_hours}h
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
