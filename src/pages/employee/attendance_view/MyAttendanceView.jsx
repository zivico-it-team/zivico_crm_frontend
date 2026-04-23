import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Filter, Timer, Download, RefreshCw } from 'lucide-react';

// Components
import { AttendanceStats } from './components/AttendanceStats';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendanceList } from './components/AttendanceList';
import { BreakRecords } from './components/BreakRecords';

// Hooks
import { useAttendanceData } from './hooks/useAttendanceData';
import { useBreakData } from './hooks/useBreakData';

// Utils
import { VIEW_MODES } from './utils/attendanceConfig';

const MyAttendanceView = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.CALENDAR);

  // Hooks
  const {
    stats,
    todayStatus,
    calendarDays,
    isLoading: attendanceLoading,
    loadAttendanceData,
    deleteAttendanceRecord,
    getCurrentMonthRecords,
    exportToCSV
  } = useAttendanceData(currentUser, currentDate);

  const {
    deleteBreakRecord,
    getCurrentMonthBreaks
  } = useBreakData(currentUser, currentDate);

  // Export CSV
  const handleExport = () => {
    if (!currentUser) return;

    const csv = exportToCSV();
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${currentUser.name || 'user'}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAttendanceData();
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDeleteAttendance = async (recordId) => {
    if (!recordId) return;

    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      const deleted = await deleteAttendanceRecord(recordId);
      toast({
        title: deleted ? 'Deleted' : 'Delete failed',
        description: deleted
          ? 'Attendance record deleted successfully'
          : 'Unable to delete attendance record',
        variant: deleted ? 'default' : 'destructive',
      });
    }
  };

  const handleDeleteBreak = (breakId) => {
    if (window.confirm('Are you sure you want to delete this break record?')) {
      deleteBreakRecord(breakId);
    }
  };

  if (attendanceLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600 dark:text-slate-300">Loading attendance data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentMonthString = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const currentMonthRecords = getCurrentMonthRecords();
  const currentMonthBreaks = getCurrentMonthBreaks();

  const todayBadgeClass =
    todayStatus.status === 'present'
      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
      : todayStatus.status === 'late'
        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
        : todayStatus.status === 'leave'
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300';

  const todayLabel =
    todayStatus.status === 'present'
      ? 'Present'
      : todayStatus.status === 'late'
        ? 'Late Arrival'
        : todayStatus.status === 'leave'
          ? 'On Leave'
        : 'Absent';

  const formatTime = (value) => {
    if (!value) return '--:--';
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>My Attendance - HRMS</title>
      </Helmet>
      <MainLayout>
        <div className="space-y-6 text-gray-900 dark:text-slate-100">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Attendance Overview</h1>
              <p className="text-gray-500 dark:text-slate-400">{currentMonthString}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={viewMode === VIEW_MODES.CALENDAR ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(VIEW_MODES.CALENDAR)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === VIEW_MODES.LIST ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(VIEW_MODES.LIST)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Attendance
              </Button>
              <Button
                variant={viewMode === VIEW_MODES.BREAKS ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(VIEW_MODES.BREAKS)}
                className="flex items-center gap-2"
              >
                <Timer className="w-4 h-4" />
                Breaks ({currentMonthBreaks.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
                disabled={currentMonthRecords.length === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Today Status */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Today</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${todayBadgeClass}`}>
                    {todayLabel}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-slate-300">
                    Check In: {formatTime(todayStatus.checkInAt)} | Check Out: {formatTime(todayStatus.checkOutAt)}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                Worked: {todayStatus.totalWorkedHours || 0}h
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <AttendanceStats stats={stats} />

          {/* Main Content Area */}
          {viewMode === VIEW_MODES.CALENDAR ? (
            <AttendanceCalendar
              currentDate={currentDate}
              attendanceData={calendarDays}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
          ) : viewMode === VIEW_MODES.LIST ? (
            <AttendanceList
              records={currentMonthRecords}
              onDeleteRecord={handleDeleteAttendance}
              currentMonthString={currentMonthString}
            />
          ) : (
            <BreakRecords
              breaks={currentMonthBreaks}
              onDeleteBreak={handleDeleteBreak}
            />
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default MyAttendanceView;
