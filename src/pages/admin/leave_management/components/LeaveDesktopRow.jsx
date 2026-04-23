import { formatDate } from '../utils/leaveUtils';
import StatusBadge from './StatusBadge';

const LeaveDesktopRow = ({ leave, onApprove, onReject, canManageActions = true }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{leave.user_name || 'Unknown'}</div>
        <div className="text-xs text-gray-500">
          {leave.applied_date ? formatDate(leave.applied_date) : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
          {leave.leave_type || 'General'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div>{leave.days || 0} days</div>
        <div className="text-xs text-gray-500">
          {leave.start_date ? formatDate(leave.start_date) : 'N/A'}
        </div>
      </td>
      <td className="max-w-xs px-6 py-4 truncate">
        {leave.reason || 'No reason'}
      </td>
      <td className="px-6 py-4">
        {leave.action_by || '-'}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={leave.status} />
      </td>
      {canManageActions && (
        <td className="px-6 py-4">
          {leave.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(leave)}
              className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(leave)}
              className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              Reject
            </button>
          </div>
          )}
        </td>
      )}
    </tr>
  );
};

export default LeaveDesktopRow;
