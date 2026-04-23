import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Search } from 'lucide-react';

const EmptyState = ({ searchTerm, filterDept, activeTab, onClearFilters }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 text-center bg-white border border-gray-200 rounded-xl"
    >
      <div className="relative inline-block mb-4">
        <Users className="w-16 h-16 mx-auto text-gray-300" />
        <div className="absolute -top-2 -right-2">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
      <p className="mt-1 text-gray-500">
        {searchTerm || filterDept !== 'All' || activeTab !== 'all' 
          ? "Try adjusting your search or filters." 
          : "Get started by adding your first team member."}
      </p>
      {(searchTerm || filterDept !== 'All' || activeTab !== 'all') && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;