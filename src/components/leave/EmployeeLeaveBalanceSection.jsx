import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { buildAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';

const LEAVE_TYPE_COLUMNS = [
  {
    key: 'annual',
    title: 'Annual Leave',
    titleClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
    subHeaderClass: 'bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200',
    cellClass: 'bg-blue-50/45 dark:bg-blue-500/10',
  },
  {
    key: 'casual',
    title: 'Casual Leave',
    titleClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    subHeaderClass: 'bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    cellClass: 'bg-amber-50/45 dark:bg-amber-500/10',
  },
  {
    key: 'medical',
    title: 'Special Leave',
    titleClass: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
    subHeaderClass: 'bg-violet-50/80 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200',
    cellClass: 'bg-violet-50/45 dark:bg-violet-500/10',
  },
  {
    key: 'unpaid',
    title: 'Unpaid Leave',
    titleClass: 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200',
    subHeaderClass: 'bg-slate-100/80 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
    cellClass: 'bg-slate-100/50 dark:bg-slate-700/25',
  },
];

const formatLeaveDays = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return '0';
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
};

const getBalanceMap = (balances = []) =>
  new Map(
    balances.map((balance) => [String(balance?.type || '').toLowerCase(), balance])
  );

const formatBalanceValue = (balance, field) => {
  if (!balance) return '0';

  if (balance.unlimited && (field === 'total' || field === 'left')) {
    return 'Open';
  }

  return formatLeaveDays(balance?.[field]);
};

const getInitials = (name) =>
  String(name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

const EmployeeLeaveBalanceSection = ({
  employees = [],
  routeBase = '/admin',
  title = 'Employee Leave Balance',
  description = 'Individual employee allocated, used, and remaining leaves for HR and admin review.',
  emptyMessage = 'No employee leave balance data is available right now.',
  maxRows = null,
  className = '',
  showManageLink = true,
}) => {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [employees.length, maxRows]);

  const hasRowLimit = Number.isInteger(maxRows) && maxRows > 0;
  const visibleRows = hasRowLimit && !showAll ? employees.slice(0, maxRows) : employees;

  return (
    <div className={cn('bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl', className)}>
      <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{description}</p>
        </div>
        {showManageLink ? (
          <Link
            to={`${routeBase}/employees`}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/20 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/30 transition-colors"
          >
            Manage Employees
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : null}
      </div>

      <div className="p-5">
        {employees.length === 0 ? (
          <div className="py-10 text-sm text-center text-gray-500 dark:text-slate-400">{emptyMessage}</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-[1380px] w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/80">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    <th rowSpan={2} className="px-4 py-3 font-medium align-middle">Employee</th>
                    <th rowSpan={2} className="px-4 py-3 font-medium align-middle">Department</th>
                    {LEAVE_TYPE_COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        colSpan={3}
                        className={cn(
                          'px-4 py-3 font-medium text-center border-l border-gray-100 dark:border-slate-700',
                          column.titleClass
                        )}
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                  <tr className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {LEAVE_TYPE_COLUMNS.map((column) => (
                      <React.Fragment key={`${column.key}_metrics`}>
                        <th
                          className={cn(
                            'px-3 py-2 font-medium text-center border-l border-t border-gray-100 dark:border-slate-700',
                            column.subHeaderClass
                          )}
                        >
                          Allocated
                        </th>
                        <th
                          className={cn(
                            'px-3 py-2 font-medium text-center border-t border-gray-100 dark:border-slate-700',
                            column.subHeaderClass
                          )}
                        >
                          Used
                        </th>
                        <th
                          className={cn(
                            'px-3 py-2 font-medium text-center border-t border-gray-100 dark:border-slate-700',
                            column.subHeaderClass
                          )}
                        >
                          Remaining
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((employee) => {
                    const avatarUrl = buildAvatarUrl(employee);
                    const balanceMap = getBalanceMap(employee.balances);

                    return (
                      <tr
                        key={employee.id}
                        className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden text-xs font-medium text-white rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
                              <span>{getInitials(employee.name)}</span>
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={employee.name}
                                  className="absolute inset-0 object-cover w-full h-full"
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate dark:text-white">{employee.name}</p>
                              <p className="text-xs text-gray-500 truncate dark:text-slate-400">
                                {[employee.employeeId, employee.designation].filter(Boolean).join(' | ') || employee.email || 'Employee'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                          {employee.department || 'Unassigned Department'}
                        </td>
                        {LEAVE_TYPE_COLUMNS.map((column) => {
                          const balance = balanceMap.get(column.key);

                          return (
                            <React.Fragment key={`${employee.id}_${column.key}`}>
                              <td
                                className={cn(
                                  'px-3 py-3 text-center border-l border-gray-100 dark:border-slate-700',
                                  column.cellClass
                                )}
                              >
                                <span className="font-semibold text-slate-700 dark:text-slate-100">
                                  {formatBalanceValue(balance, 'total')}
                                </span>
                              </td>
                              <td className={cn('px-3 py-3 text-center', column.cellClass)}>
                                <span className="font-semibold text-amber-600 dark:text-amber-300">
                                  {formatBalanceValue(balance, 'used')}
                                </span>
                              </td>
                              <td className={cn('px-3 py-3 text-center', column.cellClass)}>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                                  {formatBalanceValue(balance, 'left')}
                                </span>
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasRowLimit && employees.length > maxRows ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((previous) => !previous)}
                  className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
                >
                  {showAll ? 'See Less' : `See More (${employees.length - maxRows})`}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaveBalanceSection;
