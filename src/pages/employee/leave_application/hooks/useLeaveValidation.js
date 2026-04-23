import { useCallback } from 'react';
import { calculateLeaveDays, validateDates } from '../utils/leaveHelpers';

export const useLeaveValidation = () => {
  const getLeaveTypeStatus = useCallback((type, leaveBalances) => {
    const balance = leaveBalances.find(b => b.type === type);
    if (!balance) return 'no_access';
    if (balance.unlimited) return 'available';
    if (!balance.accessGranted) return 'no_access';
    if (balance.remaining <= 0) return 'no_balance';
    return 'available';
  }, []);

  const isLeaveTypeAvailable = useCallback((type, leaveBalances) => {
    return getLeaveTypeStatus(type, leaveBalances) === 'available';
  }, [getLeaveTypeStatus]);

  const validateLeaveApplication = useCallback((formData, leaveBalances) => {
    const dateValidation = validateDates(
      formData.startDate,
      formData.endDate,
      formData.leaveType,
      Boolean(formData.isHalfDay)
    );
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.message);
    }

    const days = calculateLeaveDays(formData.startDate, formData.endDate, Boolean(formData.isHalfDay));
    
    const selectedBalance = leaveBalances.find(b => b.type === formData.leaveType);
    const status = getLeaveTypeStatus(formData.leaveType, leaveBalances);

    if (status === 'no_access') {
      throw new Error(`${formData.leaveType} leave access is not assigned by admin`);
    }

    if (status === 'no_balance') {
      throw new Error(`No ${formData.leaveType} leave balance available`);
    }

    if (selectedBalance && !selectedBalance.unlimited && days > selectedBalance.remaining) {
      throw new Error(`Only ${selectedBalance.remaining} days remaining for ${formData.leaveType} leave`);
    }

    return days;
  }, [getLeaveTypeStatus]);

  return {
    getLeaveTypeStatus,
    isLeaveTypeAvailable,
    validateLeaveApplication
  };
};
