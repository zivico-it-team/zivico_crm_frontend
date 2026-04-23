import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Coffee, Info, Search, Utensils } from 'lucide-react';

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

const TeamAttendanceView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceScope, setAttendanceScope] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { toast } = useToast();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/attendance-tracker/monthly', {
          params: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            search: searchTerm || undefined,
          },
        });
        setAttendanceRows(Array.isArray(data?.rows) ? data.rows : []);
        setAttendanceScope(data?.scope || null);
      } catch (error) {
        console.error('Error loading team attendance:', error);
        setAttendanceRows([]);
        setAttendanceScope(null);
        toast({
          title: 'Attendance load failed',
          description: error.response?.data?.message || 'Unable to load team attendance data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [currentDate, searchTerm, toast]);

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
        <title>Team Attendance - CRM</title>
      </Helmet>
      <MainLayout>
        <div className="px-2 mx-auto max-w-screen-2xl sm:px-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Team Attendance</h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Department attendance records only
                  {attendanceScope?.label ? ` - ${attendanceScope.label}` : ''}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Showing {attendanceRows.length} employees
              </div>
            </div>

            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex flex-col items-start justify-between gap-3 p-3 border-b border-gray-100 sm:flex-row sm:items-center">
                <div className="flex items-center justify-between w-full gap-2 sm:w-auto sm:justify-start">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="w-8 h-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-sm font-semibold min-w-[130px] text-center">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="w-8 h-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search employees..."
                    className="text-sm pl-9 h-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

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
                      attendanceRows.map((member) => (
                        <tr key={member.userId} className="hover:bg-gray-50">
                          <td className="sticky left-0 z-10 p-2 text-left bg-white border-r shadow-sm">
                            <div className="font-medium truncate max-w-[150px]">{member.name || 'Unknown'}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[150px]">
                              {member.userName || member.email || 'No email'}
                            </div>
                          </td>
                          {daysArray.map((day) => {
                            const status = member.days?.[String(day)] || '-';
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
                          <td className="p-2 font-semibold text-center text-green-600 border-b border-l">{member.P || 0}</td>
                          <td className="p-2 font-semibold text-center text-red-600 border-b">{member.A || 0}</td>
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

              {!loading && attendanceRows.length === 0 && (
                <div className="py-10 text-sm text-center text-gray-500">
                  No attendance records found for your department.
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
                  Database attendance details for the selected day.
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
                          new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day)
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
                                <p className="text-sm font-medium">{formatTime(selectedDay.details?.teaBreak?.start)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium">{formatTime(selectedDay.details?.teaBreak?.end)}</p>
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
                                <p className="text-sm font-medium">{formatTime(selectedDay.details?.lunchBreak?.start)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium">{formatTime(selectedDay.details?.lunchBreak?.end)}</p>
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

export default TeamAttendanceView;
