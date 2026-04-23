import React from 'react';

const DeleteModal = ({ isOpen, onClose, complaintToDelete, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto bg-black bg-opacity-50 sm:p-4">
      <div className="w-full max-w-md p-4 mx-auto bg-white rounded-lg shadow-xl sm:p-6">
        <div className="flex flex-col items-center gap-3 mb-4 text-center sm:flex-row sm:text-left">
          <div className="flex-shrink-0 p-2 text-red-600 bg-red-100 rounded-full">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Delete Complaint</h3>
            <p className="text-xs text-gray-600 sm:text-sm">This action cannot be undone.</p>
          </div>
        </div>
        
        {complaintToDelete && (
          <div className="p-3 mb-4 rounded-lg bg-gray-50 sm:p-4">
            <p className="text-sm font-medium text-gray-900 sm:text-base">{complaintToDelete.leadName}</p>
            <p className="text-xs text-gray-600 line-clamp-2 sm:text-sm">{complaintToDelete.comment}</p>
          </div>
        )}
        
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-150 bg-red-600 rounded-lg hover:bg-red-700 sm:w-auto"
          >
            Delete Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;