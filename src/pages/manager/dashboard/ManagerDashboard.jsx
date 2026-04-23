import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Users,
  XCircle,
} from 'lucide-react';

import BirthdayWelcomeBanner from '@/components/dashboard/BirthdayWelcomeBanner';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const getTodayParts = () => {
  const today = new Date();
  return {
    dayKey: String(today.getDate()),
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
};

const getEmployeeId = (employee) => employee?._id || employee?.id || '';

const getManagerKeys = (manager) =>
  [manager?._id, manager?.id, manager?.name, manager?.email, manager?.userName]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const filterTeamMembers = (employees, manager) => {
  if (!Array.isArray(employees) || employees.length === 0) {
    return [];
  }

  const managerKeys = getManagerKeys(manager);
  const managerDepartment = normalizeText(manager?.professional?.department);
  const managerTeam = normalizeText(manager?.professional?.teamName);

  const directReports = employees.filter((employee) => {
    const reportingManager = normalizeText(employee?.professional?.reportingManager);
    return reportingManager && managerKeys.includes(reportingManager);
  });

  if (directReports.length > 0) {
    return directReports;
  }

  const departmentMatches = employees.filter((employee) => {
    const employeeDepartment = normalizeText(employee?.professional?.department);
    const employeeTeam = normalizeText(employee?.professional?.teamName);

    if (managerTeam && employeeTeam === managerTeam) {
      return true;
    }

    if (managerDepartment && employeeDepartment === managerDepartment) {
      return true;
    }

    return false;
  });

  return departmentMatches.length > 0 ? departmentMatches : employees;
};

const formatDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return 'Date not available';
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  return `${from.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${to.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
};

const formatRelativeTime = (value) => {
  if (!value) {
    return 'Recently';
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return 'Recently';
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const getInitials = (name) =>
  String(name || 'Manager')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
    case 'late':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
  }
};

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    teamMembers: 0,
    pendingLeaves: 0,
    teamFiles: 0,
    presentToday: 0,
    absentToday: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!currentUser) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);

        const { year, month, dayKey } = getTodayParts();
        const [employeesResult, pendingLeavesResult, teamFilesResult, attendanceResult] =
          await Promise.allSettled([
            api.get('/admin/employee'),
            api.get('/leave/pending'),
            api.get('/team-files', {
              params: { page: 1, limit: 50 },
            }),
            api.get('/attendance-tracker/monthly', {
              params: { year, month },
            }),
          ]);

        const allEmployees =
          employeesResult.status === 'fulfilled' && Array.isArray(employeesResult.value.data)
            ? employeesResult.value.data
            : [];

        const teamMembers = filterTeamMembers(allEmployees, currentUser);
        const teamMemberIds = new Set(teamMembers.map((employee) => getEmployeeId(employee)).filter(Boolean));

        const pendingLeaves =
          pendingLeavesResult.status === 'fulfilled'
            ? (pendingLeavesResult.value.data?.leaves || []).filter((leave) => {
                const leaveUserId =
                  leave?.user?._id || leave?.user?.id || leave?.user || leave?.userId || '';

                return teamMemberIds.size === 0 || teamMemberIds.has(String(leaveUserId));
              })
            : [];

        const attendanceRows =
          attendanceResult.status === 'fulfilled' && Array.isArray(attendanceResult.value.data?.rows)
            ? attendanceResult.value.data.rows.filter(
                (row) => teamMemberIds.size === 0 || teamMemberIds.has(String(row.userId))
              )
            : [];

        const todayStatuses = attendanceRows.map((row) => row.days?.[dayKey] || '-');
        const presentToday = todayStatuses.filter((status) => status === 'P' || status === 'L').length;
        const approvedLeaveToday = todayStatuses.filter((status) => status === 'OL').length;
        const absentToday = Math.max(teamMembers.length - presentToday - approvedLeaveToday, 0);

        const files =
          teamFilesResult.status === 'fulfilled' && Array.isArray(teamFilesResult.value.data?.files)
            ? teamFilesResult.value.data.files
            : [];

        const pendingRequestItems = pendingLeaves.slice(0, 5).map((leave) => ({
          id: leave._id || leave.id,
          name: leave.user?.name || 'Employee',
          type: String(leave.type || 'leave').replace(/^\w/, (char) => char.toUpperCase()),
          date: formatDateRange(leave.fromDate, leave.toDate),
          status: leave.status || 'pending',
        }));

        const leaveActivities = pendingLeaves.slice(0, 3).map((leave) => ({
          id: `leave-${leave._id || leave.id}`,
          user: leave.user?.name || 'Employee',
          action: `submitted a ${leave.type || 'leave'} request`,
          role: 'Leave Request',
          time: formatRelativeTime(leave.createdAt),
          createdAt: new Date(leave.createdAt || Date.now()).getTime(),
        }));

        const fileActivities = files.slice(0, 3).map((file) => ({
          id: `file-${file._id || file.id}`,
          user: 'Team Files',
          action: `${file.name || file.fileName || 'File'} was uploaded`,
          role: 'File Upload',
          time: formatRelativeTime(file.createdAt),
          createdAt: new Date(file.createdAt || Date.now()).getTime(),
        }));

        const attendanceActivities = attendanceRows
          .filter((row) => {
            const status = row.days?.[dayKey];
            return status === 'P' || status === 'L' || status === 'OL' || status === 'A';
          })
          .slice(0, 3)
          .map((row) => {
            const status = row.days?.[dayKey];
            return {
              id: `attendance-${row.userId}`,
              user: row.name || 'Employee',
              action:
                status === 'OL'
                  ? 'is on approved leave today'
                  : status === 'A'
                    ? 'is absent today'
                  : status === 'L'
                    ? 'checked in late today'
                    : 'checked in today',
              role: 'Attendance',
              time: 'Today',
              createdAt: Date.now() - 1,
            };
          });

        const activityFeed = [...leaveActivities, ...fileActivities, ...attendanceActivities]
          .sort((left, right) => right.createdAt - left.createdAt)
          .slice(0, 6);

        if (!isMounted) {
          return;
        }

        setStats({
          teamMembers: teamMembers.length,
          pendingLeaves: pendingLeaves.length,
          teamFiles:
            teamFilesResult.status === 'fulfilled'
              ? Number(teamFilesResult.value.data?.stats?.totalFiles) || files.length
              : 0,
          presentToday,
          absentToday,
        });
        setPendingRequests(pendingRequestItems);
        setRecentActivities(activityFeed);
      } catch (error) {
        console.error('Error loading manager dashboard:', error);

        if (!isMounted) {
          return;
        }

        setStats({
          teamMembers: 0,
          pendingLeaves: 0,
          teamFiles: 0,
          presentToday: 0,
          absentToday: 0,
        });
        setPendingRequests([]);
        setRecentActivities([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const statCards = [
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      change: stats.teamMembers > 0 ? 'Active team' : 'No members',
      badgeClass: 'text-blue-700 dark:text-blue-300',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/20',
      bg: 'bg-white dark:bg-slate-900',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-300',
      link: '/manager/team',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Clock,
      change: stats.teamMembers > 0 ? `${Math.round((stats.presentToday / stats.teamMembers) * 100)}%` : '0%',
      badgeClass: 'text-green-700 dark:text-green-300',
      badgeBg: 'bg-green-100 dark:bg-green-500/20',
      bg: 'bg-white dark:bg-slate-900',
      iconBg: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-300',
      link: '/manager/team-attendance',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      change: `${stats.pendingLeaves} pending`,
      badgeClass: 'text-amber-700 dark:text-amber-300',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/20',
      bg: 'bg-white dark:bg-slate-900',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-300',
      link: '/manager/leave-requests',
    },
    {
      title: 'Team Files',
      value: stats.teamFiles,
      icon: FileText,
      change: 'Database files',
      badgeClass: 'text-violet-700 dark:text-violet-300',
      badgeBg: 'bg-violet-100 dark:bg-violet-500/20',
      bg: 'bg-white dark:bg-slate-900',
      iconBg: 'bg-violet-500',
      textColor: 'text-violet-600 dark:text-violet-300',
      link: '/manager/team-files',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: XCircle,
      change: stats.teamMembers > 0 ? `${Math.round((stats.absentToday / stats.teamMembers) * 100)}%` : '0%',
      badgeClass: 'text-red-700 dark:text-red-300',
      badgeBg: 'bg-red-100 dark:bg-red-500/20',
      bg: 'bg-white dark:bg-slate-900',
      iconBg: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-300',
      link: '/manager/team-attendance',
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            <p className="text-gray-600 dark:text-slate-300">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manager Dashboard - HRMS</title>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <div className="w-full px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <BirthdayWelcomeBanner
                user={currentUser}
                name={currentUser?.name?.split(' ')[0] || 'Manager'}
                fallbackName="Manager"
                normalDescription="Team attendance, leave requests, and shared files are now loaded from the database."
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 monitor:grid-cols-5">
              {statCards.map((stat, index) => (
                <Link
                  key={stat.title}
                  to={stat.link}
                  className={`${stat.bg} rounded-xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${stat.iconBg} p-2.5 rounded-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.badgeBg} ${stat.badgeClass}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-gray-600 dark:text-slate-300">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 monitor:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-slate-700">
                  <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                          {stats.pendingLeaves} requests awaiting review
                        </p>
                      </div>
                      <Link
                        to="/manager/leave-requests"
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        View all
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-5">
                    {pendingRequests.length > 0 ? (
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center flex-shrink-0 text-xs font-medium text-white rounded-full w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600">
                                {getInitials(request.name)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500 dark:text-slate-400">{request.type}</span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">|</span>
                                  <span className="text-xs text-gray-500 dark:text-slate-400">{request.date}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-green-100 rounded-full dark:bg-green-500/20">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">No pending leave requests found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-slate-700">
                  <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Latest updates from attendance, leave, and files</p>
                      </div>
                      <Link
                        to="/manager/team-attendance"
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        View team
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-5">
                    {recentActivities.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">No recent activity</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Activity will appear here once the team starts using the system.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center text-xs font-medium text-white rounded-full w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900">
                                {getInitials(activity.user)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.user}</p>
                                <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">{activity.time}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-600 dark:text-slate-300">{activity.action}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-slate-700 dark:text-slate-300">
                                  {activity.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-600 dark:text-slate-300">Team attendance status</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium text-green-700 rounded-full bg-green-50 dark:bg-green-500/20 dark:text-green-300">
                          {stats.presentToday}/{stats.teamMembers} Present
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default ManagerDashboard;
