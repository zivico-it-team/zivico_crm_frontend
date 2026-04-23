import React from 'react';

const LeadStageBadge = ({ stage }) => {
  const config = {
    'Registered': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '✓' },
    'Ongoing Followup': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⏰' },
    'Sales Not Interested': { bg: 'bg-red-50', text: 'text-red-700', icon: '✗' },
    'Sales Done': { bg: 'bg-green-50', text: 'text-green-700', icon: '✓' },
    'New': { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '🆕' },
  };

  const style = config[stage] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: '•' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className="mr-1">{style.icon}</span>
      <span className="truncate max-w-[100px]">{stage}</span>
    </span>
  );
};

export default LeadStageBadge;