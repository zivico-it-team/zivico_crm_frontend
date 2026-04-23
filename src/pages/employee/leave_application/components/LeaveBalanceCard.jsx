import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Ban, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { getLeaveTypeColor } from '../utils/leaveHelpers';

export const LeaveBalanceCard = ({ 
  balance, 
  index, 
  isSelected, 
  isAvailable, 
  leaveStatus,
  onClick 
}) => {
  const colorClass = getLeaveTypeColor(balance.type);
  const isUnlimited = Boolean(balance.unlimited);
  const percentage = !isUnlimited && balance.total > 0 ? (balance.used / balance.total) * 100 : 0;
  const hasNoAccess = leaveStatus === 'no_access';
  const hasNoBalance = leaveStatus === 'no_balance' && !isUnlimited;
  
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!hasNoAccess ? { y: -2 } : {}}
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-200",
        hasNoAccess && "cursor-not-allowed",
        !hasNoAccess ? "bg-white cursor-pointer dark:bg-slate-900" : "bg-gray-50 dark:bg-slate-800/80",
        isSelected && !hasNoAccess
          ? `border-${colorClass}-300 ring-1 ring-${colorClass}-100` 
          : !hasNoAccess 
          ? "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600"
          : "border-gray-100 dark:border-slate-700"
      )}
      onClick={() => onClick?.(balance.type)}
    >
      {hasNoAccess && (
        <div className="absolute inset-0 rounded-xl bg-gray-100/50 dark:bg-slate-900/60" />
      )}

      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-xl bg-gray-100 dark:bg-slate-800">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
          className={cn(
            "h-full",
            isAvailable ? `bg-${colorClass}-500` : "bg-gray-400"
          )}
        />
      </div>

      <div className={cn("pt-2", !isAvailable && "opacity-70")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{balance.type}</span>
            {!isAvailable && (
              <Badge 
                variant="destructive"
                className="bg-red-50 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300"
              >
                <Ban className="w-3 h-3 mr-1" />
                {hasNoAccess ? 'No Access' : 'No Balance'}
              </Badge>
            )}
          </div>
          <Badge 
            variant={isUnlimited || balance.remaining > 0 ? "default" : "destructive"}
            className={cn(
              "text-xs",
              balance.type === 'Unpaid' && "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
              !isAvailable && "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
            )}
          >
            {isUnlimited ? 'Unlimited' : `${balance.remaining} left`}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">Used</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">{balance.used} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">Total</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">
              {isUnlimited ? 'Unlimited' : `${balance.total} days`}
            </span>
          </div>
        </div>
        
        {!isAvailable && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-red-600">
              <Ban className="w-3 h-3" />
              <span>
                {hasNoAccess
                  ? 'Admin access required'
                  : hasNoBalance
                    ? 'Balance exhausted'
                    : 'Not available for application'}
              </span>
            </div>
          </Motion.div>
        )}
        
        {isSelected && !hasNoAccess && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
              <ChevronRight className="w-3 h-3" />
              <span>Selected for application</span>
            </div>
          </Motion.div>
        )}
      </div>
    </Motion.div>
  );
};
