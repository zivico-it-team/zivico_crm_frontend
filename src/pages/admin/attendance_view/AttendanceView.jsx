import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Coffee, Download, Info, Loader2, Search, Utensils } from 'lucide-react';
import * as XLSX from 'xlsx';

import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const pad2 = (value) => String(value).padStart(2, '0');

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const getStatusClass = (code) => {
  switch (code) {
    case 'P':
      return 'bg-green-100 text-green-700 font-bold';
    case 'A':
      return 'bg-red-100 text-red-700 font-bold';
    case 'L':
      return 'bg-yellow-100 text-yellow-700 font-bold';
    case 'OL':
      return 'bg-blue-100 text-blue-700 font-bold';
    case 'W':
      return 'bg-gray-100 text-gray-400';
    default:
      return '';
  }
};

const getStatusLabel = (code) => {
  switch (code) {
    case 'P':
      return 'Present';
    case 'A':
      return 'Absent';
    case 'L':
      return 'Late';
    case 'OL':
      return 'On Leave';
    case 'W':
      return 'Weekend';
    default:
      return 'No Record';
  }
};

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active Employees' },
  { value: 'inactive', label: 'Inactive Employees' },
  { value: 'all', label: 'All Employees' },
];

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (value) => {
  if (!value) {
    return '--:--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatExportDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-CA');
};

const formatExportDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds || 0);
  if (totalSeconds <= 0) {
    return '0m';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
};

