import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Trash2, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Button } from '@/components/ui/button';
import { STATUS_CONFIG } from '../utils/leaveConfig';
import { getLeaveTypeColor } from '../utils/leaveHelpers';
import { calculateDays } from '../utils/leaveCalculations';

export const LeaveHistoryTable = ({ 
  applications, 
  onCancelLeave,
  onSwitchToApply 
}) => {
  const canCancel = typeof onCancelLeave === 'function';

  const getStatusConfig = (status) => {
    const key = (status || 'pending').toLowerCase();
    return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  };

  const getStatusIcon = (status) => {
    const config = getStatusConfig(status);
    switch(config.icon) {
      case 'CheckCircle': return CheckCircle;
      case 'XCircle': return XCircle;
      case 'Clock': return Clock;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Application History</h2>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-400">Track all your leave applications</p>
        </div>
        <div className="flex items-center self-start gap-2 sm:self-center">
          <Badge variant="outline" className="gap-1.5">
            <Calendar className="w-3 h-3" />
            {applications.length} total
          </Badge>
        
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
              <tr>
                {['Leave Type', 'Period', 'Duration', 'Reason', 'Status', 'Actions'].map((header, idx) => (
                  <th 
                    key={idx} 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 whitespace-nowrap dark:text-slate-100"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {applications.map((leave, idx) => {
                const statusConfig = getStatusConfig(leave.status);
                const StatusIcon = getStatusIcon(leave.status);
                const isUnpaid = leave.leave_type === 'Unpaid';
                const leaveColor = getLeaveTypeColor(leave.leave_type);
                const days = leave.days ?? calculateDays(leave.start_date, leave.end_date);
                
                return (
                  <Motion.tr
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0",
                          leaveColor === 'blue' && "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
                          leaveColor === 'emerald' && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
                          leaveColor === 'amber' && "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
                          leaveColor === 'purple' && "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
                        )}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">{leave.leave_type}</p>
                            <Badge 
                              variant="outline"
                              className={cn(
                                "text-xs whitespace-nowrap",
                                leaveColor === 'blue' && "border-blue-200 text-blue-700",
                                leaveColor === 'emerald' && "border-emerald-200 text-emerald-700",
                                leaveColor === 'amber' && "border-amber-200 text-amber-700",
                                leaveColor === 'purple' && "border-purple-200 text-purple-700"
                              )}
                            >
                              {days} days
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate dark:text-slate-400">
                            Applied: {new Date(leave.applied_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap dark:text-slate-100">
                          {new Date(leave.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">to</p>
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap dark:text-slate-100">
                          {new Date(leave.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={isUnpaid ? "secondary" : "default"}
                        className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          isUnpaid && "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                        )}
                      >
                        {days} days
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-900 break-words line-clamp-2 dark:text-slate-200">
                          {leave.reason || 'No reason provided'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                          statusConfig.color
                        )}
                      >
                        <StatusIcon className="flex-shrink-0 w-3 h-3" />
                        <span className="capitalize">{statusConfig.label}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {leave.status === 'pending' && canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                            onClick={() => onCancelLeave(leave.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </Motion.tr>
                );
              })}
              
              {applications.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="space-y-3">
                      <div className="inline-flex rounded-full bg-gray-100 p-3 dark:bg-slate-800">
                        <Calendar className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-300">No leave applications found</p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                          Start by applying for your first leave
                        </p>
                      </div>
                      <Button 
                        onClick={onSwitchToApply}
                        variant="outline"
                        size="sm"
                        className="mt-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        <Plus className="w-3 h-3 mr-1.5" />
                        Apply for Leave
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
