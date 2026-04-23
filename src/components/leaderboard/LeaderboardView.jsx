import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Loader2,
  Medal,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const LEADERBOARD_STORAGE_KEY = 'leaderboardPerformance';

const getPositionIcon = (position) => {
  if (position === 1) {
    return <Trophy className="w-5 h-5 text-amber-500" />;
  }

  if (position === 2) {
    return <Medal className="w-5 h-5 text-slate-500" />;
  }

  if (position === 3) {
    return <Medal className="w-5 h-5 text-orange-500" />;
  }

  return (
    <span className="inline-flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 rounded-full w-7 h-7">
      {position}
    </span>
  );
};

const getProgressBarClass = (progress) => {
  if (progress >= 100) {
    return 'bg-green-500';
  }

  if (progress >= 75) {
    return 'bg-blue-500';
  }

  if (progress >= 50) {
    return 'bg-amber-400';
  }

  return 'bg-red-400';
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const getEmployeeDepartment = (employee) =>
  employee?.professional?.department
  || employee?.teamName
  || employee?.professional?.teamName
  || employee?.department
  || '';

const getEmployeeId = (employee) => String(employee?._id || employee?.id || employee?.employeeId || '');

const isSalesDepartment = (employee) => {
  const department = normalizeValue(getEmployeeDepartment(employee));

  return department === 'sales' || department === 'sales department';
};

const isSalesLeaderboardEmployee = (employee) =>
  isSalesDepartment(employee) && normalizeValue(employee?.role || 'employee') === 'employee';

const mapHierarchyMemberForLeaderboard = (member = {}, teamName = '') => ({
  _id: member?._id || member?.id || '',
  id: member?.id || member?._id || '',
  employeeId: member?.employeeId || member?.professional?.employeeId || '',
  name: member?.name || member?.fullName || member?.userName || 'Employee',
  email: member?.email || '',
  role: member?.role || 'employee',
  designation: member?.designation || member?.professional?.designation || '',
  department: member?.department || member?.professional?.department || teamName,
  teamName,
  professional: {
    ...(member?.professional || {}),
    department: member?.professional?.department || teamName,
    employeeId: member?.professional?.employeeId || member?.employeeId || '',
    designation: member?.professional?.designation || member?.designation || '',
  },
});

const extractSalesEmployeesFromHierarchy = (payload = {}) =>
  (Array.isArray(payload?.teams) ? payload.teams : [])
    .filter((team) => normalizeValue(team?.teamName) === 'sales')
    .flatMap((team) =>
      (Array.isArray(team?.members) ? team.members : []).map((member) =>
        mapHierarchyMemberForLeaderboard(member, team?.teamName || 'Sales')
      )
    );

const mergeEmployeeSources = (...sources) => {
  const employeeMap = new Map();

  sources.flat().forEach((employee) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) {
      return;
    }

    employeeMap.set(employeeId, {
      ...(employeeMap.get(employeeId) || {}),
      ...employee,
    });
  });

  return Array.from(employeeMap.values());
};

const getSalesEmployeeIdSet = (employees = []) =>
  new Set(
    (Array.isArray(employees) ? employees : [])
      .filter(isSalesLeaderboardEmployee)
      .map((employee) => getEmployeeId(employee))
      .filter(Boolean)
  );

const filterLeaderboardItems = (items = [], employees = []) => {
  const salesEmployeeIds = getSalesEmployeeIdSet(employees);

  return (Array.isArray(items) ? items : []).filter((item) => {
    const itemEmployeeId = String(item?.employeeId || item?._id || item?.id || '');

    if (salesEmployeeIds.size > 0 && itemEmployeeId) {
      return salesEmployeeIds.has(itemEmployeeId)
        && normalizeValue(item?.role || 'employee') === 'employee';
    }

    return isSalesLeaderboardEmployee(item);
  });
};

const buildSummary = (employees = []) => {
  const totalTarget = employees.reduce((sum, item) => sum + toNumber(item?.target), 0);
  const totalAchieved = employees.reduce((sum, item) => sum + toNumber(item?.achieved), 0);
  const percentage = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  return {
    totalTarget,
    totalAchieved,
    percentage,
  };
};

const isLeaderboardEndpointMissing = (error) => {
  const status = Number(error?.response?.status || 0);
  return status === 404 || status === 405;
};

