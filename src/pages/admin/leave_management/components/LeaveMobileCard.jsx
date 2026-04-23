import { Calendar, User } from 'lucide-react';
import { formatDate } from '../utils/leaveUtils';
import StatusBadge from './StatusBadge';

const LeaveMobileCard = ({ leave, onApprove, onReject, canManageActions = true }) => {
  return (
    <div className="p-4 space-y-3 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{leave.user_name || 'Unknown'}</h3>
            <p className="text-xs text-gray-500">
              Applied: {leave.applied_date ? formatDate(leave.applied_date) : 'N/A'}
            </p>
          </div>
        </div>
        <StatusBadge status={leave.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded bg-gray-50">
          <span className="text-xs text-gray-500">Type</span>
          <p className="font-medium">{leave.leave_type || 'General'}</p>
        </div>
        <div className="p-2 rounded bg-gray-50">
          <span className="text-xs text-gray-500">Days</span>
          <p className="font-medium">{leave.days || 0}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>From: {leave.start_date ? formatDate(leave.start_date) : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>To: {leave.end_date ? formatDate(leave.end_date) : 'N/A'}</span>
        </div>
      </div>

      {/* Reason */}
      {leave.reason && (
        <div className="text-sm text-gray-600">
          <span className="text-xs text-gray-500">Reason:</span>
          <p className="mt-1">{leave.reason}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <span className="text-xs text-gray-500">Action By:</span>
        <p className="mt-1">{leave.action_by || '-'}</p>
      </div>

      {/* Actions */}
      {canManageActions && leave.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onApprove(leave)}
            className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(leave)}
            className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveMobileCard;
