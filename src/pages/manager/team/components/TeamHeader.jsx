import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

const TeamHeader = ({ onAddMember }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_70%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.18),_transparent_70%)]" />
      <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200"
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300" />
            Team Overview
          </motion.div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Track member activity, manage assignments, and review your team at a glance.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex w-full flex-col gap-3 md:w-auto md:flex-row"
        >
          <Button
            onClick={onAddMember}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 dark:shadow-blue-950/40"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeamHeader;
