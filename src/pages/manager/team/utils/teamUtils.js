export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-700';

  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'on leave':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateStats = (members) => ({
  total: members.length,
  active: members.filter((member) => member.status === 'Active').length,
  onLeave: members.filter((member) => member.status === 'On Leave').length,
  new: members.filter(
    (member) =>
      member.joiningDate &&
      new Date(member.joiningDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length,
});

export const filterAndSortMembers = (members, filters) => {
  let result = [...members];
  const { searchTerm, filterDept, activeTab } = filters;

  if (filterDept && filterDept !== 'All') {
    result = result.filter((member) => member.department === filterDept);
  }

  if (activeTab && activeTab !== 'all') {
    result = result.filter(
      (member) => member.status?.toLowerCase() === activeTab.toLowerCase()
    );
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    result = result.filter(
      (member) =>
        (member.name || '').toLowerCase().includes(lower) ||
        (member.designation || '').toLowerCase().includes(lower) ||
        (member.email || '').toLowerCase().includes(lower) ||
        (member.employeeId || '').toLowerCase().includes(lower)
    );
  }

  return result;
};
