import React from 'react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const ViewDetailsModal = ({ isOpen, onClose, complaint }) => {
  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto bg-black bg-opacity-50 sm:p-4">
      <div className="w-full max-w-2xl p-4 mx-auto bg-white rounded-lg shadow-xl sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Complaint Details</h3>
            <p className="text-xs text-gray-600 sm:text-sm">Complaint ID: #{complaint.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content - Read Only */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">Lead Information</h4>
              <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
                <p className="text-sm font-medium sm:text-base">{complaint.leadName}</p>
                <p className="text-xs text-gray-600 break-all sm:text-sm">{complaint.leadEmail}</p>
                <p className="text-xs text-gray-600 sm:text-sm">{complaint.leadPhone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">Complaint Details</h4>
              <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
                <p className="text-sm font-medium">Type: {complaint.type}</p>
                <p className="text-xs text-gray-600 sm:text-sm">Against: {complaint.complainee}</p>
                <p className="text-xs text-gray-600 sm:text-sm">Owner: {complaint.complaintOwner}</p>
                {complaint.attachments > 0 && (
                  <p className="mt-1 text-xs text-blue-600">📎 {complaint.attachments} attachment(s)</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">Status Information</h4>
              <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs sm:text-sm">Status:</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs sm:text-sm">Priority:</span>
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <p className="text-xs text-gray-600 sm:text-sm">Requested By: {complaint.requestedBy}</p>
              </div>
            </div>
            
            <div>
              <h4 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">Timeline</h4>
              <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
                <div className="space-y-1 text-xs sm:text-sm">
                  <p>📅 Complaint: {complaint.complaintDate}</p>
                  <p>🔄 Last Updated: {complaint.updatedDate}</p>
                  <p>⏳ Status Request: {complaint.statusRequestDate}</p>
                  {complaint.resolutionDate && (
                    <p className="text-green-600">✅ Resolution: {complaint.resolutionDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comment Section */}
        <div className="mt-4 sm:mt-6">
          <h4 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">Comment</h4>
          <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
            <p className="text-xs text-gray-700 sm:text-sm">{complaint.comment}</p>
          </div>
        </div>
        
        {/* Close Button Only */}
        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;