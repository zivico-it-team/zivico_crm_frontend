import React from 'react';
import { History, Shield, Monitor } from 'lucide-react';

const ActivityLogSection = ({ logs }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-50">
          <History className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="relative ml-3 space-y-6 border-l border-gray-200">
        {logs.length === 0 ? (
          <p className="ml-6 text-sm text-gray-500">No recent activity found.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="relative ml-6">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-gray-100" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(log.date).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <Monitor className="w-3 h-3" />
                    {log.device}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <Shield className="w-3 h-3" />
                    {log.ip}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogSection;