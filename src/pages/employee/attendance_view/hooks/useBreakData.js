import { useState, useEffect, useCallback } from 'react';
import { BREAK_TYPE_MAP } from '../utils/attendanceConfig';

export const useBreakData = (currentUser, currentDate) => {
  const [breakData, setBreakData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBreakData = useCallback(() => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const breaks = [];
      
      // Load completed breaks
      const completedBreaks = JSON.parse(localStorage.getItem('completedBreaks') || '{}');
      const userCompletedBreaks = completedBreaks[currentUser.id] || [];
      
      userCompletedBreaks.forEach(breakRecord => {
        if (breakRecord && breakRecord.startTime) {
          const activityDate = new Date(breakRecord.startTime);
          const activityId = breakRecord.type || breakRecord.activityId;
          
          const typeInfo = BREAK_TYPE_MAP[activityId] || { 
            title: 'Break', 
            icon: 'Timer', 
            color: 'gray' 
          };
          
          breaks.push({
            id: breakRecord.id || `${activityId}_${breakRecord.startTime}`,
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
      const userTimers = globalTimers[currentUser.id] || {};
      
      Object.keys(userTimers).forEach(activityId => {
        const activity = userTimers[activityId];
        if (activity && activity.active && activity.lastUpdated) {
          const activityDate = new Date(activity.lastUpdated);
          const typeInfo = BREAK_TYPE_MAP[activityId] || { 
            title: 'Break', 
            icon: 'Timer', 
            color: 'gray' 
          };
          
          breaks.push({
            id: `${activityId}_${activity.lastUpdated}`,
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
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadBreakData();
  }, [loadBreakData]);

  const deleteBreakRecord = (breakId) => {
    if (!currentUser) return false;

    try {
      // Remove from completedBreaks
      const completedBreaks = JSON.parse(localStorage.getItem('completedBreaks') || '{}');
      if (completedBreaks[currentUser.id]) {
        const updatedBreaks = completedBreaks[currentUser.id].filter(b => 
          b.id !== breakId && 
          !(b.id === undefined && `${b.type}_${b.startTime}` === breakId)
        );
        completedBreaks[currentUser.id] = updatedBreaks;
        localStorage.setItem('completedBreaks', JSON.stringify(completedBreaks));
      }
      
      // Remove from active timers
      const globalTimers = JSON.parse(localStorage.getItem('globalActivityTimers') || '{}');
      const breakType = breakId.split('_')[0];
      
      if (globalTimers[currentUser.id] && globalTimers[currentUser.id][breakType]) {
        delete globalTimers[currentUser.id][breakType];
        localStorage.setItem('globalActivityTimers', JSON.stringify(globalTimers));
      }
      
      loadBreakData();
      return true;
    } catch (error) {
      console.error('Error deleting break record:', error);
      return false;
    }
  };

  const getCurrentMonthBreaks = () => {
    return breakData.filter(breakItem => {
      return breakItem.date.getMonth() === currentDate.getMonth() && 
             breakItem.date.getFullYear() === currentDate.getFullYear();
    });
  };

  return {
    breakData,
    isLoading,
    loadBreakData,
    deleteBreakRecord,
    getCurrentMonthBreaks
  };
};