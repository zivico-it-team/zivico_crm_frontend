import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LEAVE_BALANCES } from '../utils/leaveConfig';
import { getLeaveBalance, getMyLeaves } from '@/lib/leaveApi';

const LEAVE_TYPE_ORDER = ['Annual', 'Casual', 'Special', 'Unpaid'];

const normalizeLeaveType = (value = '') => {
  const key = String(value).toLowerCase();
  if (key === 'annual') return 'Annual';
  if (key === 'casual') return 'Casual';
  if (key === 'medical' || key === 'special') return 'Special';
  if (key === 'unpaid') return 'Unpaid';
  return '';
};

const makeDefaultBalances = () =>
  DEFAULT_LEAVE_BALANCES.map((item) => {
    const isUnlimited = item.type === 'Unpaid';
    return {
      ...item,
      accessGranted: isUnlimited,
      unlimited: isUnlimited,
    };
  });

const normalizeBalance = (balance) => {
  const type = normalizeLeaveType(balance?.type);
  if (!type) return null;

  const base = DEFAULT_LEAVE_BALANCES.find(
    (item) => item.type === type
  ) || DEFAULT_LEAVE_BALANCES[0];

  const unlimited = Boolean(balance?.unlimited) || type === 'Unpaid';
  const total = Number(balance?.total || 0);
  const remaining = Number(
    balance?.left ?? balance?.remaining ?? balance?.available ?? balance?.balance ?? 0
  );
  const used = Number(
    balance?.used ?? balance?.usedDays ?? balance?.taken ?? balance?.spent ?? (total - remaining)
  );
  const accessGranted =
    unlimited
      ? true
      : typeof balance?.accessGranted === 'boolean'
      ? balance.accessGranted
      : Number.isFinite(total) && total > 0;

  return {
    type,
    total: Number.isFinite(total) ? total : 0,
    used: Number.isFinite(used) ? Math.max(0, used) : 0,
    remaining: Number.isFinite(remaining) ? remaining : 0,
    color: base.color,
    accessGranted,
    unlimited,
  };
};

const mergeBalances = (balances = []) => {
  const normalizedMap = new Map();

  balances
    .map(normalizeBalance)
    .filter(Boolean)
    .forEach((item) => {
      normalizedMap.set(item.type, item);
    });

  return LEAVE_TYPE_ORDER.map((type) => {
    const mapped = normalizedMap.get(type);
    if (mapped) return mapped;

    const base = DEFAULT_LEAVE_BALANCES.find((item) => item.type === type) || DEFAULT_LEAVE_BALANCES[0];
    const isUnlimited = type === 'Unpaid';
    return {
      type,
      total: 0,
      used: 0,
      remaining: 0,
      color: base.color,
      accessGranted: isUnlimited,
      unlimited: isUnlimited,
    };
  });
};

const normalizeLeave = (leave) => ({
  id: leave._id,
  leave_type: normalizeLeaveType(leave.type),
  start_date: leave.fromDate,
  end_date: leave.toDate,
  reason: leave.reason || '',
  status: leave.status || 'pending',
  applied_date: leave.createdAt,
  days: Number(leave.totalDays || 0),
  is_half_day: Boolean(leave.isHalfDay) || Number(leave.totalDays || 0) === 0.5,
  session: leave.session || null,
});

export const useLeaveData = (currentUser) => {
  const [leaveBalances, setLeaveBalances] = useState(makeDefaultBalances());
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLeaveBalances = useCallback(async () => {
    const data = await getLeaveBalance();
    const balances = Array.isArray(data?.balances)
      ? mergeBalances(data.balances)
      : makeDefaultBalances();
    setLeaveBalances(balances);
    return data;
  }, []);

  const loadApplications = useCallback(async () => {
    const data = await getMyLeaves();
    const leaves = Array.isArray(data?.leaves)
      ? data.leaves.map(normalizeLeave)
      : [];

    setApplications(
      leaves.sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date))
    );
  }, []);

  const refreshLeaveData = useCallback(async () => {
    if (!currentUser?._id && !currentUser?.id) return;

    setIsLoading(true);
    try {
      await Promise.all([loadLeaveBalances(), loadApplications()]);
    } catch (error) {
      console.error('Error loading leave data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadApplications, loadLeaveBalances]);

  useEffect(() => {
    refreshLeaveData();
  }, [refreshLeaveData]);

  const cancelLeave = async () => {
    return {
      success: false,
      message: 'Leave cancellation is not available in the current backend API.',
    };
  };

  return {
    leaveBalances,
    applications,
    isLoading,
    loadApplications,
    refreshLeaveData,
    cancelLeave
  };
};
