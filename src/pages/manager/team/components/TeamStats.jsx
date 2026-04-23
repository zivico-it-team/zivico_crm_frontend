import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Calendar, Globe, Sparkles } from 'lucide-react';

const TeamStats = ({ stats, loading }) => {
  const statItems = [
    {
      label: 'Total Members',
      value: loading ? '--' : stats.total,
      description: 'All teams',
      icon: TrendingUp,
      color: 'text-blue-700',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      label: 'Active Now',
      value: loading ? '--' : stats.active,
      description: 'Currently working',
      icon: Clock,
      color: 'text-green-700',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      label: 'On Leave',
      value: loading ? '--' : stats.onLeave,
      description: 'On vacation',
      icon: Calendar,
      color: 'text-blue-700',
      bgGradient: 'from-blue-50 to-sky-50'
    },
 
    {
      label: 'New Joiners',
      value: loading ? '--' : stats.new,
      description: 'Last 30 days',
      icon: Sparkles,
      color: 'text-amber-700',
      bgGradient: 'from-amber-50 to-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
      {statItems.map((stat, index) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (index + 1) * 0.1 }}
          className="relative p-4 overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 shadow-sm rounded-xl group hover:shadow-md"
        >
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-gradient-to-br ${stat.bgGradient}`}></div>
          <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
          <h3 className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
          <div className="flex items-center mt-1 text-xs text-gray-400">
            <stat.icon className="w-3 h-3 mr-1" />
            <span>{stat.description}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TeamStats;