import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || defaultStyle}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

export default StatusBadge;