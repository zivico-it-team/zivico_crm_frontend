import React from 'react';

export const BreakHeader = ({ breaksCount, currentMonthString }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Break Records</h2>
        <p className="mt-1 text-sm text-gray-500">
          Showing {breaksCount} breaks for {currentMonthString}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
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
  );
};