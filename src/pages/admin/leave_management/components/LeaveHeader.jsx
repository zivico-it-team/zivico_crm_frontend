import React from 'react';

const LeaveHeader = ({ statusFilter, setStatusFilter, onClearRecords, stats, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">ll ({stats.total})</option>
          <option value="pending">Pending ({stats.pending})</option>
          <option value="approved">Approved ({stats.approved})</option>
          <option value="rejected">Rejected ({stats.rejected})</option>
        </select>
        
        {typeof onClearRecords === 'function' && (
          <button
            onClick={onClearRecords}
            className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status} ({stats[status === 'all' ? 'total' : status]})
          </button>
        ))}
      </div>
      
      {typeof onClearRecords === 'function' && (
        <button
          onClick={onClearRecords}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Clear Records
        </button>
      )}
    </div>
  );
};

export default LeaveHeader;
