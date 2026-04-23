import { LEAVE_SESSIONS, HALF_DAY_CONFIG } from './leaveConfig';

export const validateDates = (start, end, leaveType, isHalfDay = false) => {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (!start || !end) return { isValid: false, message: 'Please select both dates' };
  
  if (startDate < today) {
    return { isValid: false, message: 'Start date cannot be in the past' };
  }
  
  // Half-day validation - same day required
  if (isHalfDay) {
    if (startDate.getTime() !== endDate.getTime()) {
      return { 
        isValid: false, 
        message: 'For half day leave, start date and end date must be the same day' 
      };
    }
    return { isValid: true, message: '' };
  }
  
  // Full day validation
  if (endDate < startDate) {
    return { isValid: false, message: 'End date must be after start date' };
  }
  
  if (leaveType === 'Unpaid') {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
    if (diffDays > 30) {
      return { isValid: false, message: 'Unpaid leave cannot exceed 30 days at once' };
    }
  }
  
  return { isValid: true, message: '' };
};

export const getApprovalTimeText = (type, isHalfDay = false) => {
  if (isHalfDay) {
    return "Half-day leave requests are typically reviewed within 4 hours";
  }
  return type === 'Unpaid' 
    ? "Unpaid leave requests require additional approval"
    : "Your manager will review within 24-48 hours";
};

export const getLeaveTypeColor = (type) => {
  switch(type) {
    case 'Annual': return 'blue';
    case 'Casual': return 'emerald';
    case 'Special': return 'amber';
    case 'Unpaid': return 'purple';
    default: return 'blue';
  }
};

export const getLeaveTypeDescription = (type) => {
  switch(type) {
    case 'Annual': return 'Plan your vacation time in advance';
    case 'Casual': return 'For personal or urgent matters';
    case 'Special': return 'For approved special leave needs';
    case 'Unpaid': return 'For extended leave beyond available paid leave';
    default: return '';
  }
};

// New helper functions for half-day leave
export const formatLeaveDuration = (days, isHalfDay = false, session = null) => {
  if (isHalfDay) {
    const sessionLabel = session === LEAVE_SESSIONS.FIRST_HALF ? 'First Half' : 'Second Half';
    return `0.5 day (${sessionLabel})`;
  }
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const calculateLeaveDays = (startDate, endDate, isHalfDay = false) => {
  if (!startDate || !endDate) return 0;
  
  if (isHalfDay && startDate === endDate) {
    return HALF_DAY_CONFIG.duration;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;
  
  let days = 0;
  const current = new Date(start);
  
  while (current <= end) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const validateHalfDayLimit = (leaveHistory, leaveType, month, year) => {
  const halfDayRequests = leaveHistory.filter(request => 
    request.isHalfDay === true &&
    request.leaveType === leaveType &&
    new Date(request.startDate).getMonth() === month &&
    new Date(request.startDate).getFullYear() === year &&
    request.status !== 'rejected' &&
    request.status !== 'cancelled'
  );
  
  return {
    isValid: halfDayRequests.length < HALF_DAY_CONFIG.maxPerMonth,
    current: halfDayRequests.length,
    max: HALF_DAY_CONFIG.maxPerMonth,
    message: `You have used ${halfDayRequests.length} out of ${HALF_DAY_CONFIG.maxPerMonth} half-days this month`
  };
};

export const formatSessionTime = (session) => {
  return session === LEAVE_SESSIONS.FIRST_HALF 
    ? '8:00 AM - 12:00 PM' 
    : '1:00 PM - 5:00 PM';
};

export const getSessionIcon = (session) => {
  return session === LEAVE_SESSIONS.FIRST_HALF ? 'Sun' : 'Moon';
};

// Prepare data for API submission
export const prepareLeaveRequestData = (formData, isHalfDay, session) => {
  const days = calculateLeaveDays(formData.startDate, formData.endDate, isHalfDay);
  
  return {
    leaveType: formData.leaveType,
    startDate: formData.startDate,
    endDate: formData.endDate,
    reason: formData.reason,
    isHalfDay: isHalfDay || false,
    session: isHalfDay ? session : null,
    days: days,
    appliedDate: new Date().toISOString(),
    status: 'pending'
  };
};

// Check if leave type supports half day
export const supportsHalfDay = (leaveType, leaveTypeConfig) => {
  return leaveTypeConfig[leaveType]?.supportsHalfDay || false;
};
