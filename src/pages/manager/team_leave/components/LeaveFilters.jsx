import React from 'react';
import { Search } from 'lucide-react';

const LeaveFilters = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="relative">
      <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default LeaveFilters;