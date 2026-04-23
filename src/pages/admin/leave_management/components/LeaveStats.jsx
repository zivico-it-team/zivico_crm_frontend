import React from 'react';

const LeaveStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 sm:text-2xl">{stats?.total || 0}</div>
        <div className="text-xs text-gray-500 sm:text-sm">Total</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-600 sm:text-2xl">{stats?.pending || 0}</div>
        <div className="text-xs text-gray-500 sm:text-sm">Pending</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600 sm:text-2xl">{stats?.approved || 0}</div>
        <div className="text-xs text-gray-500 sm:text-sm">Approved</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-red-600 sm:text-2xl">{stats?.rejected || 0}</div>
        <div className="text-xs text-gray-500 sm:text-sm">Rejected</div>
      </div>
    </div>
  );
};

export default LeaveStats;