// src/pages/manager/team/components/TeamGrid.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MemberCard from './MemberCard';
import EmptyState from './EmptyState';
import SkeletonCard from './SkeletonCard';

const gridVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.2,
    },
  },
};

const TeamGrid = ({
  loading,
  filteredMembers,
  members,
  searchTerm,
  filterDept,
  activeTab,
  selectedMembers,
  onToggleSelect,
  onOpenProfile,
  onDeleteMember,
  onClearFilters,
  getManagerName
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <EmptyState
        searchTerm={searchTerm}
        filterDept={filterDept}
        activeTab={activeTab}
        onClearFilters={onClearFilters}
        members={members}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={`${activeTab}-${filterDept}-${searchTerm}`}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredMembers.map((member, idx) => (
          <MemberCard
            key={member.id}
            member={member}
            index={idx}
            isSelected={selectedMembers.includes(member.id)}
            onToggleSelect={() => onToggleSelect(member.id)}
            onOpenProfile={() => onOpenProfile(member)}
            onDelete={() => onDeleteMember(member)}
            getManagerName={getManagerName}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamGrid;
