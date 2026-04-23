import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange 
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      {/* Mobile Pagination Controls */}
      <div className="flex items-center gap-1 sm:hidden">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          ←
        </button>
        
        <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </span>
        
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          →
        </button>
      </div>

      {/* Desktop Pagination Controls */}
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        
        {renderPageNumbers()}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      
      {/* Rows Per Page Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-700 sm:text-sm">Show</span>
        <select 
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="hidden text-xs text-gray-700 sm:inline sm:text-sm">rows</span>
      </div>
    </div>
  );
};

export default Pagination;