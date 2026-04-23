import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Coffee,
  Download,
  Eye,
  Filter,
  Info,
  Loader2,
  RefreshCcw,
  Search,
  Table2,
  Utensils,
  UserCheck,
  UserRoundX,
  Users,
  Clock3,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const pad2 = (v) => String(v).padStart(2, '0');
const toDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const getTodayDateKey = () => toDateKey(new Date());

const parseDateInput = (v) => {
  if (!v || typeof v !== 'string') return null;
  const [year, month, day] = v.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatTime = (value) => {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFirstName = (name) => {
  const text = String(name || '').trim();
  if (!text) {
    return 'Unknown';
  }

  return text.split(/\s+/)[0];
};

const formatDate = (dateKey) => {
  const date = parseDateInput(dateKey);
  if (!date || Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDuration = (seconds) => {
  const total = Number(seconds || 0);
  if (total <= 0) return '0m';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const formatClockDuration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

const toTimestampMs = (value) => {
  if (!value) {
    return null;
  }

  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

const getComputedWorkingSeconds = (row, nowMs = Date.now()) => {
  if (!row) {
    return 0;
  }

  const apiWorkedSeconds = Number(row.totalWorkedSeconds || 0);
  if (apiWorkedSeconds > 0) {
    return apiWorkedSeconds;
  }

  if (['A', 'OL', 'W', '-'].includes(row.statusCode)) {
    return 0;
  }

  const checkInMs = toTimestampMs(row.checkInAt);
  if (!checkInMs) {
    return 0;
  }

  let checkOutMs = toTimestampMs(row.checkOutAt);
  if (!checkOutMs) {
    checkOutMs = row.dateKey === getTodayDateKey() ? nowMs : checkInMs;
  }

  const grossSeconds = Math.max(0, Math.floor((checkOutMs - checkInMs) / 1000));
  const breakSeconds = Number(row.teaBreakSeconds || 0) + Number(row.lunchBreakSeconds || 0);
  return Math.max(0, grossSeconds - breakSeconds);
};

const resolveLiveDurationSeconds = (startValue, baseSeconds, isActive, nowMs) => {
  const base = Number(baseSeconds || 0);
  if (!isActive || !startValue) {
    return base;
  }

  const startMs = new Date(startValue).getTime();
  if (Number.isNaN(startMs)) {
    return base;
  }

  const live = Math.floor((nowMs - startMs) / 1000);
  return Math.max(base, live, 0);
};

const formatHoursDecimal = (seconds) => (Number(seconds || 0) / 3600).toFixed(2);
const monthKeyFromDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
const getCurrentMonthKey = () => monthKeyFromDate(new Date());

const getMonthBounds = (monthKey) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ''));
  if (!match) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return { year, month, key: `${year}-${pad2(month)}`, start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  return { year, month, key: `${year}-${pad2(month)}`, start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
};

const getWeekBounds = (base) => {
  const date = new Date(base);
  date.setHours(0, 0, 0, 0);
  const diffToMonday = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const listMonthsInRange = (startDate, endDate) => {
  const months = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const limit = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (cursor <= limit) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};

const STATUS_META = {
  P: { label: 'Present', filter: 'present', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  A: { label: 'Absent', filter: 'absent', className: 'bg-rose-100 text-rose-700 border border-rose-200' },
  L: { label: 'Late', filter: 'late', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  OL: { label: 'On Leave', filter: 'on-leave', className: 'bg-sky-100 text-sky-700 border border-sky-200' },
  W: { label: 'Weekend', filter: 'weekend', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  default: { label: 'No Record', filter: 'no-record', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const getStatusMeta = (code) => STATUS_META[code] || STATUS_META.default;
const countStatusDays = (days = {}, code) => Object.values(days).filter((s) => s === code).length;
const getPeriodLabel = (period) => {
  if (period === 'today') return 'Today';
  if (period === 'this-week') return 'This Week';
  if (period === 'this-month') return 'This Month';
  if (period === 'custom') return 'Custom Range';
  return 'Unknown';
};
const getCalendarStatusClass = (statusCode) => {
  if (statusCode === 'P') return 'bg-emerald-100 text-emerald-700';
  if (statusCode === 'L') return 'bg-amber-100 text-amber-700';
  if (statusCode === 'A') return 'bg-rose-100 text-rose-700';
  if (statusCode === 'OL') return 'bg-sky-100 text-sky-700';
  if (statusCode === 'W') return 'bg-slate-100 text-slate-500';
  return 'bg-white text-slate-300';
};

const getCalendarDialogStatusClass = (statusCode) => {
  if (statusCode === 'P') return 'bg-emerald-100 text-emerald-700';
  if (statusCode === 'L') return 'bg-amber-100 text-amber-700';
  if (statusCode === 'A') return 'bg-rose-100 text-rose-700';
  if (statusCode === 'OL') return 'bg-sky-100 text-sky-700';
  if (statusCode === 'W') return 'bg-slate-100 text-slate-500';
  return 'bg-slate-100 text-slate-500';
};

const CALENDAR_EMPLOYEE_COLUMN_WIDTH = 190;
const CALENDAR_DAY_COLUMN_WIDTH = 34;
const CALENDAR_SUMMARY_COLUMN_WIDTH = 40;

const HRAttendanceView = () => {
  const [reviewMonth, setReviewMonth] = useState(getCurrentMonthKey);
  const [customStartDate, setCustomStartDate] = useState(getTodayDateKey);
  const [customEndDate, setCustomEndDate] = useState(getTodayDateKey);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [attendanceViewMode, setAttendanceViewMode] = useState('table');
  const [filterReportPanelOpen, setFilterReportPanelOpen] = useState(true);

  const [reportPeriod, setReportPeriod] = useState('this-month');
  const [reportCustomStart, setReportCustomStart] = useState('');
  const [reportCustomEnd, setReportCustomEnd] = useState('');

  const [employees, setEmployees] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [detailRows, setDetailRows] = useState([]);

  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedBreakRecord, setSelectedBreakRecord] = useState(null);
  const [selectedBreakDetails, setSelectedBreakDetails] = useState(null);
  const [breakDetailsLoading, setBreakDetailsLoading] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [calendarDayDetailsLoading, setCalendarDayDetailsLoading] = useState(false);
  const [liveNowMs, setLiveNowMs] = useState(Date.now());

  const [refreshToken, setRefreshToken] = useState(0);
  const cacheRef = useRef(new Map());
  const { toast } = useToast();

  const selectedMonth = useMemo(() => getMonthBounds(reviewMonth), [reviewMonth]);
  const reviewMonthLabel = useMemo(
    () => selectedMonth.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [selectedMonth.start]
  );

  const isCustomRangeValid = useMemo(() => {
    if (!customStartDate || !customEndDate) return false;
    const start = parseDateInput(customStartDate);
    const end = parseDateInput(customEndDate);
    return Boolean(start && end && start <= end);
  }, [customEndDate, customStartDate]);

  const activeRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterPeriod === 'today') {
      return { start: today, end: today, type: 'today' };
    }

    if (filterPeriod === 'this-week') {
      const week = getWeekBounds(today);
      return { start: week.start, end: week.end, type: 'this-week' };
    }

    if (filterPeriod === 'this-month') {
      return { start: selectedMonth.start, end: selectedMonth.end, type: 'month' };
    }

    if (filterPeriod === 'custom' && isCustomRangeValid) {
      return { start: parseDateInput(customStartDate), end: parseDateInput(customEndDate), type: 'custom' };
    }

    return { start: today, end: today, type: 'today' };
  }, [customEndDate, customStartDate, filterPeriod, isCustomRangeValid, selectedMonth.end, selectedMonth.start]);

  const activeRangeKey = useMemo(() => `${toDateKey(activeRange.start)}_${toDateKey(activeRange.end)}`, [activeRange.end, activeRange.start]);

  const fetchMonthExport = useCallback(async (year, month) => {
    const key = `${year}-${pad2(month)}`;
    if (cacheRef.current.has(key)) return cacheRef.current.get(key);
    const { data } = await api.get('/attendance-tracker/export', { params: { year, month } });
    const normalized = {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      detailRows: Array.isArray(data?.detailRows) ? data.detailRows : [],
    };
    cacheRef.current.set(key, normalized);
    return normalized;
  }, []);

  const fetchDetailsByRange = useCallback(async (start, end) => {
    const monthRequests = listMonthsInRange(start, end);
    const payloads = await Promise.all(monthRequests.map((m) => fetchMonthExport(m.year, m.month)));
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    return payloads.flatMap((p) => p.detailRows).filter((r) => r.dateKey >= startKey && r.dateKey <= endKey);
  }, [fetchMonthExport]);

  useEffect(() => {
    let mounted = true;
    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const { data } = await api.get('/admin/employee');
        if (!mounted) return;
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!mounted) return;
        setEmployees([]);
        toast({
          title: 'Employee data failed',
          description: error.response?.data?.message || 'Unable to load employee metadata.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setEmployeesLoading(false);
      }
    };
    loadEmployees();
    return () => {
      mounted = false;
    };
  }, [refreshToken, toast]);

  useEffect(() => {
    let mounted = true;
    const loadMonthly = async () => {
      try {
        setMonthlyLoading(true);
        const payload = await fetchMonthExport(selectedMonth.year, selectedMonth.month);
        if (!mounted) return;
        setMonthlyRows(payload.rows);
      } catch (error) {
        if (!mounted) return;
        setMonthlyRows([]);
        toast({
          title: 'Monthly review failed',
          description: error.response?.data?.message || 'Unable to load monthly attendance summary.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setMonthlyLoading(false);
      }
    };
    loadMonthly();
    return () => {
      mounted = false;
    };
  }, [fetchMonthExport, refreshToken, selectedMonth.month, selectedMonth.year, toast]);

  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      try {
        setDetailsLoading(true);
        const rows = await fetchDetailsByRange(activeRange.start, activeRange.end);
        if (!mounted) return;
        setDetailRows(rows);
      } catch (error) {
        if (!mounted) return;
        setDetailRows([]);
        toast({
          title: 'Attendance records failed',
          description: error.response?.data?.message || 'Unable to load attendance detail rows.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setDetailsLoading(false);
      }
    };
    loadDetails();
    return () => {
      mounted = false;
    };
  }, [activeRangeKey, fetchDetailsByRange, refreshToken, toast]);

  useEffect(() => {
    if (!selectedBreakRecord) {
      setSelectedBreakDetails(null);
      setBreakDetailsLoading(false);
      return;
    }

    let mounted = true;

    const loadBreakDetails = async () => {
      try {
        setBreakDetailsLoading(true);
        const { data } = await api.get('/attendance-tracker/details', {
          params: {
            userId: selectedBreakRecord.userId,
            date: selectedBreakRecord.dateKey,
          },
        });

        if (!mounted) {
          return;
        }

        setSelectedBreakDetails(data || null);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setSelectedBreakDetails(null);
        toast({
          title: 'Break details failed',
          description: error.response?.data?.message || 'Unable to load break details.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) {
          setBreakDetailsLoading(false);
        }
      }
    };

    loadBreakDetails();

    return () => {
      mounted = false;
    };
  }, [selectedBreakRecord, toast]);

  const hasActiveBreak = Boolean(
    selectedBreakDetails?.teaBreak?.isActive || selectedBreakDetails?.lunchBreak?.isActive
  );

  useEffect(() => {
    if (!selectedBreakRecord || !hasActiveBreak) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setLiveNowMs(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [hasActiveBreak, selectedBreakRecord]);

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((employee) => {
      map.set(employee.id, {
        name: employee.name || 'Unknown',
        employeeId: employee.employeeId || employee.professional?.employeeId || '',
        department: employee.department || employee.professional?.department || 'Unassigned',
      });
    });
    return map;
  }, [employees]);

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const enrichedDetails = useMemo(() => {
    const rows = detailRows.map((row) => {
      const meta = employeeMap.get(row.userId);
      return {
        ...row,
        employeeName: row.name || meta?.name || 'Unknown',
        employeeId: meta?.employeeId || row.userName || row.userId,
        department: meta?.department || 'Unassigned',
        statusMeta: getStatusMeta(row.statusCode),
      };
    });

    rows.sort((a, b) => {
      if (a.dateKey === b.dateKey) return a.employeeName.localeCompare(b.employeeName);
      return a.dateKey < b.dateKey ? 1 : -1;
    });

    return rows;
  }, [detailRows, employeeMap]);

  const filteredDetails = useMemo(() => {
    return enrichedDetails.filter((row) => {
      if (normalizedSearch) {
        const blob = `${row.employeeName} ${row.employeeId} ${row.userId}`.toLowerCase();
        if (!blob.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [enrichedDetails, normalizedSearch]);

  const payrollRows = useMemo(() => {
    const rows = monthlyRows.map((row) => {
      const meta = employeeMap.get(row.userId);
      return {
        ...row,
        employeeName: row.name || meta?.name || 'Unknown',
        employeeId: meta?.employeeId || row.userName || row.userId,
        department: meta?.department || 'Unassigned',
        lateDays: countStatusDays(row.days, 'L'),
      };
    });

    return rows
      .filter((row) => {
        if (normalizedSearch) {
          const blob = `${row.employeeName} ${row.employeeId} ${row.userId}`.toLowerCase();
          if (!blob.includes(normalizedSearch)) return false;
        }
        return true;
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [employeeMap, monthlyRows, normalizedSearch]);

  const daysInReviewMonth = useMemo(
    () => new Date(selectedMonth.year, selectedMonth.month, 0).getDate(),
    [selectedMonth.month, selectedMonth.year]
  );
  const calendarVisibleDays = useMemo(
    () => Array.from({ length: daysInReviewMonth }, (_, index) => index + 1),
    [daysInReviewMonth, selectedMonth.month, selectedMonth.year]
  );
  const calendarTableMinWidth = useMemo(
    () => (
      CALENDAR_EMPLOYEE_COLUMN_WIDTH
      + (calendarVisibleDays.length * CALENDAR_DAY_COLUMN_WIDTH)
      + (CALENDAR_SUMMARY_COLUMN_WIDTH * 3)
    ),
    [calendarVisibleDays.length]
  );
  const isCurrentReviewMonth = useMemo(() => {
    const today = new Date();
    return today.getFullYear() === selectedMonth.year && today.getMonth() + 1 === selectedMonth.month;
  }, [selectedMonth.month, selectedMonth.year]);
  const todayDay = isCurrentReviewMonth ? new Date().getDate() : null;

  const monthlyStats = useMemo(() => {
    const totals = monthlyRows.reduce(
      (acc, row) => ({
        totalEmployees: acc.totalEmployees + 1,
        present: acc.present + Number(row.P || 0),
        absent: acc.absent + Number(row.A || 0),
        late: acc.late + countStatusDays(row.days, 'L'),
        overtimeSeconds: acc.overtimeSeconds + Number(row.overtimeSeconds || 0),
      }),
      { totalEmployees: 0, present: 0, absent: 0, late: 0, overtimeSeconds: 0 }
    );

    const base = totals.present + totals.absent;
    const attendanceRate = base > 0 ? ((totals.present / base) * 100).toFixed(1) : '0.0';
    return { ...totals, attendanceRate };
  }, [monthlyRows]);

  const resolveReportRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reportPeriod === 'today') return { start: today, end: today, label: 'today' };
    if (reportPeriod === 'this-week') {
      const week = getWeekBounds(today);
      return { ...week, label: 'this_week' };
    }
    if (reportPeriod === 'this-month') {
      return { start: selectedMonth.start, end: selectedMonth.end, label: selectedMonth.key };
    }

    const start = parseDateInput(reportCustomStart);
    const end = parseDateInput(reportCustomEnd);
    if (!start || !end || start > end) {
      toast({
        title: 'Invalid custom range',
        description: 'Please provide a valid report custom start and end date.',
        variant: 'destructive',
      });
      return null;
    }
    return { start, end, label: `${reportCustomStart}_${reportCustomEnd}` };
  };

  const handleDownloadReport = async () => {
    const range = resolveReportRange();
    if (!range) return;

    try {
      setDownloadLoading(true);
      const rawRows = await fetchDetailsByRange(range.start, range.end);

      const rows = rawRows
        .map((row) => {
          const meta = employeeMap.get(row.userId);
          return {
            ...row,
            employeeName: row.name || meta?.name || 'Unknown',
            employeeId: meta?.employeeId || row.userName || row.userId,
            department: meta?.department || 'Unassigned',
            statusMeta: getStatusMeta(row.statusCode),
          };
        })
        .filter((row) => {
          if (normalizedSearch) {
            const blob = `${row.employeeName} ${row.employeeId} ${row.userId}`.toLowerCase();
            if (!blob.includes(normalizedSearch)) return false;
          }
          return true;
        });

      if (!rows.length) {
        toast({ title: 'No report data', description: 'No attendance records match current report filters.' });
        return;
      }

      const detailSheetRows = rows.map((row) => {
        const workingSeconds = getComputedWorkingSeconds(row);
        const notes = [];
        if (row.statusCode === 'L') notes.push('Late');
        if (row.leaveType) notes.push(`Leave: ${row.leaveType}`);
        if (Number(row.overtimeSeconds || 0) > 0) notes.push(`Overtime: ${formatDuration(row.overtimeSeconds)}`);

        return {
          'Employee Name': row.employeeName,
          'Employee ID': row.employeeId,
          Department: row.department,
          Date: row.dateKey,
          'Check In': formatTime(row.checkInAt),
          'Check Out': formatTime(row.checkOutAt),
          'Working Hours': formatHoursDecimal(workingSeconds),
          'Attendance Status': row.statusMeta.label,
          'Leave / Late / Overtime': notes.join(' | ') || '-',
        };
      });

      const payrollMap = new Map();
      rows.forEach((row) => {
        if (!payrollMap.has(row.userId)) {
          payrollMap.set(row.userId, {
            'Employee Name': row.employeeName,
            'Employee ID': row.employeeId,
            Department: row.department,
            Present: 0,
            Absent: 0,
            Late: 0,
            'On Leave': 0,
            Weekend: 0,
            'Working Hours Total': 0,
            'Overtime Total (Hours)': 0,
          });
        }

        const entry = payrollMap.get(row.userId);
        if (row.statusCode === 'P') entry.Present += 1;
        if (row.statusCode === 'L') {
          entry.Present += 1;
          entry.Late += 1;
        }
        if (row.statusCode === 'A') entry.Absent += 1;
        if (row.statusCode === 'OL') entry['On Leave'] += 1;
        if (row.statusCode === 'W') entry.Weekend += 1;

        entry['Working Hours Total'] += getComputedWorkingSeconds(row);
        entry['Overtime Total (Hours)'] += Number(row.overtimeSeconds || 0);
      });

      const payrollSheetRows = Array.from(payrollMap.values())
        .sort((a, b) => a['Employee Name'].localeCompare(b['Employee Name']))
        .map((row) => ({
          ...row,
          'Working Hours Total': formatHoursDecimal(row['Working Hours Total']),
          'Overtime Total (Hours)': formatHoursDecimal(row['Overtime Total (Hours)']),
        }));

      const workbook = XLSX.utils.book_new();
      const detailsSheet = XLSX.utils.json_to_sheet(detailSheetRows);
      const payrollSheet = XLSX.utils.json_to_sheet(payrollSheetRows);

      detailsSheet['!cols'] = [
        { wch: 24 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 34 },
      ];

      payrollSheet['!cols'] = [
        { wch: 24 },
        { wch: 16 },
        { wch: 16 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 20 },
        { wch: 22 },
      ];

      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Attendance Details');
      XLSX.utils.book_append_sheet(workbook, payrollSheet, 'Payroll Summary');
      XLSX.writeFile(workbook, `hr_attendance_report_${range.label}.xlsx`);

      toast({ title: 'Report downloaded', description: 'HR attendance report has been generated.' });
    } catch (error) {
      toast({
        title: 'Report download failed',
        description: error.response?.data?.message || 'Unable to generate attendance report.',
        variant: 'destructive',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const clearCustomRange = () => {
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const openBreakRecordDialog = (row) => {
    setSelectedBreakRecord(row);
    setSelectedBreakDetails(null);
    setLiveNowMs(Date.now());
  };

  const closeBreakRecordDialog = () => {
    setSelectedBreakRecord(null);
    setSelectedBreakDetails(null);
    setBreakDetailsLoading(false);
  };

  const closeCalendarDayDialog = () => {
    setSelectedCalendarDay(null);
    setCalendarDayDetailsLoading(false);
  };

  const handleCalendarDayClick = async (row, day) => {
    const status = row.days?.[String(day)] || '-';
    if (status === '-' || status === 'W') {
      return;
    }

    const dateKey = `${selectedMonth.key}-${pad2(day)}`;
    const member = {
      userId: row.userId,
      name: row.employeeName,
      employeeId: row.employeeId,
      department: row.department,
    };

    setSelectedCalendarDay({
      member,
      day,
      status,
      dateKey,
      details: null,
    });
    setCalendarDayDetailsLoading(true);

    try {
      const { data } = await api.get('/attendance-tracker/details', {
        params: {
          userId: row.userId,
          date: dateKey,
        },
      });

      setSelectedCalendarDay({
        member,
        day,
        status,
        dateKey,
        details: data || null,
      });
    } catch (error) {
      toast({
        title: 'Detail load failed',
        description: error.response?.data?.message || 'Unable to load attendance details.',
        variant: 'destructive',
      });
    } finally {
      setCalendarDayDetailsLoading(false);
    }
  };

  const refreshData = () => {
    cacheRef.current.clear();
    setRefreshToken((v) => v + 1);
  };

  const loading = employeesLoading || monthlyLoading || detailsLoading;
  const attendanceRateValue = Math.max(0, Math.min(100, Number(monthlyStats.attendanceRate || 0)));
  const absenceRateValue = Math.max(0, 100 - attendanceRateValue);

  const teaBreakStart = selectedBreakDetails?.teaBreak?.start ?? selectedBreakRecord?.teaBreakStart ?? null;
  const teaBreakEnd = selectedBreakDetails?.teaBreak?.end ?? selectedBreakRecord?.teaBreakEnd ?? null;
  const teaBreakIsActive = Boolean(selectedBreakDetails?.teaBreak?.isActive);
  const teaBreakDurationSecondsBase =
    selectedBreakDetails?.teaBreak?.durationSeconds ?? selectedBreakRecord?.teaBreakSeconds ?? 0;
  const teaBreakDurationSeconds = resolveLiveDurationSeconds(
    teaBreakStart,
    teaBreakDurationSecondsBase,
    teaBreakIsActive,
    liveNowMs
  );
  const teaBreakExceededSeconds =
    selectedBreakDetails?.teaBreak?.exceededSeconds ?? selectedBreakRecord?.teaBreakExceededSeconds ?? 0;

  const lunchBreakStart = selectedBreakDetails?.lunchBreak?.start ?? selectedBreakRecord?.lunchBreakStart ?? null;
  const lunchBreakEnd = selectedBreakDetails?.lunchBreak?.end ?? selectedBreakRecord?.lunchBreakEnd ?? null;
  const lunchBreakIsActive = Boolean(selectedBreakDetails?.lunchBreak?.isActive);
  const lunchBreakDurationSecondsBase =
    selectedBreakDetails?.lunchBreak?.durationSeconds ?? selectedBreakRecord?.lunchBreakSeconds ?? 0;
  const lunchBreakDurationSeconds = resolveLiveDurationSeconds(
    lunchBreakStart,
    lunchBreakDurationSecondsBase,
    lunchBreakIsActive,
    liveNowMs
  );
  const lunchBreakExceededSeconds =
    selectedBreakDetails?.lunchBreak?.exceededSeconds ?? selectedBreakRecord?.lunchBreakExceededSeconds ?? 0;
  const dialogWorkingSeconds =
    selectedBreakDetails?.attendance?.totalWorkedSeconds > 0
      ? Number(selectedBreakDetails.attendance.totalWorkedSeconds)
      : getComputedWorkingSeconds(selectedBreakRecord, liveNowMs);

  return (
    <>
      <Helmet>
        <title>HR Attendance Dashboard - CRM</title>
      </Helmet>
      <MainLayout>
        <div className="hr-attendance-page mx-auto max-w-screen-2xl min-w-0 space-y-5 overflow-x-hidden px-2 pb-6 pt-1 sm:px-4">
          <div className="relative overflow-hidden border shadow-sm rounded-2xl border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute -left-12 top-0 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h1 className="text-lg font-semibold text-white sm:text-xl">HR Attendance Dashboard</h1>
                <p className="mt-1 text-xs text-slate-200 sm:text-sm">
                  Monthly attendance monitoring, record validation, and payroll-ready reporting.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  Review Month: {reviewMonthLabel}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="summary-card summary-card-total relative overflow-hidden border shadow-sm rounded-2xl border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="summary-card-orb absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 bg-slate-100/80" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-slate-500">Total Employees</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">{monthlyStats.totalEmployees}</p>
                </div>
                <span className="summary-card-icon inline-flex items-center justify-center rounded-lg h-9 w-9 bg-slate-100 text-slate-700">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="relative mt-3">
                <div className="w-full h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-slate-500" style={{ width: `${attendanceRateValue}%` }} />
                </div>
              </div>
              <p className="relative mt-2 text-xs text-slate-600">Attendance rate: {monthlyStats.attendanceRate}%</p>
            </div>

            <div className="summary-card summary-card-present relative overflow-hidden border shadow-sm rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="summary-card-orb absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 bg-emerald-200/40" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-emerald-700">Present</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-800">{monthlyStats.present}</p>
                </div>
                <span className="summary-card-icon inline-flex items-center justify-center rounded-lg h-9 w-9 bg-emerald-100 text-emerald-700">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="relative mt-2 text-xs text-emerald-700">Monthly present records</p>
            </div>

            <div className="summary-card summary-card-absent relative overflow-hidden border shadow-sm rounded-2xl border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="summary-card-orb absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 bg-rose-200/40" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-rose-700">Leave</p>
                  <p className="mt-1 text-3xl font-semibold text-rose-800">{monthlyStats.absent}</p>
                </div>
                <span className="summary-card-icon inline-flex items-center justify-center rounded-lg h-9 w-9 bg-rose-100 text-rose-700">
                  <UserRoundX className="w-4 h-4" />
                </span>
              </div>
              <p className="relative mt-2 text-xs text-rose-700">Absence rate: {absenceRateValue.toFixed(1)}%</p>
            </div>

            <div className="summary-card summary-card-late relative overflow-hidden border shadow-sm rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="summary-card-orb absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 bg-amber-200/40" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-amber-700">Late</p>
                  <p className="mt-1 text-3xl font-semibold text-amber-800">{monthlyStats.late}</p>
                </div>
                <span className="summary-card-icon inline-flex items-center justify-center rounded-lg h-9 w-9 bg-amber-100 text-amber-700">
                  <Clock3 className="w-4 h-4" />
                </span>
              </div>
              <p className="relative mt-2 text-xs text-amber-700">Late arrivals in selected month</p>
            </div>
          </div>

          <div className="border shadow-sm rounded-2xl border-slate-200 bg-white/95 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Attendance Filters & Report Download</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Adjust record visibility and export attendance reports quickly.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-md border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-100"
                onClick={() => setFilterReportPanelOpen((open) => !open)}
                aria-expanded={filterReportPanelOpen}
              >
                {filterReportPanelOpen ? 'Collapse' : 'Expand'}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${filterReportPanelOpen ? '' : '-rotate-90'}`} />
              </Button>
            </div>

            {!filterReportPanelOpen ? (
              <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-3">
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  Search: {searchTerm?.trim() ? searchTerm.trim() : 'All employees'}
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  Filter period:{' '}
                  {activeRange.type === 'month'
                    ? `This Month (${reviewMonthLabel})`
                    : activeRange.type === 'custom'
                      ? `Custom (${customStartDate} to ${customEndDate})`
                      : getPeriodLabel(activeRange.type)}
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  Report period:{' '}
                  {reportPeriod === 'custom'
                    ? `Custom (${reportCustomStart || '--'} to ${reportCustomEnd || '--'})`
                    : getPeriodLabel(reportPeriod)}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 xl:col-span-7">
                  <h3 className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-500">Attendance Filters</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="relative md:col-span-7">
                      <Search className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-9"
                        placeholder="Search by employee name or ID"
                      />
                    </div>

                    <select
                      className="h-10 px-3 text-sm bg-white border rounded-md md:col-span-5 border-slate-200"
                      value={filterPeriod}
                      onChange={(event) => setFilterPeriod(event.target.value)}
                    >
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </select>

                    {filterPeriod === 'this-month' && (
                      <div className="relative md:col-span-5">
                        <CalendarRange className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                        <Input
                          type="month"
                          className="bg-white pl-9"
                          value={reviewMonth}
                          onChange={(e) => setReviewMonth(e.target.value || getCurrentMonthKey())}
                        />
                      </div>
                    )}

                    {filterPeriod === 'custom' && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:col-span-12">
                        <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-white" />
                        <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
                    {activeRange.type === 'today' && <span className="px-3 py-1 bg-white border rounded-full border-slate-200">Date period: Today</span>}
                    {activeRange.type === 'this-week' && <span className="px-3 py-1 bg-white border rounded-full border-slate-200">Date period: This Week</span>}
                    {activeRange.type === 'month' && (
                      <span className="px-3 py-1 bg-white border rounded-full border-slate-200">Date period: This Month ({reviewMonthLabel})</span>
                    )}
                    {activeRange.type === 'custom' && (
                      <span className="px-3 py-1 bg-white border rounded-full border-slate-200">Date period: Custom ({customStartDate} to {customEndDate})</span>
                    )}

                    {filterPeriod === 'custom' && (customStartDate || customEndDate) && !isCustomRangeValid && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        Select a valid start and end date to activate custom range.
                      </span>
                    )}

                    {filterPeriod === 'custom' && (customStartDate || customEndDate) && (
                      <Button type="button" variant="ghost" className="px-3 text-xs h-7" onClick={clearCustomRange}>
                        Clear custom range
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 xl:col-span-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500">Report Download</h3>
                    </div>
                    <Button type="button" className="sm:shrink-0" onClick={handleDownloadReport} disabled={downloadLoading}>
                      {downloadLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      Download Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-3">
                    <select
                      className="h-10 px-3 text-sm bg-white border rounded-md border-slate-200"
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                    >
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </select>

                    {reportPeriod === 'custom' ? (
                      <>
                        <Input
                          type="date"
                          value={reportCustomStart}
                          onChange={(e) => setReportCustomStart(e.target.value)}
                          className="bg-white"
                        />
                        <Input
                          type="date"
                          value={reportCustomEnd}
                          onChange={(e) => setReportCustomEnd(e.target.value)}
                          className="bg-white"
                        />
                      </>
                    ) : (
                      <div className="flex items-center h-10 px-3 text-xs bg-white border rounded-md md:col-span-2 border-slate-200 text-slate-600">
                        Report period: {reportPeriod === 'today' ? 'Today' : reportPeriod === 'this-week' ? 'This Week' : 'This Month'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center h-10 px-3 mt-3 text-xs bg-white border border-dashed rounded-md border-slate-300 text-slate-500">
                    Current month option uses: {reviewMonthLabel}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 overflow-hidden border shadow-sm rounded-2xl border-slate-200 bg-white">
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-md bg-white p-1.5 text-slate-600 shadow-sm">
                  <Table2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Attendance Records</h2>
                  <p className="text-xs text-slate-500">{filteredDetails.length} records shown from {enrichedDetails.length} loaded rows</p>
                </div>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    attendanceViewMode === 'table' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setAttendanceViewMode('table')}
                >
                  <Table2 className="mr-1.5 h-3.5 w-3.5" />
                  Table
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    attendanceViewMode === 'calendar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setAttendanceViewMode('calendar')}
                >
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>
            </div>

            {attendanceViewMode === 'table' ? (
              <div className="attendance-records-scroll min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto max-h-[460px]">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="text-xs tracking-wide text-left uppercase text-slate-500">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check In</th>
                      <th className="px-4 py-3">Check Out</th>
                      <th className="px-4 py-3">Working Hours</th>
                      <th className="px-4 py-3">Attendance Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!detailsLoading &&
                      filteredDetails.map((row) => {
                        return (
                          <tr key={`${row.userId}_${row.dateKey}`} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{row.employeeName}</div>
                              <div className="font-mono text-xs text-slate-500">{row.employeeId}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{row.department}</td>
                            <td className="px-4 py-3 text-slate-700">{formatDate(row.dateKey)}</td>
                            <td className="px-4 py-3 text-slate-700">{formatTime(row.checkInAt)}</td>
                            <td className="px-4 py-3 text-slate-700">{formatTime(row.checkOutAt)}</td>
                            <td className="px-4 py-3 text-slate-700">{formatDuration(getComputedWorkingSeconds(row))}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.statusMeta.className}`}>
                                {row.statusMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-8 rounded-full p-0 text-slate-600 hover:bg-slate-200"
                                onClick={() => openBreakRecordDialog(row)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="attendance-records-scroll relative min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-contain bg-white max-h-[460px]">
                <table className="w-full text-xs border-collapse table-fixed" style={{ minWidth: `${calendarTableMinWidth}px` }}>
                  <colgroup>
                    <col style={{ width: `${CALENDAR_EMPLOYEE_COLUMN_WIDTH}px` }} />
                    {calendarVisibleDays.map((day) => (
                      <col key={`calendar_col_${day}`} style={{ width: `${CALENDAR_DAY_COLUMN_WIDTH}px` }} />
                    ))}
                    <col style={{ width: `${CALENDAR_SUMMARY_COLUMN_WIDTH}px` }} />
                    <col style={{ width: `${CALENDAR_SUMMARY_COLUMN_WIDTH}px` }} />
                    <col style={{ width: `${CALENDAR_SUMMARY_COLUMN_WIDTH}px` }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="sticky left-0 z-20 px-3 py-2 font-medium text-left border-b border-r bg-slate-50 shadow-sm">
                        Employee
                      </th>
                      {calendarVisibleDays.map((day) => (
                        <th
                          key={`calendar_head_${day}`}
                          className={`border-b px-0.5 py-2 text-center font-normal ${todayDay === day ? 'bg-teal-100 text-teal-800' : ''}`}
                        >
                          {day}
                        </th>
                      ))}
                      <th
                        className="sticky z-20 px-2 py-2 font-medium text-center border-b border-l bg-slate-50 shadow-[-1px_0_0_0_rgba(226,232,240,1)]"
                        style={{ right: `${CALENDAR_SUMMARY_COLUMN_WIDTH * 2}px` }}
                      >
                        P
                      </th>
                      <th
                        className="sticky z-20 px-2 py-2 font-medium text-center border-b bg-slate-50 shadow-[-1px_0_0_0_rgba(226,232,240,1)]"
                        style={{ right: `${CALENDAR_SUMMARY_COLUMN_WIDTH}px` }}
                      >
                        A
                      </th>
                      <th
                        className="sticky right-0 z-20 px-2 py-2 font-medium text-center border-b bg-slate-50 shadow-[-1px_0_0_0_rgba(226,232,240,1)]"
                      >
                        L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!monthlyLoading &&
                      payrollRows.map((row) => (
                        <tr key={`calendar_row_${row.userId}`} className="transition-colors hover:bg-slate-50">
                          <td className="sticky left-0 z-10 px-3 py-2 bg-white border-r shadow-sm">
                            <div className="max-w-[130px] truncate font-medium text-slate-900" title={row.employeeName}>
                              {getFirstName(row.employeeName)}
                            </div>
                            <div className="max-w-[130px] truncate text-[11px] text-slate-500" title={row.employeeId}>
                              {row.employeeId}
                            </div>
                          </td>
                          {calendarVisibleDays.map((day) => {
                            const status = row.days?.[String(day)] || '-';
                            const canOpenDayDetails = status !== '-' && status !== 'W';
                            return (
                              <td key={`calendar_cell_${row.userId}_${day}`} className="px-0 py-1 text-center align-middle border-b border-slate-100">
                                <span
                                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold transition ${
                                    canOpenDayDetails ? 'cursor-pointer hover:ring-2 hover:ring-slate-300/80' : 'cursor-default'
                                  } ${getCalendarStatusClass(status)}`}
                                  onClick={() => (canOpenDayDetails ? handleCalendarDayClick(row, day) : undefined)}
                                >
                                  {status === '-' ? '' : status}
                                </span>
                              </td>
                            );
                          })}
                          <td
                            className="sticky z-10 px-2 py-2 font-semibold text-center bg-white border-b border-l text-emerald-700 shadow-[-1px_0_0_0_rgba(226,232,240,1)]"
                            style={{ right: `${CALENDAR_SUMMARY_COLUMN_WIDTH * 2}px` }}
                          >
                            {row.P || 0}
                          </td>
                          <td
                            className="sticky z-10 px-2 py-2 font-semibold text-center bg-white border-b text-rose-700 shadow-[-1px_0_0_0_rgba(226,232,240,1)]"
                            style={{ right: `${CALENDAR_SUMMARY_COLUMN_WIDTH}px` }}
                          >
                            {row.A || 0}
                          </td>
                          <td className="sticky right-0 z-10 px-2 py-2 font-semibold text-center bg-white border-b text-amber-700 shadow-[-1px_0_0_0_rgba(226,232,240,1)]">
                            {row.lateDays || 0}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex flex-wrap gap-3 border-t bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-100" /> Present
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-amber-100" /> Late
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-rose-100" /> Absent
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-sky-100" /> On Leave
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-slate-100" /> Weekend
                  </div>
                </div>
              </div>
            )}

            {attendanceViewMode === 'table' && detailsLoading && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">Loading attendance records...</div>
            )}

            {attendanceViewMode === 'table' && !detailsLoading && filteredDetails.length === 0 && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">No attendance records matched the current filters.</div>
            )}

            {attendanceViewMode === 'calendar' && monthlyLoading && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">Loading calendar attendance grid...</div>
            )}

            {attendanceViewMode === 'calendar' && !monthlyLoading && payrollRows.length === 0 && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">No employees available for this monthly calendar view.</div>
            )}
          </div>

          <div className="min-w-0 overflow-hidden border shadow-sm rounded-2xl border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Payroll Support: Monthly Totals</h2>
              <p className="text-xs text-slate-500">Attendance totals per employee for salary calculation ({reviewMonthLabel})</p>
            </div>

            <div className="attendance-records-scroll min-w-0 overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="text-xs tracking-wide text-left uppercase text-slate-500">
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Present Days</th>
                    <th className="px-4 py-3">Leave Days</th>
                    <th className="px-4 py-3">Late Days</th>
                    <th className="px-4 py-3">Exceed Break Time</th>
                  </tr>
                </thead>
                <tbody>
                  {!monthlyLoading &&
                    payrollRows.map((row) => (
                      <tr key={`payroll_${row.userId}`} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.employeeName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.employeeId}</td>
                        <td className="px-4 py-3 text-slate-700">{row.department}</td>
                        <td className="px-4 py-3 text-emerald-700">{row.P || 0}</td>
                        <td className="px-4 py-3 text-rose-700">{row.A || 0}</td>
                        <td className="px-4 py-3 text-amber-700">{row.lateDays || 0}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDuration(row.excessBreakSeconds)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {monthlyLoading && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">Loading monthly payroll totals...</div>
            )}

            {!monthlyLoading && payrollRows.length === 0 && (
              <div className="px-4 py-10 text-sm text-center text-slate-500">No monthly totals available for the current filters.</div>
            )}
          </div>
        </div>

        <Dialog
          open={Boolean(selectedBreakRecord)}
          onOpenChange={(open) => {
            if (!open) {
              closeBreakRecordDialog();
            }
          }}
        >
          <DialogContent className="hr-break-dialog border border-slate-200 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Break Records</DialogTitle>
              <DialogDescription>
                Attendance break details for the selected employee record.
              </DialogDescription>
            </DialogHeader>

            {selectedBreakRecord && (
              <div className="space-y-3 text-sm">
                <div className="hr-break-dialog__summary rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{selectedBreakRecord.employeeName}</p>
                  <p className="font-mono text-xs text-slate-500">{selectedBreakRecord.employeeId}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                    <p>Date: {formatDate(selectedBreakRecord.dateKey)}</p>
                    <p>Status: {selectedBreakRecord.statusMeta.label}</p>
                    <p>Check In: {formatTime(selectedBreakRecord.checkInAt)}</p>
                    <p>Check Out: {formatTime(selectedBreakRecord.checkOutAt)}</p>
                  </div>
                </div>

                {breakDetailsLoading && (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading latest break state...
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div
                    className={`hr-break-card hr-break-card-tea ${teaBreakIsActive ? 'is-active' : ''} rounded-xl border p-3 transition-all ${
                      teaBreakIsActive
                        ? 'border-amber-400 bg-amber-100 shadow-md shadow-amber-200 ring-2 ring-amber-300 animate-pulse'
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-amber-800">Tea Break</p>
                      {teaBreakIsActive && (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Active now
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-amber-900">
                      <p>Start: {formatDateTime(teaBreakStart)}</p>
                      <p>End: {formatDateTime(teaBreakEnd)}</p>
                      <p>Duration: {formatDuration(teaBreakDurationSeconds)}</p>
                      {teaBreakIsActive && (
                        <p className="font-semibold text-amber-900">
                          Live Timer: {formatClockDuration(teaBreakDurationSeconds)}
                        </p>
                      )}
                      <p>Exceeded: {formatDuration(teaBreakExceededSeconds)}</p>
                    </div>
                  </div>

                  <div
                    className={`hr-break-card hr-break-card-lunch ${lunchBreakIsActive ? 'is-active' : ''} rounded-xl border p-3 transition-all ${
                      lunchBreakIsActive
                        ? 'border-sky-400 bg-sky-100 shadow-md shadow-sky-200 ring-2 ring-sky-300 animate-pulse'
                        : 'border-sky-200 bg-sky-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sky-800">Lunch Break</p>
                      {lunchBreakIsActive && (
                        <span className="rounded-full bg-sky-200 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                          Active now
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-sky-900">
                      <p>Start: {formatDateTime(lunchBreakStart)}</p>
                      <p>End: {formatDateTime(lunchBreakEnd)}</p>
                      <p>Duration: {formatDuration(lunchBreakDurationSeconds)}</p>
                      {lunchBreakIsActive && (
                        <p className="font-semibold text-sky-900">
                          Live Timer: {formatClockDuration(lunchBreakDurationSeconds)}
                        </p>
                      )}
                      <p>Exceeded: {formatDuration(lunchBreakExceededSeconds)}</p>
                    </div>
                  </div>
                </div>

                <div className="hr-break-dialog__totals rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                  <p>Working Hours: {formatDuration(dialogWorkingSeconds)}</p>
                  <p>Overtime: {formatDuration(selectedBreakRecord.overtimeSeconds)}</p>
                  <p>Leave: {selectedBreakRecord.leaveType || '-'}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedCalendarDay)}
          onOpenChange={(open) => {
            if (!open) {
              closeCalendarDayDialog();
            }
          }}
        >
          <DialogContent className="border border-slate-200 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{getStatusMeta(selectedCalendarDay?.status).label}</DialogTitle>
              <DialogDescription>
                Employee attendance details for the selected day.
              </DialogDescription>
            </DialogHeader>

            {selectedCalendarDay && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${getCalendarDialogStatusClass(selectedCalendarDay.status)}`}
                  >
                    {selectedCalendarDay.status}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {selectedCalendarDay.member.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(selectedCalendarDay.dateKey)}</p>
                  </div>
                </div>

                {calendarDayDetailsLoading ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    Loading details...
                  </div>
                ) : (
                  <>
                    {!['A', 'OL'].includes(selectedCalendarDay.status) && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs text-slate-500">Check In</p>
                            <p className="text-base font-semibold text-slate-900">
                              {formatTime(selectedCalendarDay.details?.attendance?.checkInAt)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs text-slate-500">Check Out</p>
                            <p className="text-base font-semibold text-slate-900">
                              {formatTime(selectedCalendarDay.details?.attendance?.checkOutAt)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-amber-600" />
                            <p className="text-sm font-medium text-slate-700">Tea Break</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Start</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatTime(selectedCalendarDay.details?.teaBreak?.start)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">End</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatTime(selectedCalendarDay.details?.teaBreak?.end)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Duration</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatDuration(selectedCalendarDay.details?.teaBreak?.durationSeconds)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Exceeded</p>
                              <p className="text-sm font-medium text-rose-600">
                                {formatDuration(selectedCalendarDay.details?.teaBreak?.exceededSeconds)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-sky-600" />
                            <p className="text-sm font-medium text-slate-700">Lunch Break</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Start</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatTime(selectedCalendarDay.details?.lunchBreak?.start)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">End</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatTime(selectedCalendarDay.details?.lunchBreak?.end)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Duration</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatDuration(selectedCalendarDay.details?.lunchBreak?.durationSeconds)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Exceeded</p>
                              <p className="text-sm font-medium text-rose-600">
                                {formatDuration(selectedCalendarDay.details?.lunchBreak?.exceededSeconds)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedCalendarDay.status === 'L' && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <Info className="h-4 w-4" />
                        Late arrival recorded for this employee.
                      </div>
                    )}

                    {selectedCalendarDay.status === 'A' && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        <Info className="h-4 w-4" />
                        Employee was marked absent for this day.
                      </div>
                    )}

                    {selectedCalendarDay.status === 'OL' && (
                      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                        <Info className="h-4 w-4" />
                        {selectedCalendarDay.details?.leave
                          ? `Approved leave${selectedCalendarDay.details.leave.leaveType ? `: ${selectedCalendarDay.details.leave.leaveType}` : ''}`
                          : 'Employee was on approved leave for this day.'}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </MainLayout>
    </>
  );
};

export default HRAttendanceView;
