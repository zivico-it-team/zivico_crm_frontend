import React, { useState } from 'react';
import HeaderSection from './components/HeaderSection';
import FiltersSection from './components/FiltersSection';
import ComplaintsTable from './components/ComplaintsTable';
import DeleteModal from "./modals/DeleteModal.jsx";
import ViewDetailsModal from './modals/ViewDetailsModal';
import EditComplaintModal from './modals/EditComplaintModal';
import Pagination from './components/Pagination';

const ComplaintsLeads = () => {
  const initialComplaints = [
    {
      id: 1,
      leadName: 'John Doe',
      leadEmail: 'john@example.com',
      leadPhone: '+1 234 567 890',
      complaintOwner: 'Alex Morgan',
      complainee: 'Sales Team',
      type: 'Service Issue',
      comment: 'Poor service quality reported by customer. Customer was very dissatisfied with the support received.',
      status: 'Pending',
      priority: 'High',
      updatedDate: '2024-01-27',
      complaintDate: '2024-01-25',
      statusRequested: 'In Progress',
      statusRequestDate: '2024-01-26',
      requestedBy: 'Manager',
      resolutionDate: null,
      attachments: 2
    },
    {
      id: 2,
      leadName: 'Jane Smith',
      leadEmail: 'jane@example.com',
      leadPhone: '+1 987 654 321',
      complaintOwner: 'Sarah Johnson',
      complainee: 'Support Team',
      type: 'Billing Issue',
      comment: 'Incorrect billing amount charged for the last month.',
      status: 'In Progress',
      priority: 'Medium',
      updatedDate: '2024-01-26',
      complaintDate: '2024-01-24',
      statusRequested: 'Resolved',
      statusRequestDate: '2024-01-25',
      requestedBy: 'Customer',
      resolutionDate: null,
      attachments: 1
    },
    {
      id: 3,
      leadName: 'Mike Wilson',
      leadEmail: 'mike@example.com',
      leadPhone: '+1 456 789 012',
      complaintOwner: 'David Brown',
      complainee: 'Technical Team',
      type: 'Technical Issue',
      comment: 'System keeps crashing when processing payments.',
      status: 'Resolved',
      priority: 'High',
      updatedDate: '2024-01-25',
      complaintDate: '2024-01-20',
      statusRequested: 'Closed',
      statusRequestDate: '2024-01-24',
      requestedBy: 'Support',
      resolutionDate: '2024-01-24',
      attachments: 3
    }
  ];

  const [complaints, setComplaints] = useState(initialComplaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintToEdit, setComplaintToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.leadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || complaint.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || complaint.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || complaint.type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

  // View handlers
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  // Edit handlers
  const handleEditClick = (complaint) => {
    setComplaintToEdit(complaint);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedComplaint) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === updatedComplaint.id ? updatedComplaint : complaint
    ));
    setShowEditModal(false);
    setComplaintToEdit(null);
  };

  // Delete handlers
  const handleDeleteClick = (complaint) => {
    setComplaintToDelete(complaint);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (complaintToDelete) {
      setComplaints(prev => prev.filter(c => c.id !== complaintToDelete.id));
      setShowDeleteModal(false);
      setComplaintToDelete(null);
    }
  };

  // Status update handler
  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, updatedDate: new Date().toISOString().split('T')[0] }
        : complaint
    ));
  };

  const handleUpdateStatus = (complaint) => {
    const newStatus = prompt('Enter new status (Pending/In Progress/Resolved/Exceeded):', complaint.status);
    if (newStatus && ['Pending', 'In Progress', 'Resolved', 'Exceeded'].includes(newStatus)) {
      handleStatusChange(complaint.id, newStatus);
    } else if (newStatus) {
      alert('Invalid status. Please use: Pending, In Progress, Resolved, or Exceeded');
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert(`Exporting ${filteredComplaints.length} complaints...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-3 py-4 sm:px-4 md:px-6 sm:py-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-between w-full p-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm lg:hidden"
        >
          <span className="font-medium text-gray-700">Menu</span>
          <svg className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <HeaderSection 
          onResetFilters={handleResetFilters}
          onExport={handleExport}
          onPrint={handlePrint}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <FiltersSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />

          <ComplaintsTable 
            complaints={paginatedComplaints}
            onViewDetails={handleViewDetails}
            onEditClick={handleEditClick}
            onUpdateStatus={handleUpdateStatus}
            onDeleteClick={handleDeleteClick}
          />

          <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-xs text-center text-gray-700 sm:text-sm sm:text-left">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredComplaints.length)}</span> of{' '}
                <span className="font-medium">{filteredComplaints.length}</span> complaints
              </div>
              
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Modal - Read Only */}
      <ViewDetailsModal 
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
      />

      {/* Edit Modal - With Form Fields */}
      <EditComplaintModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setComplaintToEdit(null);
        }}
        complaint={complaintToEdit}
        onSave={handleEditSave}
      />

      {/* Delete Modal */}
      <DeleteModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setComplaintToDelete(null);
        }}
        complaintToDelete={complaintToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ComplaintsLeads;