import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusConfig = {
      'pending': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        icon: '⏳'
      },
      'in progress': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: '🔄'
      },
      'resolved': { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        icon: '✅'
      },
      'exceeded': { 
        bg: 'bg-red-100', 
        text: 'text-red-800',
        icon: '⚠️'
      }
    };

    return statusConfig[status?.toLowerCase()] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      icon: '📌'
    };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      <span className="hidden xs:inline">{status}</span>
    </span>
  );
};

export default StatusBadge;