import React from 'react';

const TypeBadge = ({ type }) => {
  const getTypeIcon = (type) => {
    const icons = {
      'Service Issue': '🔧',
      'Delay in Response': '⏰',
      'Technical Issue': '💻',
      'Billing Issue': '💰',
      'Product Issue': '📦'
    };
    return icons[type] || '📋';
  };

  const colorMap = {
    'Service Issue': 'bg-purple-100 text-purple-800',
    'Delay in Response': 'bg-orange-100 text-orange-800',
    'Technical Issue': 'bg-blue-100 text-blue-800',
    'Billing Issue': 'bg-red-100 text-red-800',
    'Product Issue': 'bg-green-100 text-green-800'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[type] || 'bg-gray-100 text-gray-800'}`}>
      <span>{getTypeIcon(type)}</span>
      <span className="hidden xs:inline">{type}</span>
    </span>
  );
};

export default TypeBadge;