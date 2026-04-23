import React from "react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import TypeBadge from "./TypeBadge";

const ComplaintsTable = ({
  Complaints,
  onViewDetails,
  onEditClick,
  onUpdateStatus,
  onDeleteClick,
}) => {
  if (Complaints.length === 0) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center sm:px-6 sm:py-12">
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
            <svg
              className="w-10 h-10 text-gray-400 sm:w-12 sm:h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.714-.833-2.464 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-gray-500 sm:text-base">
              No Compliance found matching your criteria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {Complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">
                #{complaint.id}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onViewDetails(complaint)}
                  className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                  title="View Details"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onEditClick(complaint)}
                  className="p-2 text-green-600 rounded-lg hover:bg-green-50"
                  title="Edit Complaint"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onUpdateStatus(complaint)}
                  className="p-2 text-purple-600 rounded-lg hover:bg-purple-50"
                  title="Update Status"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteClick(complaint)}
                  className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <p className="font-medium text-gray-900">{complaint.leadName}</p>
              <p className="text-sm text-gray-500">{complaint.leadEmail}</p>
              <p className="text-xs text-gray-400">
                Owner: {complaint.complaintOwner}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-700 line-clamp-2">
                {complaint.comment}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Against: {complaint.complainee}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <TypeBadge type={complaint.type} />
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>📅 Complaint: {complaint.complaintDate}</div>
              <div>🔄 Updated: {complaint.updatedDate}</div>
              {complaint.resolutionDate && (
                <div className="col-span-2 text-green-600">
                  ✅ Resolved: {complaint.resolutionDate}
                </div>
              )}
            </div>

            {complaint.attachments > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{complaint.attachments} attachment(s)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Lead Details
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Complaint Info
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Priority
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Dates
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Complaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm whitespace-nowrap md:px-6">
                  #{complaint.id}
                </td>

                <td className="px-4 py-4 md:px-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {complaint.leadName}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-[150px] lg:max-w-none">
                      {complaint.leadEmail}
                    </p>
                    <p className="text-xs text-gray-400">
                      Owner: {complaint.complaintOwner}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4 md:px-6">
                  <div className="max-w-xs">
                    <p
                      className="text-sm text-gray-700 line-clamp-2"
                      title={complaint.comment}
                    >
                      {complaint.comment}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Against: {complaint.complainee}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap md:px-6">
                  <TypeBadge type={complaint.type} />
                </td>

                <td className="px-4 py-4 whitespace-nowrap md:px-6">
                  <PriorityBadge priority={complaint.priority} />
                </td>

                <td className="px-4 py-4 whitespace-nowrap md:px-6">
                  <StatusBadge status={complaint.status} />
                </td>

                <td className="px-4 py-4 md:px-6">
                  <div className="space-y-1 text-xs">
                    <p>📅 {complaint.complaintDate}</p>
                    <p>🔄 {complaint.updatedDate}</p>
                    {complaint.resolutionDate && (
                      <p className="text-green-600">
                        ✅ {complaint.resolutionDate}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap md:px-6">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetails(complaint)}
                      className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50"
                      title="View Details"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => onEditClick(complaint)}
                      className="p-1.5 text-green-600 rounded-lg hover:bg-green-50"
                      title="Edit Complaint"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => onUpdateStatus(complaint)}
                      className="p-1.5 text-purple-600 rounded-lg hover:bg-purple-50"
                      title="Update Status"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => onDeleteClick(complaint)}
                      className="p-1.5 text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintsTable;
