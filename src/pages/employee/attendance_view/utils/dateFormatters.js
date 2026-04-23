export const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return '--:--';
  }
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '--:--';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    return '--:--';
  }
};

export const formatDurationSeconds = (seconds) => {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const getMonthYearString = (date) => {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getDayString = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getMonthShortString = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const formatDateForCSV = (date) => {
  return date.toLocaleDateString();
};