const AttendanceView = () => {
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('active');
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  const statusFilter = searchParams.get('status') || 'all';
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const today = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();
  const todayDay = isCurrentMonth ? String(today.getDate()) : null;

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);

        const { data } = await api.get('/attendance-tracker/monthly', {
          params: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            search: searchTerm || undefined,
            employmentStatus: employmentStatusFilter,
          },
        });

        setAttendanceRows(Array.isArray(data?.rows) ? data.rows : []);
      } catch (error) {
        console.error('Error loading attendance tracker:', error);
        setAttendanceRows([]);
        toast({
          title: 'Attendance load failed',
          description: error.response?.data?.message || 'Unable to load attendance tracker data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [currentDate, employmentStatusFilter, searchTerm, toast]);

  const getStatus = (row, day) => row.days?.[String(day)] || '-';

  const matchesStatusFilter = (row) => {
    if (statusFilter === 'all' || !todayDay) {
      return true;
    }

    const status = row.days?.[todayDay] || '-';

    if (statusFilter === 'present') {
      return status === 'P' || status === 'L';
    }

    if (statusFilter === 'absent') {
      return status === 'A';
    }

    if (statusFilter === 'approved-leave') {
      return status === 'OL';
    }

    return true;
  };

  const filteredRows = attendanceRows.filter(matchesStatusFilter);

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleExport = async () => {
    if (filteredRows.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no attendance rows matching the current filters.',
      });
      return;
    }

    try {
      setExportLoading(true);

      const { data } = await api.get('/attendance-tracker/export', {
        params: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          search: searchTerm || undefined,
          employmentStatus: employmentStatusFilter,
        },
      });

      const exportRows = Array.isArray(data?.rows) ? data.rows : [];
      const exportDetails = Array.isArray(data?.detailRows) ? data.detailRows : [];
      const visibleUserIds = new Set(filteredRows.map((row) => row.userId));

      const summaryRows = exportRows
        .filter((row) => visibleUserIds.has(row.userId))
        .map((row) => {
          const summary = {
            Employee: row.name || 'Unknown',
            Email: row.email || '',
            Username: row.userName || '',
          };

          daysArray.forEach((day) => {
            summary[`Day ${day}`] = getStatusLabel(row.days?.[String(day)] || '-');
          });

          summary['Present Count'] = row.P || 0;
          summary['Absent Count'] = row.A || 0;
          summary['Monthly Excess Break'] = formatDuration(row.excessBreakSeconds);
          return summary;
        });

      const detailRows = exportDetails
        .filter((row) => visibleUserIds.has(row.userId))
        .map((row) => ({
          Employee: row.name || 'Unknown',
          Email: row.email || '',
          Username: row.userName || '',
          Date: formatExportDate(row.dateKey),
          Status: row.statusLabel || getStatusLabel(row.statusCode),
          'Worked Time': formatDuration(row.totalWorkedSeconds),
          'Excess Break': formatDuration(row.excessBreakSeconds),
          'Check In': formatExportDateTime(row.checkInAt),
          'Check Out': formatExportDateTime(row.checkOutAt),
          'Late Entry': row.isLate ? 'Yes' : 'No',
          'Tea Break Start': formatExportDateTime(row.teaBreakStart),
          'Tea Break End': formatExportDateTime(row.teaBreakEnd),
          'Tea Break Duration': formatDuration(row.teaBreakSeconds),
          'Tea Break Exceeded': formatDuration(row.teaBreakExceededSeconds),
          'Lunch Break Start': formatExportDateTime(row.lunchBreakStart),
          'Lunch Break End': formatExportDateTime(row.lunchBreakEnd),
          'Lunch Break Duration': formatDuration(row.lunchBreakSeconds),
          'Lunch Break Exceeded': formatDuration(row.lunchBreakExceededSeconds),
          'Leave Type': row.leaveType || '',
          'Leave Reason': row.leaveReason || '',
        }));

      const workbook = XLSX.utils.book_new();
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      summarySheet['!cols'] = [
        { wch: 24 },
        { wch: 28 },
        { wch: 18 },
        ...daysArray.map(() => ({ wch: 14 })),
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Monthly Summary');

      const detailSheet = XLSX.utils.json_to_sheet(detailRows);
      detailSheet['!cols'] = [
        { wch: 24 },
        { wch: 28 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 22 },
        { wch: 22 },
        { wch: 12 },
        { wch: 22 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 22 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 28 },
      ];
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Attendance Details');

      const fileName = `attendance_tracker_${currentDate.getFullYear()}_${pad2(
        currentDate.getMonth() + 1
      )}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      toast({
        title: 'Export ready',
        description: 'Attendance tracker Excel file has been downloaded.',
      });
    } catch (error) {
      console.error('Error exporting attendance tracker:', error);
      toast({
        title: 'Export failed',
        description: error.response?.data?.message || 'Unable to export attendance tracker.',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDayClick = async (member, day, status) => {
    if (status === '-' || status === 'W') {
      return;
    }

    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = toDateKey(targetDate);

    setSelectedDay({
      member,
      day,
      status,
      dateKey,
      details: null,
    });
    setDetailsLoading(true);

    try {
      const { data } = await api.get('/attendance-tracker/details', {
        params: {
          userId: member.userId,
          date: dateKey,
        },
      });

      setSelectedDay({
        member,
        day,
        status,
        dateKey,
        details: data,
      });
    } catch (error) {
      console.error('Error loading attendance details:', error);
      toast({
        title: 'Detail load failed',
        description: error.response?.data?.message || 'Unable to load attendance details.',
        variant: 'destructive',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Attendance Tracker - CRM</title>
      </Helmet>
      <MainLayout>
        <div className="px-2 mx-auto max-w-screen-2xl sm:px-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Attendance Tracker</h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Employee list with monthly attendance grid
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Showing {filteredRows.length} of {attendanceRows.length} employees
              </div>
            </div>

            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex flex-col items-start justify-between gap-3 p-3 border-b border-gray-100 sm:flex-row sm:items-center">
                <div className="flex items-center justify-between w-full gap-2 sm:w-auto sm:justify-start">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="w-8 h-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-sm font-semibold min-w-[130px] text-center">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="w-8 h-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-col w-full gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      placeholder="Search employees..."
                      className="text-sm pl-9 h-9"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <select
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 sm:w-48"
                    value={employmentStatusFilter}
                    onChange={(event) => setEmploymentStatusFilter(event.target.value)}
                  >
                    {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={handleExport}
                    disabled={loading || exportLoading || filteredRows.length === 0}
                  >
                    {exportLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export Excel
                  </Button>
                </div>
              </div>

              {statusFilter !== 'all' && todayDay && (
                <div className="px-3 py-2 text-xs border-b border-gray-100 bg-gray-50 text-gray-600">
                  Filter active for today ({formatDateLabel(today)}): {statusFilter}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 p-2 font-medium text-left text-gray-500 bg-white border-b border-r">
                        Employee
                      </th>
                      {daysArray.map((day) => (
                        <th key={day} className="p-1 font-normal text-center text-gray-400 border-b w-7">
                          {day}
                        </th>
                      ))}
                      <th className="w-10 p-2 font-medium text-center text-gray-500 border-b border-l">P</th>
                      <th className="w-10 p-2 font-medium text-center text-gray-500 border-b">A</th>
                      <th className="min-w-[96px] p-2 font-medium text-center text-gray-500 border-b">
                        Excess
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading &&
                      filteredRows.map((member) => (
                        <tr key={member.userId} className="hover:bg-gray-50">
                          <td className="sticky left-0 z-10 p-2 text-left bg-white border-r shadow-sm">
                            <div className="font-medium truncate max-w-[150px]" title={member.name}>
                              {member.name || 'Unknown'}
                            </div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[150px]" title={member.email}>
                              {member.userName || member.email || 'No email'}
                            </div>
                          </td>
                          {daysArray.map((day) => {
                            const status = getStatus(member, day);
                            const canOpenDetails = status !== '-' && status !== 'W';

                            return (
                              <td key={day} className="p-0 text-center align-middle border-b border-gray-100">
                                <div
                                  className={cn(
                                    'w-6 h-6 flex items-center justify-center rounded mx-auto text-[9px]',
                                    canOpenDetails ? 'cursor-pointer' : 'cursor-default',
                                    getStatusClass(status)
                                  )}
                                  onClick={() =>
                                    canOpenDetails ? handleDayClick(member, day, status) : undefined
                                  }
                                >
                                  {status === '-' ? '' : status}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-2 font-semibold text-center text-green-600 border-b border-l">
                            {member.P || 0}
                          </td>
                          <td className="p-2 font-semibold text-center text-red-600 border-b">
                            {member.A || 0}
                          </td>
                          <td className="p-2 font-semibold text-center text-rose-600 border-b">
                            {formatDuration(member.excessBreakSeconds)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {loading && (
                <div className="py-10 text-sm text-center text-gray-500">Loading attendance...</div>
              )}

              {!loading && filteredRows.length === 0 && (
                <div className="py-10 text-sm text-center text-gray-500">
                  No employees matched the current search or attendance filter.
                </div>
              )}

              <div className="flex flex-wrap gap-3 p-3 text-xs border-t bg-gray-50">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-green-100 rounded"></span> Present
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-yellow-100 rounded"></span> Late
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-red-100 rounded"></span> Absent
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-100 rounded"></span> On Leave
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-gray-100 rounded"></span> Weekend
                </div>
              </div>
            </div>
          </div>

          <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
            <DialogContent className="max-w-[90vw] rounded-lg p-4 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">
                  {getStatusLabel(selectedDay?.status)}
                </DialogTitle>
                <DialogDescription>
                  Employee attendance details for the selected day.
                </DialogDescription>
              </DialogHeader>

              {selectedDay && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm',
                        getStatusClass(selectedDay.status)
                      )}
                    >
                      {selectedDay.status}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedDay.member.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateLabel(
                          new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            selectedDay.day
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {detailsLoading ? (
                    <div className="py-6 text-sm text-center text-gray-500">Loading details...</div>
                  ) : (
                    <>
                      {!['A', 'OL'].includes(selectedDay.status) && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-gray-500">Check In</p>
                              <p className="text-base font-semibold">
                                {formatTime(selectedDay.details?.attendance?.checkInAt)}
                              </p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-gray-500">Check Out</p>
                              <p className="text-base font-semibold">
                                {formatTime(selectedDay.details?.attendance?.checkOutAt)}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Coffee className="w-4 h-4 text-amber-600" />
                              <p className="text-sm font-medium text-gray-700">Tea Break</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Start</p>
                                <p className="text-sm font-medium">
                                  {formatTime(selectedDay.details?.teaBreak?.start)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium">
                                  {formatTime(selectedDay.details?.teaBreak?.end)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium">
                                  {formatDuration(selectedDay.details?.teaBreak?.durationSeconds)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Exceeded</p>
                                <p className="text-sm font-medium text-rose-600">
                                  {formatDuration(selectedDay.details?.teaBreak?.exceededSeconds)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Utensils className="w-4 h-4 text-blue-600" />
                              <p className="text-sm font-medium text-gray-700">Lunch Break</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Start</p>
                                <p className="text-sm font-medium">
                                  {formatTime(selectedDay.details?.lunchBreak?.start)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium">
                                  {formatTime(selectedDay.details?.lunchBreak?.end)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium">
                                  {formatDuration(selectedDay.details?.lunchBreak?.durationSeconds)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Exceeded</p>
                                <p className="text-sm font-medium text-rose-600">
                                  {formatDuration(selectedDay.details?.lunchBreak?.exceededSeconds)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedDay.status === 'L' && (
                        <div className="flex items-start gap-2 p-3 text-sm text-yellow-800 rounded-lg bg-yellow-50">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>Late arrival recorded for this employee.</p>
                        </div>
                      )}

                      {selectedDay.status === 'A' && (
                        <div className="flex items-start gap-2 p-3 text-sm text-red-800 rounded-lg bg-red-50">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>Absent was recorded for this date.</p>
                        </div>
                      )}

                      {selectedDay.status === 'OL' && (
                        <div className="flex items-start gap-2 p-3 text-sm text-blue-800 rounded-lg bg-blue-50">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>
                            {selectedDay.details?.leave
                              ? `Approved leave${selectedDay.details.leave.leaveType ? `: ${selectedDay.details.leave.leaveType}` : ''}`
                              : 'Approved leave was recorded for this date.'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </>
  );
};

export default AttendanceView;
