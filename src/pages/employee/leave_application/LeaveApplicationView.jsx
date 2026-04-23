import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Info, Ban, AlertCircle, Clock } from 'lucide-react';

import { Badge } from './components/Badge';
import { LeaveStats } from './components/LeaveStats';
import { LeaveBalanceCard } from './components/LeaveBalanceCard';
import { LeaveForm } from './components/LeaveForm';
import { LeaveHistoryTable } from './components/LeaveHistoryTable';
import { LeaveTypeSelector } from './components/LeaveTypeSelector';

import { useLeaveData } from './hooks/useLeaveData';
import { useLeaveValidation } from './hooks/useLeaveValidation';
import { applyLeave } from '@/lib/leaveApi';

import { calculateDays } from './utils/leaveCalculations';
import { validateDates } from './utils/leaveHelpers';
import { LEAVE_TYPE_CONFIG } from './utils/leaveConfig';

const getPreferredLeaveType = (balances = [], getLeaveTypeStatus = () => 'no_access') => {
  const available = balances.find((balance) => getLeaveTypeStatus(balance.type, balances) === 'available');
  if (available) return available.type;

  const withAccess = balances.find((balance) => getLeaveTypeStatus(balance.type, balances) !== 'no_access');
  if (withAccess) return withAccess.type;

  return balances[0]?.type || 'Annual';
};

const LeaveApplicationView = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('apply');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [dateError, setDateError] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('Unpaid');

  const [formData, setFormData] = useState({
    leaveType: 'Unpaid',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDaySession: 'first',
  });

  const { leaveBalances, applications, refreshLeaveData } = useLeaveData(currentUser);
  const { getLeaveTypeStatus, isLeaveTypeAvailable, validateLeaveApplication } = useLeaveValidation();

  const stats = {
    totalApplied: applications.length,
    approved: applications.filter((a) => String(a.status || '').toLowerCase() === 'approved').length,
    pending: applications.filter((a) => String(a.status || '').toLowerCase() === 'pending').length,
    usedDays: applications
      .filter((a) => String(a.status || '').toLowerCase() === 'approved')
      .reduce((sum, a) => sum + Number(a.days ?? calculateDays(a.start_date, a.end_date)), 0),
  };

  useEffect(() => {
    if (!leaveBalances.length) return;

    const selectedExists = leaveBalances.some((balance) => balance.type === formData.leaveType);
    const selectedStatus = selectedExists
      ? getLeaveTypeStatus(formData.leaveType, leaveBalances)
      : 'no_access';
    if (selectedExists && selectedStatus !== 'no_access') return;

    const nextType = getPreferredLeaveType(leaveBalances, getLeaveTypeStatus);
    setSelectedLeaveType(nextType);
    setFormData((prev) => ({ ...prev, leaveType: nextType }));
  }, [leaveBalances, formData.leaveType, getLeaveTypeStatus]);

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowDateError(false);

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to apply for leave');
      }

      const dateValidation = validateDates(
        formData.startDate,
        formData.endDate,
        formData.leaveType,
        Boolean(formData.isHalfDay)
      );
      if (!dateValidation.isValid) throw new Error(dateValidation.message);

      const days = validateLeaveApplication(formData, leaveBalances);

      await applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        isHalfDay: formData.isHalfDay,
        session: formData.isHalfDay ? formData.halfDaySession : null,
      });

      toast({
        title: 'Submitted Successfully',
        description: `${formData.leaveType} leave request submitted. Duration: ${days} days.`,
        className: 'bg-emerald-50 border border-emerald-200 text-emerald-900',
      });

      await refreshLeaveData();

      const nextType = getPreferredLeaveType(leaveBalances, getLeaveTypeStatus);
      setSelectedLeaveType(nextType);
      setFormData({
        leaveType: nextType,
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
        halfDaySession: 'first',
      });

      setActiveTab('history');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const message = typeof error === 'string' ? error : error?.message || 'Failed to submit leave request';

      if (message.toLowerCase().includes('date')) {
        setDateError(message);
        setShowDateError(true);
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Validation Error
          </div>
        ),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTypeSelect = (type) => {
    const leaveStatus = getLeaveTypeStatus(type, leaveBalances);

    if (leaveStatus === 'no_access') {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Access Required
          </div>
        ),
        description: `${type} leave access is not assigned by admin.`,
        variant: 'destructive',
      });
      return;
    }

    if (leaveStatus === 'no_balance') {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Balance Exhausted
          </div>
        ),
        description: `No remaining ${type} leave balance.`,
        variant: 'destructive',
      });
    }

    setSelectedLeaveType(type);
    setFormData((prev) => ({ ...prev, leaveType: type }));
  };

  return (
    <>
      <Helmet>
        <title>Leave Management - CRM</title>
      </Helmet>
      <MainLayout>
        <div className="mx-auto max-w-7xl space-y-8 p-6">
          <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Leave Management</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Apply for leave and track your applications</p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Clock className="w-3 h-3" />
                  Pending List: {stats.pending}
                </Badge>
                <LeaveTypeSelector activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>

            <LeaveStats stats={stats} />
          </Motion.div>

          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Your Leave Balance</h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Click to select leave type</p>
              </div>
              <Badge variant="outline" className="self-start gap-2 sm:self-center">
                <Info className="w-3 h-3" />
                Leaves without admin access are locked. Unpaid leave is available as unlimited by default.
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {leaveBalances.map((balance, index) => (
                <LeaveBalanceCard
                  key={balance.type}
                  balance={balance}
                  index={index}
                  isSelected={activeTab === 'apply' && balance.type === selectedLeaveType}
                  isAvailable={isLeaveTypeAvailable(balance.type, leaveBalances)}
                  leaveStatus={getLeaveTypeStatus(balance.type, leaveBalances)}
                  onClick={handleLeaveTypeSelect}
                  supportsHalfDay={LEAVE_TYPE_CONFIG[balance.type]?.supportsHalfDay || false}
                />
              ))}
            </div>
          </Motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'apply' ? (
              <Motion.div
                key="apply"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
              >
                <LeaveForm
                  formData={formData}
                  leaveBalances={leaveBalances}
                  isSubmitting={isSubmitting}
                  showDateError={showDateError}
                  dateError={dateError}
                  isLeaveTypeAvailable={isLeaveTypeAvailable}
                  getLeaveTypeStatus={getLeaveTypeStatus}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmit}
                />
              </Motion.div>
            ) : (
              <Motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <LeaveHistoryTable
                  applications={applications}
                  onSwitchToApply={() => setActiveTab('apply')}
                />
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </MainLayout>
    </>
  );
};

export default LeaveApplicationView;
