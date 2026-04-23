import EmptyState from './EmptyState';
import LeaveDesktopRow from './LeaveDesktopRow';
import LeaveMobileCard from './LeaveMobileCard';

const LeaveTable = ({ leaves, onApprove, onReject, searchTerm, canManageActions = true }) => {
  if (leaves.length === 0) {
    return <EmptyState searchTerm={searchTerm} />;
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="divide-y divide-gray-100 lg:hidden">
        {leaves.map((leave) => (
          <LeaveMobileCard
            key={leave.id}
            leave={leave}
            onApprove={onApprove}
            onReject={onReject}
            canManageActions={canManageActions}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Action By</th>
              <th className="px-6 py-3">Status</th>
              {canManageActions && <th className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <LeaveDesktopRow
                key={leave.id}
                leave={leave}
                onApprove={onApprove}
                onReject={onReject}
                canManageActions={canManageActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LeaveTable;
