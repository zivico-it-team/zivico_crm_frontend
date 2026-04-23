import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';

import BirthdayWelcomeBanner from '@/components/dashboard/BirthdayWelcomeBanner';
import EmployeeLeaveBalanceSection from '@/components/leave/EmployeeLeaveBalanceSection';
import MainLayout from '@/components/MainLayout';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';
import { useAuth } from '@/contexts/AuthContext';

const getStatusMeta = (statusCode) => {
  switch (statusCode) {
    case 'P':
      return {
        label: 'Present',
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        dotClass: 'bg-green-500',
      };
    case 'L':
      return {
        label: 'Late',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        dotClass: 'bg-amber-500',
      };
    case 'OL':
      return {
        label: 'On Leave',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        dotClass: 'bg-blue-500',
      };
    case 'A':
      return {
        label: 'Absent',
        badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: 'No Record',
        badgeClass: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
        dotClass: 'bg-gray-400',
      };
  }
};

const getStatusRank = (statusCode) => {
  switch (statusCode) {
    case 'P':
      return 0;
    case 'L':
      return 1;
    case 'OL':
      return 2;
    case 'A':
      return 3;
    default:
      return 4;
  }
};

const AdminDashboard = ({
  pageTitle = 'Admin Dashboard - CRM',
  welcomeLabel = 'Admin',
  welcomeDescription = "Today's attendance snapshot is ready.",
  routeBase = '/admin',
}) => {
  const DEFAULT_ATTENDANCE_ROWS = 5;
  const DEFAULT_LEAVE_BALANCE_ROWS = 6;
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    approvedLeavesToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [attendanceSnapshot, setAttendanceSnapshot] = useState([]);
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState([]);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const resolvedWelcomeName = currentUser?.name || welcomeLabel;
  const DASHBOARD_REFRESH_INTERVAL_MS = 60000;

  const quickActions = [
    {
      label: 'Add Employee',
      link: `${routeBase}/employees`,
      icon: UserPlus,
      iconBg: 'bg-blue-100 dark:bg-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-300',
      description: 'Create new employee account',
    },
    {
      label: 'Manage Leaves',
      link: `${routeBase}/leave`,
      icon: Calendar,
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      textColor: 'text-amber-600 dark:text-amber-300',
      description: 'Approve or reject leave requests',
    },
    {
      label: 'Attendance',
      link: `${routeBase}/attendance`,
      icon: Clock,
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      textColor: 'text-emerald-600 dark:text-emerald-300',
      description: 'Review monthly attendance tracker',
    },
    {
      label: 'Settings',
      link: '/admin/settings',
      icon: Settings,
      iconBg: 'bg-gray-100 dark:bg-slate-700',
      textColor: 'text-gray-700 dark:text-slate-300',
      description: 'Configure system settings',
    },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const dayKey = String(today.getDate());

      const [employeesResponse, leaveSummaryResponse, attendanceResponse, leaveBalanceResponse] = await Promise.all([
        api.get('/admin/employee', { timeout: 10000 }),
        api.get('/leaves-admin/summary', { timeout: 10000 }),
        api.get('/attendance-tracker/monthly', {
          params: { year, month },
          timeout: 10000,
        }),
        api.get('/leaves-admin/employee-balances', { timeout: 10000 }).catch(() => ({ data: { employees: [] } })),
      ]);

      const employees = Array.isArray(employeesResponse.data) ? employeesResponse.data : [];
      const leaveSummary = leaveSummaryResponse.data || {};
      const attendanceRows = Array.isArray(attendanceResponse.data?.rows)
        ? attendanceResponse.data.rows
        : [];
      const leaveBalanceRows = Array.isArray(leaveBalanceResponse.data?.employees)
        ? leaveBalanceResponse.data.employees
        : [];

      const employeesById = new Map(
        employees.map((employee) => [employee._id || employee.id, employee])
      );

      const snapshot = attendanceRows
        .map((row) => {
          const employee = employeesById.get(row.userId) || {};
          const statusCode = row.days?.[dayKey] || '-';

          return {
            id: row.userId,
            name: row.name || employee.name || 'Unknown Employee',
            email: row.email || employee.email || '',
            employeeId: employee.professional?.employeeId || '',
            designation: employee.professional?.designation || 'Employee',
            department: employee.professional?.department || 'Unassigned Department',
            avatarUrl: buildAvatarUrl(employee),
            statusCode,
          };
        })
        .sort((left, right) => {
          const rankDiff = getStatusRank(left.statusCode) - getStatusRank(right.statusCode);
          if (rankDiff !== 0) {
            return rankDiff;
          }

          return left.name.localeCompare(right.name);
        });

      setAttendanceSnapshot(snapshot);
      setShowAllAttendance(false);
      setEmployeeLeaveBalances(leaveBalanceRows);
      setStats({
        totalEmployees: employees.length,
        pendingLeaves: Number(leaveSummary.pending) || 0,
        presentToday: snapshot.filter((employee) => employee.statusCode === 'P' || employee.statusCode === 'L').length,
        approvedLeavesToday: snapshot.filter((employee) => employee.statusCode === 'OL').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAttendanceSnapshot([]);
      setEmployeeLeaveBalances([]);
      setShowAllAttendance(false);
      setStats({
        totalEmployees: 0,
        pendingLeaves: 0,
        presentToday: 0,
        approvedLeavesToday: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleWindowFocus = () => {
      fetchDashboardData();
    };

    const refreshTimer = window.setInterval(() => {
      fetchDashboardData();
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      iconBg: 'bg-blue-500 dark:bg-blue-600',
      textColor: 'text-blue-600 dark:text-blue-300',
      link: `${routeBase}/employees`,
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      iconBg: 'bg-amber-500 dark:bg-amber-600',
      textColor: 'text-amber-600 dark:text-amber-300',
      link: `${routeBase}/leave?status=pending`,
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircle,
      iconBg: 'bg-green-500 dark:bg-green-600',
      textColor: 'text-green-600 dark:text-green-300',
      link: `${routeBase}/attendance?status=present`,
    },
    {
      title: 'Approved Leave',
      value: stats.approvedLeavesToday,
      icon: Clock,
      iconBg: 'bg-sky-500 dark:bg-sky-600',
      textColor: 'text-sky-600 dark:text-sky-300',
      link: `${routeBase}/attendance?status=approved-leave`,
    }
  ];

  const getInitials = (name) =>
    String(name || 'User')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';
  const visibleAttendanceRows = showAllAttendance
    ? attendanceSnapshot
    : attendanceSnapshot.slice(0, DEFAULT_ATTENDANCE_ROWS);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen p-4 bg-gray-50 dark:bg-slate-950 sm:p-6 lg:p-8">
          <BirthdayWelcomeBanner
            user={currentUser}
            name={resolvedWelcomeName}
            fallbackName={welcomeLabel}
            normalDescription={welcomeDescription}
            className="mb-6"
          />

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 monitor:grid-cols-4">
            {statCards.map((stat) => (
              <Link
                key={stat.title}
                to={stat.link}
                className="p-5 transition-shadow bg-white border border-gray-100 cursor-pointer dark:bg-slate-900 rounded-xl dark:border-slate-700 hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.iconBg} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className={`w-4 h-4 ${stat.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className="mb-1 text-sm text-gray-600 dark:text-slate-300">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 monitor:grid-cols-[1.4fr_1fr]">
            <div className="h-full bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Attendance</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Live employee list with current attendance state</p>
                </div>
                <Link
                  to={`${routeBase}/attendance`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
                >
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5">
                {attendanceSnapshot.length === 0 ? (
                  <div className="py-10 text-sm text-center text-gray-500 dark:text-slate-400">
                    No employee attendance data available for today.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleAttendanceRows.map((employee) => {
                      const statusMeta = getStatusMeta(employee.statusCode);

                      return (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between gap-3 p-3 transition-colors border border-gray-100 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center min-w-0 gap-3">
                            <div className="relative flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden text-xs font-medium text-white rounded-full bg-gradient-to-br from-gray-700 to-gray-900">
                              <span>{getInitials(employee.name)}</span>
                              {employee.avatarUrl ? (
                                <img
                                  src={employee.avatarUrl}
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
                              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{employee.name}</p>
                              <p className="text-xs text-gray-500 truncate dark:text-slate-400">
                                {[employee.employeeId, employee.designation, employee.department]
                                  .filter(Boolean)
                                  .join(' | ')}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusMeta.badgeClass}`}>
                            <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`}></span>
                            {statusMeta.label}
                          </span>
                        </div>
                      );
                    })}
                    {attendanceSnapshot.length > DEFAULT_ATTENDANCE_ROWS && (
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllAttendance((previous) => !previous)}
                          className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          {showAllAttendance
                            ? 'See Less'
                            : `See More (${attendanceSnapshot.length - DEFAULT_ATTENDANCE_ROWS})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="h-full bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Frequently used tasks</p>
                </div>
                <Link
                  to={`${routeBase}/attendance`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-colors"
                >
                  Attendance
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      to={action.link}
                      className="p-4 transition-shadow bg-white border border-gray-100 rounded-lg dark:bg-slate-800 dark:border-slate-700 hover:shadow-md group"
                    >
                      <div className={`p-2 rounded-lg w-fit mb-3 ${action.iconBg} group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-5 h-5 ${action.textColor}`} />
                      </div>
                      <p className={`text-sm font-medium ${action.textColor}`}>{action.label}</p>
                      <p className="hidden mt-1 text-xs text-gray-500 dark:text-slate-400 sm:block">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <EmployeeLeaveBalanceSection
            employees={employeeLeaveBalances}
            routeBase={routeBase}
            maxRows={DEFAULT_LEAVE_BALANCE_ROWS}
            className="mt-6"
          />
        </div>
      </MainLayout>
    </>
  );
};

export default AdminDashboard;
