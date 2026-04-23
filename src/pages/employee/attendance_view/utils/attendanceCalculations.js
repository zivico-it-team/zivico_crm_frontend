export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return { 
    days: new Date(year, month + 1, 0).getDate(), 
    firstDay: new Date(year, month, 1).getDay() 
  };
};

export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  try {
    const diff = (new Date(checkOutTime) - new Date(checkInTime)) / (1000 * 60 * 60);
    return diff > 0 ? parseFloat(diff.toFixed(1)) : 0;
  } catch (error) {
    return 0;
  }
};

export const determineAttendanceStatus = (record) => {
  if (record.status) return record.status;
  if (!record.check_in_time) return 'absent';
  
  let status = 'present';
  
  try {
    const checkIn = new Date(record.check_in_time);
    const lateThreshold = new Date(checkIn); 
    lateThreshold.setHours(8, 30, 0, 0);
    
    if (checkIn > lateThreshold) { 
      status = 'late'; 
    }
  } catch (error) {
    console.error('Error determining status:', error);
  }
  
  return status;
};

export const calculateStats = (monthData) => {
  const presentDays = monthData.filter(a => 
    a.status === 'present' || (a.check_in_time && !a.check_out_time)
  ).length;
  
  const totalWorkHours = monthData.reduce((acc, curr) => 
    acc + (curr.working_hours || 0), 0
  );
  
  const avgHours = presentDays > 0 ? 
    parseFloat((totalWorkHours / presentDays).toFixed(1)) : 0;

  return {
    present: presentDays,
    absent: monthData.filter(a => a.status === 'absent').length,
    late: monthData.filter(a => a.status === 'late').length,
    totalHours: parseFloat(totalWorkHours.toFixed(1)),
    avgHours: avgHours
  };
};