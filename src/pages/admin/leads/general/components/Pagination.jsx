import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalLeads, itemsPerPage, setCurrentPage, setItemsPerPage }) => {
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalLeads)} of {totalLeads}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handlePrev} disabled={currentPage === 1} className="p-1 border rounded disabled:opacity-50">
          <ChevronLeft className="w-4 h-4"/>
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages} className="p-1 border rounded disabled:opacity-50">
          <ChevronRight className="w-4 h-4"/>
        </button>
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-1 border rounded">
          {[5,10,25,50].map(num => <option key={num} value={num}>{num} per page</option>)}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
