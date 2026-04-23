import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CheckCircle, Clock, Ban, ChevronRight,
  AlertTriangle, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LEAVE_TYPE_CONFIG } from '../utils/leaveConfig';
import { calculateDays } from '../utils/leaveCalculations';
import { getApprovalTimeText } from '../utils/leaveHelpers';

export const LeaveForm = ({
  formData,
  leaveBalances,
  isSubmitting,
  showDateError,
  dateError,
  isLeaveTypeAvailable,
  getLeaveTypeStatus,
  onFormChange,
  onSubmit
}) => {
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState('first'); // 'first' or 'second'
  
  const config = LEAVE_TYPE_CONFIG[formData.leaveType] || LEAVE_TYPE_CONFIG.Annual;
  const accentSurfaceClass =
    formData.leaveType === 'Annual'
      ? 'dark:border-blue-500/30 dark:from-blue-500/12 dark:to-blue-500/8'
      : formData.leaveType === 'Casual'
        ? 'dark:border-emerald-500/30 dark:from-emerald-500/12 dark:to-emerald-500/8'
        : formData.leaveType === 'Special'
          ? 'dark:border-amber-500/30 dark:from-amber-500/12 dark:to-amber-500/8'
          : 'dark:border-purple-500/30 dark:from-purple-500/12 dark:to-purple-500/8';
  const availableBalance = leaveBalances.find(b => b.type === formData.leaveType);
  const isUnlimited = Boolean(availableBalance?.unlimited);
  const days = calculateDays(formData.startDate, formData.endDate, isHalfDay);
  const leaveStatus = getLeaveTypeStatus(formData.leaveType, leaveBalances);
  const isAvailable = leaveStatus === 'available';
  const hasNoAccess = leaveStatus === 'no_access';
  
  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    onFormChange(newFormData);
  };

  useEffect(() => {
    setIsHalfDay(Boolean(formData.isHalfDay));
    setHalfDaySession(formData.halfDaySession || 'first');
  }, [formData.isHalfDay, formData.halfDaySession]);

  const handleLeaveTypeCycle = () => {
    const leaveTypes = leaveBalances.map((balance) => balance.type);
    if (leaveTypes.length === 0) return;

    const currentIndex = leaveTypes.indexOf(formData.leaveType);
    let nextType = null;
    for (let offset = 1; offset <= leaveTypes.length; offset += 1) {
      const startIndex = currentIndex >= 0 ? currentIndex : -1;
      const candidate = leaveTypes[(startIndex + offset) % leaveTypes.length];
      if (isLeaveTypeAvailable(candidate, leaveBalances)) {
        nextType = candidate;
        break;
      }
    }
    if (!nextType) return;
    
    if (nextType !== formData.leaveType) {
      onFormChange({
        ...formData,
        leaveType: nextType,
        isHalfDay: false,
        halfDaySession: 'first',
      });
      setIsHalfDay(false);
      setHalfDaySession('first');
    }
  };

  const handleHalfDayToggle = () => {
    const nextIsHalfDay = !isHalfDay;
    setIsHalfDay(nextIsHalfDay);
    // If enabling half day, set end date same as start date
    onFormChange({
      ...formData,
      isHalfDay: nextIsHalfDay,
      halfDaySession,
      endDate: nextIsHalfDay && formData.startDate ? formData.startDate : formData.endDate,
    });
  };

  // Check if selected dates are valid for half day (same day)
  const isHalfDayValid = isHalfDay && formData.startDate === formData.endDate;

  return (
    <div className="space-y-6 lg:col-span-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className={cn(
          "p-5 border-b",
          config.borderClass,
          config.gradientClass
        )}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 bg-white rounded-lg flex-shrink-0 dark:bg-slate-800",
                formData.leaveType === 'Annual' && "text-blue-600",
                formData.leaveType === 'Casual' && "text-emerald-600",
                formData.leaveType === 'Special' && "text-amber-600",
                formData.leaveType === 'Unpaid' && "text-purple-600"
              )}>
                {isHalfDay ? <Sun className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <Motion.div
                  key={formData.leaveType + isHalfDay}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-2 mb-1"
                >
                  <h2 className="text-xl font-semibold text-gray-900 truncate dark:text-slate-100">
                    {isHalfDay ? 'Half Day ' : ''}{formData.leaveType} Leave Application
                  </h2>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "border bg-white/80 whitespace-nowrap",
                      "dark:bg-slate-900/80",
                      formData.leaveType === 'Annual' && "border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-300",
                      formData.leaveType === 'Casual' && "border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
                      formData.leaveType === 'Special' && "border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
                      formData.leaveType === 'Unpaid' && "border-purple-200 text-purple-700 dark:border-purple-500/30 dark:text-purple-300"
                    )}
                  >
                    {isUnlimited ? 'Unlimited' : `${availableBalance?.remaining || 0} days left`}
                  </Badge>
                  {isHalfDay && (
                    <Badge 
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    >
                      <Sun className="w-3 h-3 mr-1" />
                      Half Day ({halfDaySession === 'first' ? 'First Half' : 'Second Half'})
                    </Badge>
                  )}
                  {!isAvailable && (
                    <Badge 
                      variant="destructive"
                      className="text-xs text-red-700 bg-red-50"
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      {hasNoAccess ? 'Access Required' : 'No Balance'}
                    </Badge>
                  )}
                </Motion.div>
                <p className="text-sm text-gray-600 truncate dark:text-slate-300">
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-6">
          <AnimatePresence>
            {showDateError && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Date Error</p>
                    <p className="text-xs text-red-700 break-words dark:text-red-300">{dateError}</p>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Half Day Toggle */}
          <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                isHalfDay ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" : "bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
              )}>
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-slate-100">Half Day Leave</Label>
                <p className="text-xs text-gray-500 dark:text-slate-400">Apply for half day leave (same day)</p>
              </div>
            </div>
            <Button
              type="button"
              variant={isHalfDay ? "default" : "outline"}
              size="sm"
              onClick={handleHalfDayToggle}
              className={cn(
                isHalfDay && "bg-amber-500 hover:bg-amber-600"
              )}
            >
              {isHalfDay ? 'Half Day ON' : 'Half Day OFF'}
            </Button>
          </div>

          {/* Session Selection - Only show when half day is enabled */}
          <AnimatePresence>
            {isHalfDay && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <Label className="block mb-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                    Select Session
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setHalfDaySession('first');
                        onFormChange({ ...formData, isHalfDay: true, halfDaySession: 'first' });
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                        halfDaySession === 'first'
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-gray-300 bg-white hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-amber-400/40"
                      )}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-sm font-medium">First Half</span>
                      <span className="text-xs opacity-75">(8am - 12pm)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHalfDaySession('second');
                        onFormChange({ ...formData, isHalfDay: true, halfDaySession: 'second' });
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                        halfDaySession === 'second'
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-gray-300 bg-white hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-amber-400/40"
                      )}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-sm font-medium">Second Half</span>
                      <span className="text-xs opacity-75">(1pm - 5pm)</span>
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "p-3 rounded-xl border",
            config.gradientClass.replace('from-', 'bg-gradient-to-r from-'),
            config.borderClass,
            "dark:border-slate-700 dark:from-slate-800/70 dark:to-slate-800/70"
          )}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0",
                  formData.leaveType === 'Annual' && "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
                  formData.leaveType === 'Casual' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
                  formData.leaveType === 'Special' && "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
                  formData.leaveType === 'Unpaid' && "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
                )}>
                  {isHalfDay ? <Sun className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">Selected Leave Type</p>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-xs truncate",
                      formData.leaveType === 'Annual' && "text-blue-600",
                      formData.leaveType === 'Casual' && "text-emerald-600",
                      formData.leaveType === 'Special' && "text-amber-600",
                      formData.leaveType === 'Unpaid' && "text-purple-600"
                    )}>
                      {isHalfDay ? 'Half Day ' : ''}{formData.leaveType} Leave
                    </p>
                    {!isAvailable && (
                      <Badge variant="destructive" className="text-xs px-2 py-0.5">
                        {hasNoAccess ? 'Access Required' : 'No Balance'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLeaveTypeCycle}
                className={cn(
                  "gap-2 w-full sm:w-auto mt-2 sm:mt-0",
                  config.borderClass,
                  formData.leaveType === 'Annual' && "text-blue-600 hover:bg-blue-50",
                  formData.leaveType === 'Casual' && "text-emerald-600 hover:bg-emerald-50",
                  formData.leaveType === 'Special' && "text-amber-600 hover:bg-amber-50",
                  formData.leaveType === 'Unpaid' && "text-purple-600 hover:bg-purple-50",
                  "dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
                )}
              >
                <ChevronRight className="w-3 h-3" />
                Change Type
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-slate-100">Select Dates</Label>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                {isHalfDay 
                  ? 'Choose the date for your half day leave' 
                  : 'Choose your leave period (dates cannot be in the past)'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Start Date</Label>
                </div>
                <div className="relative">
                  <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      const nextStartDate = e.target.value;
                      // For half day, automatically set end date to same as start date
                      if (isHalfDay) {
                        onFormChange({
                          ...formData,
                          startDate: nextStartDate,
                          endDate: nextStartDate,
                          isHalfDay: true,
                          halfDaySession,
                        });
                        return;
                      }
                      handleInputChange('startDate', nextStartDate);
                    }}
                    className="w-full h-10 pl-9 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Cannot be a past date</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">End Date</Label>
                  {isHalfDay && (
                    <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30">
                      Same as start date for half day
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full h-10 pl-9 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    disabled={!formData.startDate || isHalfDay}
                    readOnly={isHalfDay}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {isHalfDay 
                    ? 'Auto-set to match start date for half day' 
                    : formData.startDate ? 'Select end date' : 'Select start date first'}
                </p>
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-3 border rounded-xl",
                  isHalfDay && !isHalfDayValid && "border-red-300 bg-red-50",
                  config.borderClass,
                  config.gradientClass.replace('from-', 'bg-gradient-to-r from-'),
                  !isHalfDayValid ? '' : accentSurfaceClass
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {isHalfDay ? <Sun className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        Total Duration
                      </p>
                      <p className={cn(
                        "text-xs",
                        isHalfDay ? "text-amber-600" : 
                        formData.leaveType === 'Annual' ? "text-blue-600" :
                        formData.leaveType === 'Casual' ? "text-emerald-600" :
                        formData.leaveType === 'Special' ? "text-amber-600" :
                        "text-purple-600"
                      )}>
                        {isHalfDay ? '0.5' : days} working {isHalfDay ? 'day' : 'days'}
                        {isHalfDay && ` (${halfDaySession === 'first' ? 'First' : 'Second'} half)`}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-lg font-bold text-right sm:text-left",
                    isHalfDay ? "text-amber-700" :
                    formData.leaveType === 'Annual' ? "text-blue-700" :
                    formData.leaveType === 'Casual' ? "text-emerald-700" :
                    formData.leaveType === 'Special' ? "text-amber-700" :
                    "text-purple-700"
                  )}>
                    {isHalfDay ? '0.5' : days}
                    <span className="ml-1 text-xs font-normal">days</span>
                  </div>
                </div>
                
                {isHalfDay && !isHalfDayValid && (
                    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-2 dark:border-red-500/30 dark:bg-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        For half day leave, start date and end date must be the same day.
                      </p>
                    </div>
                  </div>
                )}
                
                {isAvailable && !isHalfDay && !isUnlimited && (
                  <div className="mt-3">
                    <div className="mb-1 flex flex-col gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-300">
                      <span className="truncate">Available balance: {availableBalance?.remaining || 0} days</span>
                      <span className="truncate">After this: {(availableBalance?.remaining || 0) - days} days</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300",
                          formData.leaveType === 'Annual' ? "bg-blue-500" :
                          formData.leaveType === 'Casual' ? "bg-emerald-500" :
                          formData.leaveType === 'Special' ? "bg-amber-500" :
                          "bg-purple-500"
                        )}
                        style={{ 
                          width: `${(((availableBalance?.used || 0) + days) / (availableBalance?.total || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {isAvailable && isHalfDay && !isUnlimited && (
                  <div className="mt-3">
                    <div className="mb-1 flex flex-col gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-300">
                      <span className="truncate">Available balance: {availableBalance?.remaining || 0} days</span>
                      <span className="truncate">After this: {(availableBalance?.remaining || 0) - 0.5} days</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300",
                          formData.leaveType === 'Annual' ? "bg-blue-500" :
                          formData.leaveType === 'Casual' ? "bg-emerald-500" :
                          formData.leaveType === 'Special' ? "bg-amber-500" :
                          "bg-purple-500"
                        )}
                        style={{ 
                          width: `${(((availableBalance?.used || 0) + 0.5) / (availableBalance?.total || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {isAvailable && isUnlimited && (
                  <div className="mt-3 rounded-lg border border-purple-100 bg-purple-50 p-2 dark:border-purple-500/30 dark:bg-purple-500/10">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Unlimited unpaid leave is available. This request will be submitted for approval.
                    </p>
                  </div>
                )}
                
                {!isAvailable && (
                  <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-2 dark:border-red-500/30 dark:bg-red-500/10">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        {hasNoAccess
                          ? `${formData.leaveType} leave access is not assigned by admin.`
                          : `No ${formData.leaveType} leave balance available. Please select another leave type.`}
                      </p>
                    </div>
                  </div>
                )}
              </Motion.div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Reason for Leave
              </Label>
              <span className="text-xs text-right text-gray-500 dark:text-slate-400">
                {formData.reason.length}/500 characters
              </span>
            </div>
            <textarea
              className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 p-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder={isHalfDay ? `Enter reason for half day ${formData.leaveType.toLowerCase()} leave...` : config.placeholder}
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value.slice(0, 500))}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isHalfDay ? 'Please specify which session you need and the reason' : config.hint}
            </p>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full py-3 text-sm font-medium transition-all duration-200",
                isHalfDay ? "bg-amber-500 hover:bg-amber-600" : config.buttonClass,
                !isAvailable && "opacity-50 cursor-not-allowed hover:opacity-50",
                (isHalfDay && !isHalfDayValid) && "opacity-50 cursor-not-allowed hover:opacity-50"
              )}
              disabled={
                isSubmitting || 
                !isAvailable ||
                (isHalfDay && !isHalfDayValid)
              }
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : !isAvailable ? (
                <div className="flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" />
                  <span>
                    {hasNoAccess
                      ? `${formData.leaveType} Leave Access Not Assigned`
                      : `No ${formData.leaveType} Leave Balance Available`}
                  </span>
                </div>
              ) : isHalfDay ? (
                <div className="flex items-center justify-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>
                    Submit Half Day {formData.leaveType} Leave Request
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formData.leaveType === 'Unpaid' 
                      ? "Submit Unpaid Leave Request" 
                      : `Submit ${formData.leaveType} Leave Application`}
                  </span>
                </div>
              )}
            </Button>
            {!isAvailable && (
              <p className="mt-2 text-xs text-center text-red-600 dark:text-red-300">
                {hasNoAccess
                  ? 'This leave type is locked. Contact admin to assign leave access.'
                  : 'This leave type has no remaining balance.'}
              </p>
            )}
            <p className={cn(
              "mt-2 text-xs text-center",
              !isAvailable ? "text-red-500 dark:text-red-300" : "text-gray-500 dark:text-slate-400"
            )}>
              {getApprovalTimeText(formData.leaveType, isHalfDay)}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