const readLeaderboardStore = () => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeLeaderboardStore = (store) => {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(store || {}));
};

const mapEmployeeForLeaderboard = (employee) => ({
  employeeId: getEmployeeId(employee),
  name: employee?.name || employee?.fullName || employee?.userName || 'Employee',
  email: employee?.email || '',
  role: employee?.role || 'employee',
  employeeCode:
    employee?.professional?.employeeId
    || employee?.employeeCode
    || '',
  designation:
    employee?.professional?.designation
    || employee?.designation
    || '',
  department: getEmployeeDepartment(employee),
});

const mergePerformanceWithEmployees = (employees = [], store = {}, currentUser = null) => {
  const mappedEmployees = Array.isArray(employees) ? employees.map(mapEmployeeForLeaderboard) : [];
  const employeeById = new Map(mappedEmployees.filter((item) => item.employeeId).map((item) => [item.employeeId, item]));

  Object.entries(store || {}).forEach(([employeeId, perf]) => {
    if (employeeById.has(employeeId)) {
      return;
    }

    employeeById.set(employeeId, {
      employeeId,
      name: perf?.name || 'Employee',
      email: perf?.email || '',
      role: perf?.role || 'employee',
      employeeCode: perf?.employeeCode || '',
      designation: perf?.designation || '',
      department: perf?.department || '',
    });
  });

  const userId = String(currentUser?._id || currentUser?.id || '');
  if (userId && !employeeById.has(userId) && isSalesLeaderboardEmployee(currentUser)) {
    employeeById.set(userId, {
      employeeId: userId,
      name: currentUser?.name || currentUser?.userName || 'You',
      email: currentUser?.email || '',
      role: currentUser?.role || 'employee',
      employeeCode: currentUser?.professional?.employeeId || '',
      designation: currentUser?.professional?.designation || '',
      department: currentUser?.professional?.department || currentUser?.department || '',
    });
  }

  return Array.from(employeeById.values())
    .filter(isSalesLeaderboardEmployee)
    .map((employee) => {
      const performance = store?.[employee.employeeId] || {};
      const target = Math.max(0, toNumber(performance?.target));
      const achieved = Math.max(0, toNumber(performance?.achieved));
      const progress = target > 0 ? Math.round((achieved / target) * 100) : 0;

      return {
        ...employee,
        target,
        achieved,
        progress,
        updatedBy: performance?.updatedBy || '',
        updatedAt: performance?.updatedAt || '',
      };
    });
};

const StatCard = ({ title, value, helper, icon, tone }) => (
  <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
        <p className="mt-1 text-xs text-gray-500">{helper}</p>
      </div>
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50">
        {React.createElement(icon, { className: `w-6 h-6 ${tone}` })}
      </div>
    </div>
  </div>
);

