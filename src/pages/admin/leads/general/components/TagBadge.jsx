import React from 'react';

const TagBadge = ({ tag }) => {
  const config = {
    'No Answer': { bg: 'bg-red-50', text: 'text-red-700' },
    'Not Interested': { bg: 'bg-gray-50', text: 'text-gray-700' },
    'Other Language': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'Interested': { bg: 'bg-green-50', text: 'text-green-700' },
    'New Lead': { bg: 'bg-purple-50', text: 'text-purple-700' },
  };

  const style = config[tag] || { bg: 'bg-gray-50', text: 'text-gray-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border ${style.bg} ${style.text}`}>
      {tag}
    </span>
  );
};

export default TagBadge;