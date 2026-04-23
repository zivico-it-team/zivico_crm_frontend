import React from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/leaveUtils';

const LeaveTableRow = ({ leave, onApprove, onReject, canManageActions = true }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="font-medium text-gray-900">{leave.user_name || 'Unknown'}</div>
        <div className="text-xs text-gray-500">
          Applied: {leave.applied_date ? formatDate(leave.applied_date) : 'N/A'}
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded whitespace-nowrap">
          {leave.leave_type || 'General'}
        </span>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="text-gray-900">{leave.days || 0} Days</div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {leave.start_date ? formatDate(leave.start_date) : 'N/A'}
        </div>
      </td>
      <td className="hidden max-w-xs px-4 py-3 sm:table-cell sm:px-6 sm:py-4">
        <div className="text-gray-600 truncate" title={leave.reason}>
          {leave.reason || 'No reason provided'}
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="text-gray-900">{leave.action_by || '-'}</div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <StatusBadge status={leave.status} />
      </td>
      {canManageActions && (
        <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
          {leave.status === 'pending' && (
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600 border-green-200 hover:text-green-700 hover:bg-green-50"
              onClick={() => onApprove(leave)}
            >
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
              onClick={() => onReject(leave)}
            >
              Reject
            </Button>
          </div>
          )}
        </td>
      )}
    </tr>
  );
};

export default LeaveTableRow;
