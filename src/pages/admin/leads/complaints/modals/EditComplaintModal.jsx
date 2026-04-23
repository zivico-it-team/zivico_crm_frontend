import React, { useState, useEffect } from 'react';

const EditComplaintModal = ({ isOpen, onClose, complaint, onSave }) => {
  const [formData, setFormData] = useState({
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    type: '',
    priority: '',
    status: '',
    comment: '',
    complainee: '',
    complaintOwner: ''
  });

  useEffect(() => {
    if (complaint) {
      setFormData({
        leadName: complaint.leadName || '',
        leadEmail: complaint.leadEmail || '',
        leadPhone: complaint.leadPhone || '',
        type: complaint.type || '',
        priority: complaint.priority || '',
        status: complaint.status || '',
        comment: complaint.comment || '',
        complainee: complaint.complainee || '',
        complaintOwner: complaint.complaintOwner || ''
      });
    }
  }, [complaint]);

  if (!isOpen || !complaint) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...complaint,
      ...formData,
      updatedDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto bg-black bg-opacity-50 sm:p-4">
      <div className="w-full max-w-2xl p-4 mx-auto bg-white rounded-lg shadow-xl sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Edit Complaint</h3>
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

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Lead Name</label>
                <input
                  type="text"
                  name="leadName"
                  value={formData.leadName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Lead Email</label>
                <input
                  type="email"
                  name="leadEmail"
                  value={formData.leadEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Lead Phone</label>
                <input
                  type="text"
                  name="leadPhone"
                  value={formData.leadPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Complaint Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Service Issue">Service Issue</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Product Issue">Product Issue</option>
                  <option value="Delay in Response">Delay in Response</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Exceeded">Exceeded</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Complainee</label>
                <input
                  type="text"
                  name="complainee"
                  value={formData.complainee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Complaint Owner</label>
                <input
                  type="text"
                  name="complaintOwner"
                  value={formData.complaintOwner}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Comment Field */}
          <div className="mt-4 sm:mt-6">
            <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 mt-4 sm:flex-row sm:justify-end sm:gap-3 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-150 bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaintModal;