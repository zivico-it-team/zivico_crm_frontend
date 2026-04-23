import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { BREAK_TYPE_MAP } from '../utils/attendanceConfig';

const API_TYPE_TO_BREAK_TYPE = {
  tea_break: 'tea',
  lunch_break: 'lunch',
  prayer_time: 'prayer',
  meeting: 'meeting',
};

const BREAK_LIMIT_SECONDS = {
  tea: 20 * 60,
  lunch: 40 * 60,
  prayer: 70 * 60,
};

const getUserId = (user) => user?.id || user?._id || '';

const toTimestamp = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isWithinLastDays = (date, days = 5) => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return false;

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return parsedDate >= startDate && parsedDate <= endDate;
};

const getTypeInfo = (type) => BREAK_TYPE_MAP[type] || {
  title: 'Break',
  icon: 'Timer',
  color: 'gray',
};

const normalizeApiActivity = (activity = {}) => {
  const apiType = activity.type || '';
  const breakType = API_TYPE_TO_BREAK_TYPE[apiType] || apiType;
  const typeInfo = getTypeInfo(breakType);
  const startedAt = activity.startedAt || activity.createdAt || activity.dateKey;
  const endedAt = activity.endedAt || null;
  const limitSeconds = BREAK_LIMIT_SECONDS[breakType] || 0;
  const active = Boolean(activity.isActive);
  const timestamp = toTimestamp(startedAt || activity.updatedAt);
  const elapsedSeconds = timestamp ? Math.max(0, Math.floor((Date.now() - timestamp) / 1000)) : 0;
  const durationSeconds = active ? elapsedSeconds : Number(activity.durationSeconds || 0);

  return {
    id: activity._id || activity.id || `${apiType}_${timestamp}`,
    source: 'api',
    type: breakType,
    title: typeInfo.title,
    icon: typeInfo.icon,
    color: typeInfo.color,
    durationSeconds,
    exceededSeconds: limitSeconds ? Math.max(0, durationSeconds - limitSeconds) : 0,
    startTime: startedAt,
    endTime: endedAt,
    active,
    date: new Date(startedAt || `${activity.dateKey}T00:00:00`),
    timestamp,
  };
};

export const useBreakData = (currentUser, currentDate) => {
  const [breakData, setBreakData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBreakData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const breaks = [];
      const userId = getUserId(currentUser);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await api.get('/activity/month', {
        params: { year, month },
      });

      const apiBreaks = Array.isArray(response?.data?.activities)
        ? response.data.activities
            .filter((activity) => ['tea_break', 'lunch_break', 'prayer_time', 'meeting'].includes(activity?.type))
            .map(normalizeApiActivity)
        : [];

      const apiBreakIds = new Set(apiBreaks.map((item) => item.id));
      breaks.push(...apiBreaks);
      
      // Load completed breaks
      const completedBreaks = JSON.parse(localStorage.getItem('completedBreaks') || '{}');
      const userCompletedBreaks = completedBreaks[userId] || [];
      
      userCompletedBreaks.forEach(breakRecord => {
        if (breakRecord && breakRecord.startTime) {
          const activityDate = new Date(breakRecord.startTime);
          const activityId = breakRecord.type || breakRecord.activityId;
          const localId = breakRecord.id || `${activityId}_${breakRecord.startTime}`;

          if (apiBreakIds.has(localId)) {
            return;
          }
          
          const typeInfo = getTypeInfo(activityId);
          
          breaks.push({
            id: localId,
            source: 'local',
            type: activityId,
            title: breakRecord.title || typeInfo.title,
            icon: typeInfo.icon,
            color: typeInfo.color,
            durationSeconds: breakRecord.durationSeconds || 0,
            exceededSeconds: breakRecord.exceededSeconds || 0,
            startTime: breakRecord.startTime,
            endTime: breakRecord.endTime || 
              (breakRecord.startTime + ((breakRecord.durationSeconds || 0) * 1000)),
            active: false,
            date: activityDate,
            timestamp: breakRecord.startTime
          });
        }
      });
      
      // Load active breaks
      const globalTimers = JSON.parse(localStorage.getItem('globalActivityTimers') || '{}');
      const userTimers = globalTimers[userId] || {};
      
      Object.keys(userTimers).forEach(activityId => {
        const activity = userTimers[activityId];
        if (activity && activity.active && activity.lastUpdated) {
          const activityDate = new Date(activity.lastUpdated);
          const typeInfo = getTypeInfo(activityId);
          const localId = `${activityId}_${activity.lastUpdated}`;

          if (breaks.some((item) => item.active && item.type === activityId)) {
            return;
          }
          
          breaks.push({
            id: localId,
            source: 'local',
            type: activityId,
            title: typeInfo.title,
            icon: typeInfo.icon,
            color: typeInfo.color,
            durationSeconds: activity.elapsed || 0,
            exceededSeconds: activity.exceededTime || 0,
            startTime: activity.lastUpdated,
            endTime: null,
            active: true,
            date: activityDate,
            timestamp: activity.lastUpdated
          });
        }
      });
      
      // Sort by date (newest first)
      breaks.sort((a, b) => b.timestamp - a.timestamp);
      setBreakData(breaks);
    } catch (error) {
      console.error('Error loading break data:', error);
      setBreakData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentDate]);

  useEffect(() => {
    loadBreakData();
  }, [loadBreakData]);

  const deleteBreakRecord = async (breakId) => {
    if (!currentUser) return false;

    try {
      const targetBreak = breakData.find((item) => item.id === breakId);

      if (targetBreak?.source === 'api') {
        await api.delete(`/activity/${breakId}`);
        await loadBreakData();
        return true;
      }

      const userId = getUserId(currentUser);

      // Remove from completedBreaks
      const completedBreaks = JSON.parse(localStorage.getItem('completedBreaks') || '{}');
      if (completedBreaks[userId]) {
        const updatedBreaks = completedBreaks[userId].filter(b => 
          b.id !== breakId && 
          !(b.id === undefined && `${b.type}_${b.startTime}` === breakId)
        );
        completedBreaks[userId] = updatedBreaks;
        localStorage.setItem('completedBreaks', JSON.stringify(completedBreaks));
      }
      
      // Remove from active timers
      const globalTimers = JSON.parse(localStorage.getItem('globalActivityTimers') || '{}');
      const breakType = breakId.split('_')[0];
      
      if (globalTimers[userId] && globalTimers[userId][breakType]) {
        delete globalTimers[userId][breakType];
        localStorage.setItem('globalActivityTimers', JSON.stringify(globalTimers));
      }
      
      await loadBreakData();
      return true;
    } catch (error) {
      console.error('Error deleting break record:', error);
      return false;
    }
  };

  const getCurrentMonthBreaks = () => {
    return breakData.filter((breakItem) => isWithinLastDays(breakItem.date, 5));
  };

  return {
    breakData,
    isLoading,
    loadBreakData,
    deleteBreakRecord,
    getCurrentMonthBreaks
  };
};
