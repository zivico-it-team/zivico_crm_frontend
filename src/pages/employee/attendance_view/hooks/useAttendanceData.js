import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const DEFAULT_STATS = {
  present: 0,
  absent: 0,
  late: 0,
  totalHours: 0,
  avgHours: 0,
};

const DEFAULT_TODAY = {
  dateKey: null,
  status: 'absent',
  checkedIn: false,
  checkedOut: false,
  checkInAt: null,
  checkOutAt: null,
  totalWorkedSeconds: 0,
  totalWorkedHours: 0,
  isLate: false,
};

const toDateFromKey = (dateKey) => {
  if (!dateKey) return new Date();
  return new Date(`${dateKey}T00:00:00`);
};

const toDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeCalendarData = (calendarDays, recordMap) =>
  Object.values(calendarDays || {}).map((day) => {
    const record = recordMap.get(day.dateKey);
    const baseStatus = day.status || null;
    const isLate = !!(day.isLate || record?.isLate);
    const status = baseStatus === 'present' && isLate ? 'late' : baseStatus;

    return {
      id: record?._id || null,
      dateKey: day.dateKey,
      date: toDateFromKey(day.dateKey),
      status,
      check_in_time: record?.checkInAt || day.checkInAt || null,
      check_out_time: record?.checkOutAt || day.checkOutAt || null,
      working_hours: Number(record?.totalWorkedHours ?? day.totalWorkedHours ?? 0),
      totalWorkedSeconds: Number(record?.totalWorkedSeconds ?? day.totalWorkedSeconds ?? 0),
      isLate,
    };
  });

const normalizeMonthRecords = (records) =>
  records
    .map((record) => {
      const isLate = !!record?.isLate;
      const status = record?.status === 'present' && isLate ? 'late' : (record?.status || 'absent');

      return {
        id: record?._id || null,
        dateKey: record?.dateKey,
        date: toDateFromKey(record?.dateKey),
        status,
        check_in_time: record?.checkInAt || null,
        check_out_time: record?.checkOutAt || null,
        working_hours: Number(record?.totalWorkedHours || 0),
        totalWorkedSeconds: Number(record?.totalWorkedSeconds || 0),
        isLate,
      };
    })
    .sort((a, b) => b.date - a.date);

export const useAttendanceData = (currentUser, currentDate) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [todayStatus, setTodayStatus] = useState(DEFAULT_TODAY);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);

  const loadTodayAttendance = useCallback(async () => {
    const response = await api.get('/attendance/today');
    const data = response?.data || {};
    const resolvedStatus = data?.status || (data?.checkedIn ? (data?.isLate ? 'late' : 'present') : 'absent');

    setTodayStatus({
      dateKey: data?.dateKey || null,
      status: resolvedStatus,
      checkedIn: !!data?.checkedIn,
      checkedOut: !!data?.checkedOut,
      checkInAt: data?.checkInAt || null,
      checkOutAt: data?.checkOutAt || null,
      totalWorkedSeconds: Number(data?.totalWorkedSeconds || 0),
      totalWorkedHours: Number(data?.totalWorkedHours || 0),
      isLate: !!data?.isLate,
    });

    return data;
  }, []);

  const loadMonthSummary = useCallback(async (year, month) => {
    const response = await api.get('/attendance/month/summary', {
      params: { year, month },
    });

    const summary = response?.data || {};
    const present = Number(summary.present || 0);
    const totalHours = Number(summary.totalHours || 0);

    setStats({
      present,
      absent: Number(summary.absent || 0),
      late: Number(summary.lateArrivals || 0),
      totalHours,
      avgHours: present ? Number((totalHours / present).toFixed(1)) : 0,
    });

    return summary;
  }, []);

  const loadMonthRecords = useCallback(async (year, month) => {
    const response = await api.get('/attendance/month/records', {
      params: { year, month },
    });

    const records = Array.isArray(response?.data?.records) ? response.data.records : [];
    const normalizedRecords = normalizeMonthRecords(records);
    setAttendanceData(normalizedRecords);

    return {
      records,
      recordMap: new Map(records.map((record) => [record.dateKey, record])),
      normalizedRecords,
    };
  }, []);

  const loadMonthCalendar = useCallback(async (year, month, recordMap = new Map()) => {
    const response = await api.get('/attendance/month/calendar', {
      params: { year, month },
    });

    const normalized = normalizeCalendarData(response?.data?.days, recordMap)
      .sort((a, b) => a.date - b.date);

    setCalendarDays(normalized);
    return normalized;
  }, []);

  const loadAttendanceData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [, , recordsResult] = await Promise.all([
        loadTodayAttendance(),
        loadMonthSummary(year, month),
        loadMonthRecords(year, month),
      ]);

      const normalizedCalendar = await loadMonthCalendar(year, month, recordsResult.recordMap);
      const todayKey = toDateKey(new Date());
      const todayCalendar = normalizedCalendar.find((item) => item.dateKey === todayKey);

      if (todayCalendar?.status === 'leave') {
        setTodayStatus((prev) => {
          if (prev.checkedIn) return prev;
          return { ...prev, status: 'leave' };
        });
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setAttendanceData([]);
      setCalendarDays([]);
      setTodayStatus(DEFAULT_TODAY);
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentDate, loadMonthCalendar, loadMonthRecords, loadMonthSummary, loadTodayAttendance]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id) return;
    loadAttendanceData();
  }, [currentUser?.id, currentUser?._id, currentDate, loadAttendanceData]);

  const deleteAttendanceRecord = useCallback(async (recordId) => {
    if (!recordId) return false;

    try {
      await api.delete(`/attendance/${recordId}`);
      await loadAttendanceData();
      return true;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      return false;
    }
  }, [loadAttendanceData]);

  const getCurrentMonthRecords = useCallback(() => {
    return attendanceData.filter((record) => record.status !== 'off');
  }, [attendanceData]);

  return {
    attendanceData,
    calendarDays,
    todayStatus,
    stats,
    isLoading,
    loadAttendanceData,
    loadTodayAttendance,
    loadMonthSummary,
    loadMonthCalendar,
    loadMonthRecords,
    deleteAttendanceRecord,
    getCurrentMonthRecords,
  };
};