const LeaderboardView = ({ canManage = false }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalTarget: 0,
    totalAchieved: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [target, setTarget] = useState('');
  const [achieved, setAchieved] = useState('');

  const rankedItems = useMemo(() => {
    const normalized = (Array.isArray(items) ? items : []).map((item) => {
      const targetValue = Math.max(0, toNumber(item?.target));
      const achievedValue = Math.max(0, toNumber(item?.achieved));
      const completion = targetValue > 0 ? (achievedValue / targetValue) * 100 : 0;
      const normalizedProgress = Math.round(completion);

      return {
        ...item,
        target: targetValue,
        achieved: achievedValue,
        progress: normalizedProgress,
        completion: normalizedProgress,
      };
    });

    return normalized
      .sort((left, right) => {
        const completionDiff = right.completion - left.completion;
        if (completionDiff !== 0) {
          return completionDiff;
        }

        const achievedDiff = right.achieved - left.achieved;
        if (achievedDiff !== 0) {
          return achievedDiff;
        }

        return String(left.name || '').localeCompare(String(right.name || ''));
      })
      .map((item, index) => ({
        ...item,
        position: index + 1,
      }));
  }, [items]);

  const derivedSummary = useMemo(() => {
    const totalTarget = rankedItems.reduce((sum, item) => sum + toNumber(item.target), 0);
    const totalAchieved = rankedItems.reduce((sum, item) => sum + toNumber(item.achieved), 0);
    const percentage = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

    return {
      totalTarget,
      totalAchieved,
      percentage,
    };
  }, [rankedItems]);

  const effectiveSummary = rankedItems.length > 0 ? derivedSummary : summary;

  const loadLeaderboard = useCallback(async () => {
    let employees = [];

    try {
      setIsLoading(true);
      const [leaderboardResult, employeesResult] = await Promise.allSettled([
        api.get('/leaderboard'),
        api.get('/admin/employee'),
      ]);
      const hierarchyResult = await Promise.allSettled([api.get('/hierarchy/overview')]);

      if (employeesResult.status === 'fulfilled') {
        const employeeData = employeesResult.value?.data;
        employees = Array.isArray(employeeData)
          ? employeeData
          : employeeData?.employees || employeeData?.items || [];
      }

      const hierarchyEmployees =
        hierarchyResult[0]?.status === 'fulfilled'
          ? extractSalesEmployeesFromHierarchy(hierarchyResult[0].value?.data)
          : [];

      employees = mergeEmployeeSources(employees, hierarchyEmployees);

      if (leaderboardResult.status !== 'fulfilled') {
        throw leaderboardResult.reason;
      }

      const data = leaderboardResult.value?.data;
      const apiItems = filterLeaderboardItems(data?.items, employees);
      const seedStore = readLeaderboardStore();
      apiItems.forEach((item) => {
        const employeeId = String(item?.employeeId || '');
        if (!employeeId) {
          return;
        }

        seedStore[employeeId] = {
          ...(seedStore[employeeId] || {}),
          target: toNumber(item?.target),
          achieved: toNumber(item?.achieved),
          updatedBy: item?.updatedBy || seedStore[employeeId]?.updatedBy || '',
          updatedAt: item?.updatedAt || seedStore[employeeId]?.updatedAt || '',
          name: item?.name || seedStore[employeeId]?.name || '',
          email: item?.email || seedStore[employeeId]?.email || '',
          role: item?.role || seedStore[employeeId]?.role || 'employee',
          employeeCode: item?.employeeCode || seedStore[employeeId]?.employeeCode || '',
          designation: item?.designation || seedStore[employeeId]?.designation || '',
          department: item?.department || seedStore[employeeId]?.department || '',
        };
      });
      writeLeaderboardStore(seedStore);

      const mergedItems = mergePerformanceWithEmployees(employees, seedStore, currentUser);
      setItems(mergedItems);
      setSummary(buildSummary(mergedItems));
    } catch (error) {
      if (!isLeaderboardEndpointMissing(error)) {
        console.error('Error loading leaderboard:', error);
        toast({
          title: 'Leaderboard load failed',
          description: error.response?.data?.message || error.message || 'Unable to load leaderboard data.',
          variant: 'destructive',
        });
        setItems([]);
        setSummary({
          totalTarget: 0,
          totalAchieved: 0,
          percentage: 0,
        });
      }

      const localStore = readLeaderboardStore();

      const fallbackItems = mergePerformanceWithEmployees(employees, localStore, currentUser);
      setItems(fallbackItems);
      setSummary(buildSummary(fallbackItems));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'Employee required',
        description: 'Select an employee before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (target === '' && achieved === '') {
      toast({
        title: 'No changes to save',
        description: 'Enter target or achieved value before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        employeeId: selectedEmployeeId,
        ...(target !== '' ? { target: Number(target) } : {}),
        ...(achieved !== '' ? { achieved: Number(achieved) } : {}),
        updatedBy: currentUser?.name || currentUser?.userName || 'System',
      };

      try {
        await api.put('/leaderboard/performance', payload);
      } catch (error) {
        if (!isLeaderboardEndpointMissing(error)) {
          throw error;
        }

        const selectedEmployee = rankedItems.find((item) => String(item.employeeId) === String(selectedEmployeeId));
        const existing = readLeaderboardStore();
        const currentEntry = existing[selectedEmployeeId] || {};

        existing[selectedEmployeeId] = {
          ...currentEntry,
          target: target !== '' ? Number(target) : toNumber(currentEntry?.target || selectedEmployee?.target || 0),
          achieved: achieved !== '' ? Number(achieved) : toNumber(currentEntry?.achieved || selectedEmployee?.achieved || 0),
          updatedBy: payload.updatedBy,
          updatedAt: new Date().toISOString(),
          name: selectedEmployee?.name || currentEntry?.name || 'Employee',
          email: selectedEmployee?.email || currentEntry?.email || '',
          role: selectedEmployee?.role || currentEntry?.role || 'employee',
          employeeCode: selectedEmployee?.employeeCode || currentEntry?.employeeCode || '',
          designation: selectedEmployee?.designation || currentEntry?.designation || '',
          department: selectedEmployee?.department || currentEntry?.department || '',
        };

        writeLeaderboardStore(existing);
      }

      toast({
        title: 'Performance updated',
        description: 'Leaderboard rankings updated by target completion.',
      });

      setIsOpen(false);
      setSelectedEmployeeId('');
      setTarget('');
      setAchieved('');
      await loadLeaderboard();
    } catch (error) {
      console.error('Error updating leaderboard performance:', error);
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message || 'Unable to save leaderboard performance.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto text-blue-600 animate-spin" />
          <p className="mt-3 text-sm text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 mx-auto space-y-5 sm:p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Rankings are generated from performance data and refreshed after each update.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            Update Performance
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Lead Target"
          value={effectiveSummary.totalTarget}
          helper={`${rankedItems.length} sales employees ranked`}
          icon={Target}
          tone="text-blue-600"
        />
        <StatCard
          title="Achieved Leads"
          value={effectiveSummary.totalAchieved}
          helper="Saved leaderboard achievements"
          icon={Users}
          tone="text-green-600"
        />
        <StatCard
          title="Progress"
          value={`${effectiveSummary.percentage}%`}
          helper="Overall leaderboard completion"
          icon={BarChart3}
          tone="text-violet-600"
        />
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Team Performance Rankings</h2>
          <p className="mt-1 text-xs text-gray-500">
            Sales department employees are ranked here by performance.
          </p>
        </div>

        {rankedItems.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">No Sales employees found for leaderboard</p>
            <p className="mt-1 text-xs text-gray-500">
              Create Sales employee records first, then update their performance.
            </p>
          </div>
        ) : (
          <>
            <div className="block sm:hidden">
              {rankedItems.map((item) => {
                const isCurrentUser = String(item.employeeId) === String(currentUser?._id || currentUser?.id || '');
                return (
                  <div
                    key={item.employeeId}
                    className={`px-4 py-4 border-b border-gray-100 ${
                      isCurrentUser ? 'bg-blue-50/60' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getPositionIcon(item.position)}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.employeeCode || item.designation || item.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="text-sm font-semibold text-gray-900">{item.target}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Achieved</p>
                        <p className="text-sm font-semibold text-gray-900">{item.achieved}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                        <div
                          className={`h-2 rounded-full ${getProgressBarClass(item.progress)}`}
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-gray-600">Rank</th>
                    <th className="px-5 py-3 text-left text-gray-600">Employee</th>
                    <th className="px-5 py-3 text-left text-gray-600">Target</th>
                    <th className="px-5 py-3 text-left text-gray-600">Achieved</th>
                    <th className="px-5 py-3 text-left text-gray-600">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedItems.map((item) => {
                    const isCurrentUser = String(item.employeeId) === String(currentUser?._id || currentUser?.id || '');
                    return (
                      <tr
                        key={item.employeeId}
                        className={`border-t border-gray-100 ${isCurrentUser ? 'bg-blue-50/50' : 'bg-white'}`}
                      >
                        <td className="px-5 py-4">{getPositionIcon(item.position)}</td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.employeeCode || item.designation || item.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{item.target}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{item.achieved}</td>
                        <td className="px-5 py-4 min-w-[220px]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{item.progress}% complete</span>
                              {item.updatedBy ? <span>Updated by {item.updatedBy}</span> : null}
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                              <div
                                className={`h-2 rounded-full ${getProgressBarClass(item.progress)}`}
                                style={{ width: `${Math.min(item.progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {canManage && isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Performance</h2>
              <p className="mt-1 text-sm text-gray-500">
                Target and achieved values saved here recalculate the leaderboard immediately.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select an employee</option>
                  {rankedItems.map((item) => (
                    <option key={item.employeeId} value={item.employeeId}>
                      {item.name} {item.employeeCode ? `(${item.employeeCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Target</label>
                <input
                  type="number"
                  min="0"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Leave empty to keep current target"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Achieved</label>
                <input
                  type="number"
                  min="0"
                  value={achieved}
                  onChange={(event) => setAchieved(event.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Leave empty to keep current achieved count"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 mt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeaderboardView;
