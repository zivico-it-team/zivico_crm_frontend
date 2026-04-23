import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CalendarDays, RefreshCcw, Search, Users } from 'lucide-react';

import MainLayout from '@/components/MainLayout';
import EmployeeLeaveBalanceSection from '@/components/leave/EmployeeLeaveBalanceSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const formatLeaveDays = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return '0';
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
};

const EmployeeLeaveBalanceView = ({
  pageTitle = 'Employee Leave Balance - CRM',
  routeBase = '/admin',
  heading = 'Employee Leave Balance',
  description = 'Review allocated, used, and remaining leave balances for each employee.',
}) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalances = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/leaves-admin/employee-balances', { timeout: 10000 });
      setEmployees(Array.isArray(data?.employees) ? data.employees : []);
    } catch (error) {
      console.error('Error loading employee leave balances:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredEmployees = useMemo(() => {
    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) => {
      const haystack = [
        employee.name,
        employee.email,
        employee.employeeId,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [employees, normalizedSearch]);

  const totals = useMemo(
    () =>
      filteredEmployees.reduce(
        (acc, employee) => ({
          employees: acc.employees + 1,
          allocated: acc.allocated + Number(employee.summary?.allocated || 0),
          used: acc.used + Number(employee.summary?.used || 0),
          remaining: acc.remaining + Number(employee.summary?.remaining || 0),
        }),
        { employees: 0, allocated: 0, used: 0, remaining: 0 }
      ),
    [filteredEmployees]
  );

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <MainLayout>
        <div className="mx-auto max-w-screen-2xl min-w-0 space-y-5 px-2 pb-6 pt-1 sm:px-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 shadow-sm">
            <div className="absolute -left-10 top-0 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl" />
            <div className="absolute -right-10 bottom-0 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white sm:text-xl">{heading}</h1>
                <p className="mt-1 text-sm text-slate-200">{description}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-9 border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                onClick={() => fetchBalances(true)}
                disabled={refreshing}
              >
                <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Employees</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">{totals.employees}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Users className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Allocated</p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">{formatLeaveDays(totals.allocated)}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Used</p>
                  <p className="mt-1 text-3xl font-semibold text-amber-600">{formatLeaveDays(totals.used)}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Remaining</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-600">{formatLeaveDays(totals.remaining)}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by employee, ID, department..."
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
              Loading employee leave balances...
            </div>
          ) : (
            <EmployeeLeaveBalanceSection
              employees={filteredEmployees}
              routeBase={routeBase}
              showManageLink={false}
              emptyMessage="No employee leave balances matched the current search."
            />
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default EmployeeLeaveBalanceView;
