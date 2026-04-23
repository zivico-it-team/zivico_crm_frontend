import React from 'react';
import { Calendar, Search } from 'lucide-react';

const EmptyState = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {searchTerm ? (
        <>
          <Search className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-gray-500">No results found for "{searchTerm}"</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your search</p>
        </>
      ) : (
        <>
          <Calendar className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-gray-500">No leave requests found</p>
          <p className="mt-1 text-sm text-gray-400">New requests will appear here</p>
        </>
      )}
    </div>
  );
};

export default EmptyState;