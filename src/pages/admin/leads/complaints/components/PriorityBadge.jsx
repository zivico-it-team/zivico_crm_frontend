import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    const priorityConfig = {
      'urgent': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'low': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' }
    };

    return priorityConfig[priority?.toLowerCase()] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      dot: 'bg-gray-500'
    };
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {priority}
    </span>
  );
};

export default PriorityBadge;