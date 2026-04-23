// src/pages/manager/team/components/TeamControls.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Trash2, ChevronDown, Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { teamDepartments } from '../utils/teamData';

const TeamControls = ({
  searchTerm,
  setSearchTerm,
  filterDept,
  setFilterDept,
  activeTab,
  setActiveTab,
  selectedMembers,
  onBulkDelete,
  filteredMembers,
  members,
  teamOptions = []
}) => {
  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'on leave', label: 'On Leave' },
    { id: 'inactive', label: 'Inactive' }
  ];

  // Get display text for the dropdown button
  const getDropdownDisplay = () => {
    if (filterDept === 'All') return 'All Teams';
    return filterDept;
  };

  const availableTeams = teamOptions.length > 0 ? teamOptions : teamDepartments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
      className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80"
    >
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Search by name, designation, or email..."
            className="pl-9 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Team Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Team:</span>
                {getDropdownDisplay()}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 overflow-y-auto max-h-80">
              <DropdownMenuItem 
                onClick={() => setFilterDept('All')}
                className="font-medium text-blue-600"
              >
                <Users className="w-4 h-4 mr-2" />
                All Teams
              </DropdownMenuItem>
              <div className="h-px my-1 bg-gray-200" />
              {availableTeams.map((dept) => (
                <DropdownMenuItem 
                  key={dept} 
                  onClick={() => setFilterDept(dept)}
                  className={filterDept === dept ? 'bg-blue-50 text-blue-600' : ''}
                >
                  {dept}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Delete Button */}
          {selectedMembers.length > 0 && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={onBulkDelete}
              title={`Delete ${selectedMembers.length} members`}
              className="transition-transform duration-300 hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <motion.div key={tab.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full transition-all duration-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {tab.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Results count */}
      <motion.div
        key={`${activeTab}-${filterDept}-${filteredMembers.length}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-sm text-gray-500 dark:text-slate-400"
      >
        Showing {filteredMembers.length} of {members.length} members
        {filterDept !== 'All' && (
          <span> in <span className="font-medium text-slate-700 dark:text-slate-200">{filterDept}</span></span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TeamControls;
