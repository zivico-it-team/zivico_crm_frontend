export const statusFilters = ['All', 'Pending', 'Approved', 'Rejected'];

export const clearOptions = [
  { value: 'all', label: 'Clear All Leave Requests' },
  { value: 'approved', label: 'Clear Only Approved' },
  { value: 'rejected', label: 'Clear Only Rejected' },
  { value: 'pending', label: 'Clear Only Pending' },
];

export const filterLeaves = (leaves, searchTerm, statusFilter) => {
  let result = [...leaves];
  
  // Filter by search term
  if (searchTerm && searchTerm.trim() !== '') {
    result = result.filter(l => 
      (l.user_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Filter by status - FIXED: Check for 'all' not 'All'
  if (statusFilter && statusFilter !== 'all') {
    result = result.filter(l => l.status === statusFilter);
  }
  
  return result;
};

export const getLeaveStats = (leaves) => {
  return {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
