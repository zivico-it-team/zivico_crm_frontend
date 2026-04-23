import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import BirthdayConfettiPopper from '@/components/dashboard/BirthdayConfettiPopper';
import BirthdayWelcomeBanner from '@/components/dashboard/BirthdayWelcomeBanner';
import { isBirthdayToday } from '@/components/dashboard/BirthdayWelcomeBanner';
import MainLayout from '@/components/MainLayout';
import CheckInOutComponent from '@/components/CheckInOutComponent';
import QuickActivityActions from '@/components/ui/QuickActivityActions';
import { useAuth } from '@/contexts/AuthContext';
import api from '../../../lib/api';
import { useToast } from '@/components/ui/use-toast';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getLeaveRemaining = (balance = {}) =>
  Math.max(
    0,
    toNumber(
      balance?.left ?? balance?.remaining ?? balance?.available ?? balance?.balance,
      0
    )
  );

const getLeaveUsed = (balance = {}, total, remaining) => {
  const explicitUsed = balance?.used ?? balance?.usedDays ?? balance?.taken ?? balance?.spent;
  if (explicitUsed !== undefined) {
    return Math.max(0, toNumber(explicitUsed, 0));
  }

  return Math.max(0, total - remaining);
};

const normalizeDashboardBalance = (balance = {}) => {
  const total = Math.max(0, toNumber(balance?.total, 0));
  const remaining = getLeaveRemaining(balance);
  const used = getLeaveUsed(balance, total, remaining);

  return {
    ...balance,
    total,
    used,
    left: remaining,
    remaining,
  };
};

const EmployeeDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState({
    checkIn: false,
    checkOut: false,
    stats: false,
    attendance: false
  });
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    daysUsed: 0,
    filesUploaded: 0,
    attendanceRate: 0,
    leaveBalances: []
  });

  const [currentAttendance, setCurrentAttendance] = useState({
    lastCheckIn: null,
    lastCheckOut: null,
    isCheckedIn: false,
    canCheckIn: false,
    canCheckOut: false,
    attendanceId: null,
    isLate: false,
    totalWorkedSeconds: 0,
    totalWorkedHours: 0
  });
  const [birthdayConfettiBurst, setBirthdayConfettiBurst] = useState(0);

  const triggerBirthdayConfetti = useCallback(() => {
    if (!isBirthdayToday(currentUser?.dob)) return;
    setBirthdayConfettiBurst((previous) => previous + 1);
  }, [currentUser?.dob]);

  // Fetch leave summary from /api/leave/summary
  const fetchLeaveSummary = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.get('/leave/summary');
      console.log('Leave summary response:', response.data);
      
      if (response.data) {
        const { cards, balances } = response.data;
        setStats(prev => ({
          ...prev,
          totalLeaves: cards?.totalApplications || 0,
          pendingLeaves: cards?.pending || 0,
          approvedLeaves: cards?.approved || 0,
          daysUsed: cards?.daysUsed || 0,
          leaveBalances: Array.isArray(balances)
            ? balances.map(normalizeDashboardBalance)
            : []
        }));
      }
    } catch (error) {
      console.error('Error fetching leave summary:', error);
    }
  }, [currentUser]);

  // Fetch files count from /api/files/my/count
  const fetchFilesCount = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.get('/files/my/count');
      console.log('Files count response:', response.data);
      
      // The API returns { count } directly
      const count = response.data?.count || 0;
      setStats(prev => ({
        ...prev,
        filesUploaded: count
      }));
    } catch (error) {
      console.error('Error fetching files count:', error);
    }
  }, [currentUser]);

  // Fetch today's attendance from /api/attendance/today
  const fetchTodayAttendance = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(prev => ({ ...prev, attendance: true }));
    try {
      const response = await api.get('/attendance/today');
      console.log('Today attendance response:', response.data);
      
      // The API returns { success, dateKey, checkedIn, checkedOut, checkInAt, checkOutAt, totalWorkedSeconds, totalWorkedHours, isLate }
      const data = response.data;
      
      const hasCheckedIn = data.checkedIn;
      const hasCheckedOut = data.checkedOut;
      
      setCurrentAttendance({
        lastCheckIn: data.checkInAt || null,
        lastCheckOut: data.checkOutAt || null,
        isCheckedIn: hasCheckedIn && !hasCheckedOut,
        canCheckIn: !hasCheckedIn,
        canCheckOut: hasCheckedIn && !hasCheckedOut,
        attendanceId: null, // API doesn't return ID, but we don't need it for check-out
        isLate: data.isLate || false,
        totalWorkedSeconds: data.totalWorkedSeconds || 0,
        totalWorkedHours: data.totalWorkedHours || 0
      });

      // Calculate attendance rate based on monthly data (will be updated by fetchAttendanceRate)
      
    } catch {
      console.log('No attendance record for today or endpoint not available');
      // If endpoint fails, assume user can check in
      setCurrentAttendance({
        lastCheckIn: null,
        lastCheckOut: null,
        isCheckedIn: false,
        canCheckIn: true,
        canCheckOut: false,
        attendanceId: null,
        isLate: false,
        totalWorkedSeconds: 0,
        totalWorkedHours: 0
      });
    } finally {
      setIsLoading(prev => ({ ...prev, attendance: false }));
    }
  }, [currentUser]);

  // Fetch monthly attendance summary for rate calculation from /api/attendance/month/summary
  const fetchAttendanceRate = useCallback(async () => {
    if (!currentUser) return;

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed

      const response = await api.get(`/attendance/month/summary?year=${year}&month=${month}`);
      console.log('Monthly attendance summary:', response.data);
      
      if (response.data.success) {
        const data = response.data;
        // Calculate attendance rate: (present / workingDays) * 100
        const workingDays = data.workingDays || 1; // Avoid division by zero
        const present = data.present || 0;
        const rate = Math.round((present / workingDays) * 100);
        
        setStats(prev => ({
          ...prev,
          attendanceRate: rate
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance rate:', error);
      // Set default rate
      setStats(prev => ({
        ...prev,
        attendanceRate: 0
      }));
    }
  }, [currentUser]);

  // Handle Check In
  const handleCheckIn = async () => {
    if (!currentAttendance.canCheckIn || isLoading.checkIn) return;

    setIsLoading(prev => ({ ...prev, checkIn: true }));
    try {
      // Backend expects no body - it uses the authenticated user
      console.log('Checking in...');
      
      const response = await api.post('/attendance/check-in');

      console.log('Check-in response:', response.data);

      if (response.status === 201 || response.status === 200) {
        const checkInAt = response.data.record?.checkInAt || new Date().toISOString();
        
        setCurrentAttendance({
          lastCheckIn: checkInAt,
          lastCheckOut: null,
          isCheckedIn: true,
          canCheckIn: false,
          canCheckOut: true,
          attendanceId: null,
          isLate: response.data.record?.isLate || false,
          totalWorkedSeconds: 0,
          totalWorkedHours: 0
        });

        toast({
          title: "Success",
          description: "Checked in successfully",
        });

        triggerBirthdayConfetti();

        // Refresh attendance data
        fetchTodayAttendance();
        fetchAttendanceRate();
      }
    } catch (error) {
      console.error('Error checking in:', error);
      
      let errorMessage = "Failed to check in";
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
        
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('Already checked in')) {
            errorMessage = 'You have already checked in today';
          }
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, checkIn: false }));
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    if (!currentAttendance.canCheckOut || isLoading.checkOut) return;

    setIsLoading(prev => ({ ...prev, checkOut: true }));
    try {
      // Backend expects no body - it uses the authenticated user
      console.log('Checking out...');
      
      const response = await api.post('/attendance/check-out');

      console.log('Check-out response:', response.data);

      if (response.status === 200) {
        const checkOutAt = response.data.record?.checkOutAt || new Date().toISOString();
        
        setCurrentAttendance(prev => ({
          ...prev,
          lastCheckOut: checkOutAt,
          isCheckedIn: false,
          canCheckIn: false,
          canCheckOut: false,
          totalWorkedSeconds: response.data.record?.totalWorkedSeconds || 0,
          totalWorkedHours: response.data.totalWorkedHours || 0
        }));

        toast({
          title: "Success",
          description: `Checked out successfully. Worked: ${response.data.totalWorkedHours || 0} hours`,
        });

        triggerBirthdayConfetti();

        // Refresh attendance data
        fetchTodayAttendance();
        fetchAttendanceRate();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      
      let errorMessage = "Failed to check out";
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
        
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('check in first')) {
            errorMessage = 'You must check in first';
          } else if (error.response.data?.message?.includes('Already checked out')) {
            errorMessage = 'You have already checked out today';
          }
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, checkOut: false }));
    }
  };

  // Load all data on component mount
  useEffect(() => {
    if (currentUser) {
      setIsLoading(prev => ({ ...prev, stats: true }));
      Promise.all([
        fetchLeaveSummary(),
        fetchFilesCount(),
        fetchTodayAttendance(),
        fetchAttendanceRate()
      ]).finally(() => {
        setIsLoading(prev => ({ ...prev, stats: false }));
      });
    }
  }, [currentUser, fetchLeaveSummary, fetchFilesCount, fetchTodayAttendance, fetchAttendanceRate]);

  // const statCards = [
  //   {
  //     title: 'Total Leave Applications',
  //     value: stats.totalLeaves,
  //     icon: Calendar,
  //     color: 'text-blue-600',
  //     bgColor: 'bg-blue-50'
  //   },
  //   {
  //     title: 'Pending Leaves',
  //     value: stats.pendingLeaves,
  //     icon: Clock,
  //     color: 'text-yellow-600',
  //     bgColor: 'bg-yellow-50'
  //   },
  //   {
  //     title: 'Files Uploaded',
  //     value: stats.filesUploaded,
  //     icon: FileText,
  //     color: 'text-purple-600',
  //     bgColor: 'bg-purple-50'
  //   },
  //   {
  //     title: 'Attendance Rate',
  //     value: `${stats.attendanceRate}%`,
  //     icon: CheckCircle,
  //     color: 'text-green-600',
  //     bgColor: 'bg-green-50'
  //   }
  // ];

  return (
    <>
      <Helmet>
        <title>Employee Dashboard - HRMS</title>
      </Helmet>
      <BirthdayConfettiPopper
        active={isBirthdayToday(currentUser?.dob)}
        burstId={birthdayConfettiBurst}
      />
      <MainLayout>
        <div className="space-y-6 dark:text-slate-100">
          <BirthdayWelcomeBanner
            user={currentUser}
            name={currentUser?.name}
            fallbackName="Employee"
            normalTitle={`Welcome, ${currentUser?.name || 'Employee'}`}
            normalDescription="Here's your overview for today"
            showDate={false}
            className="mb-6"
          />

          {/* Attendance Section */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-slate-700">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Attendance</h2>
            {/* {currentAttendance.isLate && currentAttendance.isCheckedIn && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700">
                ⚠️ You checked in late today
              </div>
            )}
            {currentAttendance.totalWorkedHours > 0 && !currentAttendance.isCheckedIn && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✅ Today's worked hours: {currentAttendance.totalWorkedHours} hours
              </div>
            )} */}
            <CheckInOutComponent
              isCheckedIn={currentAttendance.isCheckedIn}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              canCheckIn={currentAttendance.canCheckIn && !isLoading.checkIn}
              canCheckOut={currentAttendance.canCheckOut && !isLoading.checkOut}
              lastCheckIn={currentAttendance.lastCheckIn}
              lastCheckOut={currentAttendance.lastCheckOut}
              isLoading={isLoading.checkIn || isLoading.checkOut}
              className="mt-4"
            />
          </div>

          {/* Quick Activities */}
          <QuickActivityActions 
            isUserCheckedIn={currentAttendance.isCheckedIn}
            onBirthdayActionCelebration={triggerBirthdayConfetti}
          />

          {/* Leave Balances Section (Optional) */}
          {stats.leaveBalances.length > 0 && (
            <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-white dark:bg-slate-900" />
              {/* Main Container */}
              <div className="relative p-8 ">
                {/* Header Section with Stats */}
                <div className="flex flex-col gap-6 mb-10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent dark:bg-none dark:text-white">
                          Leave Balance
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
                          Track your leave usage and remaining days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Leave Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.leaveBalances.map((balance, index) => {
                    const total = Math.max(0, toNumber(balance.total, 0));
                    const remaining = getLeaveRemaining(balance);
                    const used = getLeaveUsed(balance, total, remaining);
                    const usagePercentage = total > 0 ? (used / total) * 100 : 0;
                    const remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;
                    
                    const config = {
                      annual: {
                        name: 'Annual Leave',
                        icon: (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ),
                        gradient: 'from-emerald-500 to-green-600',
                        light: 'bg-emerald-50 dark:bg-emerald-500/20',
                        medium: 'bg-emerald-100 dark:bg-emerald-500/20',
                        text: 'text-emerald-600 dark:text-emerald-300',
                        border: 'border-emerald-200 dark:border-emerald-500/40',
                        shadow: 'shadow-emerald-100',
                        progress: 'bg-emerald-500',
                        dark: 'text-emerald-700 dark:text-emerald-300'
                      },
                      casual: {
                        name: 'Casual Leave',
                        icon: (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        gradient: 'from-blue-500 to-cyan-600',
                        light: 'bg-blue-50 dark:bg-blue-500/20',
                        medium: 'bg-blue-100 dark:bg-blue-500/20',
                        text: 'text-blue-600 dark:text-blue-300',
                        border: 'border-blue-200 dark:border-blue-500/40',
                        shadow: 'shadow-blue-100',
                        progress: 'bg-blue-500',
                        dark: 'text-blue-700 dark:text-blue-300'
                      },
                      medical: {
                        name: 'Special Leave',
                        icon: (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        ),
                        gradient: 'from-purple-500 to-pink-600',
                        light: 'bg-purple-50 dark:bg-purple-500/20',
                        medium: 'bg-purple-100 dark:bg-purple-500/20',
                        text: 'text-purple-600 dark:text-purple-300',
                        border: 'border-purple-200 dark:border-purple-500/40',
                        shadow: 'shadow-purple-100',
                        progress: 'bg-purple-500',
                        dark: 'text-purple-700 dark:text-purple-300'
                      },
                      unpaid: {
                        name: 'Unpaid Leave',
                        icon: (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        gradient: 'from-gray-500 to-gray-600',
                        light: 'bg-gray-50 dark:bg-slate-700',
                        medium: 'bg-gray-100 dark:bg-slate-700',
                        text: 'text-gray-600 dark:text-slate-300',
                        border: 'border-gray-200 dark:border-slate-600',
                        shadow: 'shadow-gray-100',
                        progress: 'bg-gray-500',
                        dark: 'text-gray-700 dark:text-slate-300'
                      }
                    }[balance.type] || {
                      name: `${balance.type} Leave`,
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ),
                      gradient: 'from-indigo-500 to-blue-600',
                      light: 'bg-indigo-50 dark:bg-indigo-500/20',
                      medium: 'bg-indigo-100 dark:bg-indigo-500/20',
                      text: 'text-indigo-600 dark:text-indigo-300',
                      border: 'border-indigo-200 dark:border-indigo-500/40',
                      shadow: 'shadow-indigo-100',
                      progress: 'bg-indigo-500',
                      dark: 'text-indigo-700 dark:text-indigo-300'
                    };

                    return (
                      <div
                        key={balance.type}
                        className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Animated Gradient Border */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '2px', borderRadius: 'inherit', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)' }} />
                        
                        {/* Card Content */}
                        <div className="relative p-6 bg-white rounded-2xl h-full dark:bg-slate-800">
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full transform translate-x-16 -translate-y-16 dark:from-slate-700" />
                          
                          {/* Header with Icon and Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 ${config.light} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                              <div className={config.text}>
                                {config.icon}
                              </div>
                            </div>
                            
                            {/* Usage Badge */}
                            <div className={`px-3 py-1 ${config.medium} rounded-full`}>
                              <span className={`text-xs font-semibold ${config.dark}`}>
                                {used} used
                              </span>
                            </div>
                          </div>

                          {/* Leave Type and Numbers */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900 dark:text-white dark:group-hover:text-white">
                              {config.name}
                            </h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-gray-900 dark:text-white">{remaining}</span>
                              <span className="text-sm text-gray-500 dark:text-slate-300">/ {total}</span>
                              <span className="ml-2 text-xs text-gray-400 dark:text-slate-400">days left</span>
                            </div>
                          </div>

                          {/* Dual Progress Bars */}
                          <div className="space-y-3">
                            {/* Used Progress */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 dark:text-slate-400">Used</span>
                                <span className="font-medium text-gray-700 dark:text-slate-300">{usagePercentage.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-700">
                                <div
                                  className={`h-full ${config.progress} rounded-full transition-all duration-1000 ease-out group-hover:scale-x-105`}
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Remaining Progress */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 dark:text-slate-400">Remaining</span>
                                <span className="font-medium text-gray-700 dark:text-slate-300">{remainingPercentage.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-700">
                                <div
                                  className={`h-full ${config.progress} opacity-50 rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${remainingPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Footer Stats */}
                          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div>
                              <p className="text-xs text-gray-500 mb-1 dark:text-slate-400">Available</p>
                              <p className={`text-lg font-bold ${config.dark}`}>{remaining} days</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1 dark:text-slate-400">Taken</p>
                              <p className="text-lg font-bold text-gray-700 dark:text-slate-300">{used} days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default EmployeeDashboard;
