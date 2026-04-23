import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarHeader = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday 
}) => {
  const monthYear = currentDate.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Calendar View</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-slate-300">
          {monthYear}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            className="hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onToday}
            className="px-3 text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
