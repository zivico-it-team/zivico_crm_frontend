import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Hash,
  Loader2,
  Mail,
  Search,
  Square,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';

import api from '@/lib/api';
import { useLeads } from '@/contexts/LeadsContext';

const normalizeAssignedTo = (assignedTo) => {
  if (!assignedTo) {
    return null;
  }

  if (typeof assignedTo === 'string') {
    const value = assignedTo.trim();
    if (!value || value.toLowerCase() === 'unassigned') {
      return null;
    }
    return value;
  }

  return (
    assignedTo?.name
    || assignedTo?.fullName
    || assignedTo?.userName
    || assignedTo?.email
    || null
  );
};

const ASSIGNED_LEAD_POOL = 'SL_EMP_ASSIGNED';
const UNASSIGNED_LEAD_POOL = 'SL_EMP_UNASSIGNED';

const normalizeLeadPool = (leadPool) => String(leadPool || '').trim().toUpperCase();

const getAssignmentStatus = ({ assignedTo, assignedToId, leadPool, wasEverAssigned }) => {
  const normalizedLeadPool = normalizeLeadPool(leadPool);
  const hasCurrentAssignment = Boolean(normalizeAssignedTo(assignedTo)) || Boolean(String(assignedToId || '').trim());
  if (hasCurrentAssignment || normalizedLeadPool === ASSIGNED_LEAD_POOL) {
    return 'assigned';
  }
  if (Boolean(wasEverAssigned)) {
    return 'unassigned';
  }
  return 'available';
};

const mapApiLead = (lead) => {
  const assignedTo = normalizeAssignedTo(lead?.assignedTo);
  const assignedToId = String(lead?.assignedToId || '');
  const wasEverAssigned = Boolean(lead?.wasEverAssigned) || Boolean(assignedTo) || Boolean(assignedToId);
  const status = getAssignmentStatus({
    assignedTo: lead?.assignedTo,
    assignedToId,
    leadPool: lead?.leadPool,
    wasEverAssigned,
  });
  const isAssigned = status === 'assigned';

  return {
    id: lead?._id || lead?.id || '',
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    uploadedBy: lead?.uploadedBy || 'System',
    assignedTo,
    assignedToId,
    wasEverAssigned,
    assignedDate: lead?.assignedDate || null,
    campaign: lead?.campaign || '',
    leadPool: lead?.leadPool || (isAssigned ? ASSIGNED_LEAD_POOL : UNASSIGNED_LEAD_POOL),
    status,
    stage: lead?.stage || '',
    tag: lead?.tag || '',
    createdAt: lead?.createdAt || new Date().toISOString(),
  };
};

const mapEmployee = (employee) => ({
  id: employee?._id || employee?.id || '',
  name: employee?.name || employee?.fullName || employee?.userName || 'Employee',
  email: employee?.email || '',
  department: employee?.department || employee?.professional?.department || employee?.professional?.teamName || '',
  avatar: null,
});

const normalizeEmployeeValue = (value) => String(value || '').trim().toLowerCase();

const isSalesDepartmentEmployee = (employee) => {
  const role = normalizeEmployeeValue(employee?.role || 'employee');
  const department = normalizeEmployeeValue(
    employee?.department || employee?.professional?.department || employee?.professional?.teamName,
  );

  return role === 'employee' && department.includes('sales');
};

const isMissingEndpoint = (error) => {
  const status = Number(error?.response?.status || 0);
  return status === 404 || status === 405;
};

const matchesLeadFilter = (lead, leadFilter) => {
  const isAssigned = lead.status === 'assigned';
  const isUnassigned = lead.status === 'unassigned';
  const isNewLead = lead.status === 'available';
  const stage = String(lead?.stage || '').trim().toLowerCase();
  const tag = String(lead?.tag || '').trim().toLowerCase();
  const isSaleDoneLead =
    stage === 'converted'
    || stage === 'sale done'
    || tag === 'sale done'
    || tag === 'converted'
    || tag === 'existing client (invested)';

  return (
    leadFilter === 'all'
    || (leadFilter === 'assigned' && isAssigned)
    || (leadFilter === 'unassigned' && isUnassigned)
    || (leadFilter === 'new' && isNewLead)
    || (leadFilter === 'sale_done' && isSaleDoneLead)
  );
};

const AssignLead = () => {
  const { leads: contextLeads, refreshLeads, assignLeadsToEmployee, unassignLeads } = useLeads();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [leadFilter, setLeadFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [isLeadLoading, setIsLeadLoading] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSelectionMode, setPageSelectionMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [counts, setCounts] = useState({ total: 0, assigned: 0, unassigned: 0 });
  const newLeadCount = Math.max(0, Number(counts.total || 0) - Number(counts.assigned || 0));

  const getFallbackSourceLeads = useCallback(async () => {
    if (Array.isArray(contextLeads) && contextLeads.length > 0) {
      return contextLeads.map(mapApiLead);
    }

    const refreshed = await refreshLeads();
    if (Array.isArray(refreshed) && refreshed.length > 0) {
      return refreshed.map(mapApiLead);
    }
    return [];
  }, [contextLeads, refreshLeads]);

  const computeCountsFromLeads = useCallback((sourceLeads) => {
    const safeLeads = Array.isArray(sourceLeads) ? sourceLeads : [];
    const assigned = safeLeads.filter((lead) => lead.status === 'assigned').length;
    const unassigned = safeLeads.filter((lead) => lead.status === 'unassigned').length;
    return {
      total: safeLeads.length,
      assigned,
      unassigned,
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsEmployeeLoading(true);
    try {
      const { data } = await api.get('/leads/assign/employees');
      const items = Array.isArray(data) ? data : data?.employees || [];
      setEmployees(
        items
          .filter(isSalesDepartmentEmployee)
          .map(mapEmployee)
          .filter((item) => item.id),
      );
    } catch {
      try {
        const { data } = await api.get('/admin/employee');
        const items = Array.isArray(data) ? data : data?.items || [];
        const fallbackEmployees = items
          .filter(isSalesDepartmentEmployee)
          .map(mapEmployee)
          .filter((item) => item.id);

        setEmployees(fallbackEmployees);
      } catch (fallbackError) {
        console.error('Error loading assign employees:', fallbackError);
        showToast(fallbackError?.response?.data?.message || 'Failed to load employees', 'error');
      }
    } finally {
      setIsEmployeeLoading(false);
    }
  }, [showToast]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get('/leads/assign/stats');
      setCounts({
        total: Number(data?.total) || 0,
        assigned: Number(data?.assigned) || 0,
        unassigned: Number(data?.unassigned) || 0,
      });
    } catch {
      const localCounts = computeCountsFromLeads((Array.isArray(contextLeads) ? contextLeads : []).map(mapApiLead));
      setCounts(localCounts);
    }
  }, [computeCountsFromLeads, contextLeads]);

  const loadLeads = useCallback(async () => {
    setIsLeadLoading(true);
    try {
      const { data } = await api.get('/leads/assign', {
        params: {
          filter: leadFilter,
          search: debouncedSearch,
          page: currentPage,
          limit: rowsPerPage,
        },
      });

      const items = Array.isArray(data?.items) ? data.items : [];
      const mappedItems = items.map(mapApiLead).filter((lead) => matchesLeadFilter(lead, leadFilter));
      setLeads(mappedItems);
      setTotalPages(Math.max(1, Number(data?.pages) || 1));
      setSelectedLeads([]);
      setPageSelectionMode(false);
    } catch {
      const fallbackLeads = await getFallbackSourceLeads();
      const searchValue = debouncedSearch.trim().toLowerCase();

      const filtered = fallbackLeads.filter((lead) => {
        const matchesSearch =
          searchValue === ''
          || [lead.name, lead.email, lead.phone, lead.assignedTo, lead.uploadedBy, lead.stage, lead.tag]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchValue));

        return matchesLeadFilter(lead, leadFilter) && matchesSearch;
      });

      const pages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
      const safePage = Math.min(currentPage, pages);
      const start = (safePage - 1) * rowsPerPage;
      const paged = filtered.slice(start, start + rowsPerPage);

      setCurrentPage(safePage);
      setLeads(paged);
      setTotalPages(pages);
      setCounts(computeCountsFromLeads(fallbackLeads));
      setSelectedLeads([]);
      setPageSelectionMode(false);
    } finally {
      setIsLeadLoading(false);
    }
  }, [computeCountsFromLeads, currentPage, debouncedSearch, getFallbackSourceLeads, leadFilter, rowsPerPage]);

  useEffect(() => {
    loadEmployees();
    loadStats();
  }, [loadEmployees, loadStats]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleEmployeeChange = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDropdown(false);
  };

  const handleLeadSelect = (leadId) => {
    if (pageSelectionMode) {
      const currentPageIds = leads.map((lead) => lead.id);
      setSelectedLeads((prev) =>
        currentPageIds.every((id) => prev.includes(id))
          ? prev.filter((id) => !currentPageIds.includes(id))
          : [...new Set([...prev, ...currentPageIds])]
      );
    } else {
      setSelectedLeads((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    }
  };

  const handleSelectAllPage = () => {
    const currentPageIds = leads.map((lead) => lead.id);
    setPageSelectionMode(true);
    setSelectedLeads((prev) => [...new Set([...prev, ...currentPageIds])]);
  };

  const handleClearPageSelection = () => {
    const currentPageIds = leads.map((lead) => lead.id);
    setPageSelectionMode(false);
    setSelectedLeads((prev) => prev.filter((id) => !currentPageIds.includes(id)));
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      showToast('Select an employee first', 'error');
      return;
    }
    if (selectedLeads.length === 0) {
      showToast('Select at least one lead', 'error');
      return;
    }

    setIsLoading(true);
    try {
      try {
        await api.post('/leads/assign', {
          employeeName: selectedEmployee.name,
          employeeId: selectedEmployee.id,
          leadIds: selectedLeads,
        });
      } catch (error) {
        if (!isMissingEndpoint(error)) {
          throw error;
        }

        assignLeadsToEmployee(selectedLeads, selectedEmployee);
      }

      showToast(`${selectedLeads.length} leads assigned to ${selectedEmployee.name}`, 'success');
      await Promise.all([loadLeads(), loadStats(), refreshLeads()]);
    } catch (error) {
      console.error('Error assigning leads:', error);
      showToast(error?.response?.data?.message || 'Failed to assign leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (selectedLeads.length === 0) {
      showToast('Select at least one lead', 'error');
      return;
    }

    setIsLoading(true);
    try {
      try {
        await api.post('/leads/unassign', {
          leadIds: selectedLeads,
        });
      } catch (error) {
        if (!isMissingEndpoint(error)) {
          throw error;
        }

        unassignLeads(selectedLeads);
      }

      showToast(`${selectedLeads.length} leads unassigned`, 'success');
      await Promise.all([loadLeads(), loadStats(), refreshLeads()]);
    } catch (error) {
      console.error('Error unassigning leads:', error);
      showToast(error?.response?.data?.message || 'Failed to unassign leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => name?.charAt(0).toUpperCase() || '?';

  const TableRow = ({ lead }) => (
    <tr
      onClick={() => handleLeadSelect(lead.id)}
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedLeads.includes(lead.id) ? 'bg-blue-50/50' : ''
      }`}
    >
      <td className="px-2 sm:px-3 py-2.5 sm:py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selectedLeads.includes(lead.id)}
          onChange={() => handleLeadSelect(lead.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-2 sm:px-3 py-2.5 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
          <span className="text-[10px] sm:text-xs font-medium">{lead.id.slice(-6)}</span>
        </div>
      </td>
      <td className="px-2 sm:px-3 py-2.5 sm:py-3">
        <span className="text-[10px] sm:text-xs block max-w-[100px] sm:max-w-[160px] truncate" title={lead.name}>
          {lead.name}
        </span>
      </td>
      <td className="px-2 sm:px-3 py-2.5 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
          <span className="text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-[180px]" title={lead.email}>
            {lead.email}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell px-2 sm:px-3 py-2.5 sm:py-3">
        <span className="text-[10px] sm:text-xs">{lead.uploadedBy}</span>
      </td>
      <td className="px-2 sm:px-3 py-2.5 sm:py-3">
        {!lead.assignedTo ? (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-xs text-yellow-800 bg-yellow-100 rounded-full whitespace-nowrap">
            <UserX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Unassigned</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-xs text-green-800 bg-green-100 rounded-full">
            <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="truncate max-w-[60px] sm:max-w-[100px]" title={lead.assignedTo}>
              {lead.assignedTo}
            </span>
          </span>
        )}
      </td>
      <td className="hidden lg:table-cell px-2 sm:px-3 py-2.5 sm:py-3">
        {lead.assignedDate && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
            <span className="text-[10px] sm:text-xs truncate max-w-[100px]">{lead.assignedDate}</span>
          </div>
        )}
      </td>
      <td className="hidden lg:table-cell px-2 sm:px-3 py-2.5 sm:py-3">
        <span
          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-xs rounded-full whitespace-nowrap ${
            lead.status === 'assigned' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {lead.leadPool}
        </span>
      </td>
    </tr>
  );

  const MobileLeadCard = ({ lead }) => (
    <div
      onClick={() => handleLeadSelect(lead.id)}
      className={`p-3 mb-2 bg-white border rounded-lg cursor-pointer transition-colors ${
        selectedLeads.includes(lead.id) ? 'bg-blue-50/50 border-blue-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedLeads.includes(lead.id)}
            onChange={() => handleLeadSelect(lead.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <div>
            <span className="text-xs font-medium text-gray-900">{lead.name}</span>
            <p className="text-[10px] text-gray-500">{lead.email}</p>
          </div>
        </div>
        {!lead.assignedTo ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-yellow-800 bg-yellow-100 rounded-full">
            <UserX className="w-3 h-3" />
            Unassigned
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-green-800 bg-green-100 rounded-full">
            <UserCheck className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{lead.assignedTo}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
        <div className="p-2 rounded bg-gray-50">
          <p className="text-gray-500">ID</p>
          <p className="font-medium">{lead.id.slice(-6)}</p>
        </div>
        <div className="p-2 rounded bg-gray-50">
          <p className="text-gray-500">Uploaded By</p>
          <p className="font-medium truncate">{lead.uploadedBy}</p>
        </div>
        <div className="p-2 rounded bg-gray-50">
          <p className="text-gray-500">Status</p>
          <p className="font-medium">{lead.leadPool}</p>
        </div>
      </div>

      {lead.assignedDate && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{lead.assignedDate}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-3 bg-gray-50 sm:p-4 md:p-6">
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-4 sm:mb-5">
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl">Assign Leads</h1>
          <p className="text-xs text-gray-600 sm:text-sm">Assign and manage database leads to employees</p>
        </div>

        <div className="p-3 mb-4 bg-white border rounded-lg sm:p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold sm:text-base">Select an Employee</h2>
          </div>
          <p className="mb-3 text-xs text-gray-500 sm:text-sm">
            Only employees from the Sales Department are shown here.
          </p>

          <div className="relative w-full lg:w-2/3">
            <button
              onClick={() => setShowEmployeeDropdown((prev) => !prev)}
              disabled={isEmployeeLoading}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                {isEmployeeLoading ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : selectedEmployee ? (
                  <>
                    <div className="flex items-center justify-center text-xs text-white bg-blue-500 rounded-full w-7 h-7">
                      {getInitials(selectedEmployee.name)}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-medium sm:text-sm">{selectedEmployee.name}</span>
                      <span className="block text-[10px] text-gray-500 sm:text-xs">{selectedEmployee.email}</span>
                      {selectedEmployee.department && (
                        <span className="block text-[10px] text-blue-600 sm:text-xs">{selectedEmployee.department}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 sm:text-sm">Select an employee to assign leads</span>
                )}
              </div>
            </button>

            {showEmployeeDropdown && (
              <div className="absolute z-10 w-full mt-1 overflow-auto bg-white border rounded-lg shadow-lg max-h-60">
                {employees.length > 0 ? employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeChange(employee)}
                    className="flex items-center w-full gap-2 px-3 py-2.5 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center justify-center text-xs text-white bg-blue-500 rounded-full w-7 h-7">
                      {getInitials(employee.name)}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-medium sm:text-sm">{employee.name}</span>
                      <span className="block text-[10px] text-gray-500 sm:text-xs">{employee.email}</span>
                      {employee.department && (
                        <span className="block text-[10px] text-blue-600 sm:text-xs">{employee.department}</span>
                      )}
                    </div>
                  </button>
                )) : (
                  <div className="px-3 py-3 text-xs text-gray-500 sm:text-sm">
                    No Sales Department employees found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 lg:grid-cols-4">
          <div className="p-2 bg-white border rounded-lg sm:p-3">
            <p className="text-[10px] text-gray-500 sm:text-xs">Total</p>
            <p className="text-base font-bold sm:text-lg">{counts.total}</p>
          </div>
          <div className="p-2 bg-white border rounded-lg sm:p-3">
            <p className="text-[10px] text-gray-500 sm:text-xs">Assigned</p>
            <p className="text-base font-bold text-green-600 sm:text-lg">{counts.assigned}</p>
          </div>
          <div className="p-2 bg-white border rounded-lg sm:p-3">
            <p className="text-[10px] text-gray-500 sm:text-xs">Unassigned</p>
            <p className="text-base font-bold text-yellow-600 sm:text-lg">{counts.unassigned}</p>
          </div>
          <div className="p-2 bg-white border rounded-lg sm:p-3">
            <p className="text-[10px] text-gray-500 sm:text-xs">New</p>
            <p className="text-base font-bold text-blue-600 sm:text-lg">{newLeadCount}</p>
          </div>
        </div>

        <div className="p-3 mb-4 bg-white border rounded-lg sm:p-4">
          <div className="flex flex-col gap-3 mb-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={leadFilter}
                onChange={(e) => {
                  setLeadFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 text-xs border rounded-lg bg-gray-50 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Leads</option>
                <option value="assigned">Assigned Leads</option>
                <option value="unassigned">Unassigned Leads</option>
                <option value="new">New Leads</option>
                <option value="sale_done">Sales Done</option>
              </select>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2 sm:left-3 sm:top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 pr-3 text-xs border rounded-lg pl-8 sm:py-2 sm:pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold">Lead Selection</h3>
            <button
              onClick={() => {
                if (pageSelectionMode) {
                  handleClearPageSelection();
                } else {
                  handleSelectAllPage();
                }
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-lg flex items-center gap-1 ${
                pageSelectionMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {pageSelectionMode ? (
                <CheckSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span className="hidden xs:inline">All Selected</span> ({leads.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 m-4 sm:flex-row">
          <span className="text-[10px] sm:text-xs order-2 sm:order-1">{selectedLeads.length} lead(s) selected</span>
          <div className="flex order-1 gap-2 sm:order-2">
            <button
              onClick={handleAssign}
              disabled={selectedLeads.length === 0 || isLoading || isLeadLoading || !selectedEmployee}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 ${
                selectedLeads.length === 0 || isLoading || isLeadLoading || !selectedEmployee
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              Assign
            </button>
            <button
              onClick={handleUnassign}
              disabled={selectedLeads.length === 0 || isLoading || isLeadLoading}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 ${
                selectedLeads.length === 0 || isLoading || isLeadLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <UserMinus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              Unassign
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="w-12 px-2 sm:px-3 py-2.5 sm:py-3"></th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">ID</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">NAME</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">EMAIL</th>
                  <th className="hidden md:table-cell px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">UPLOADED BY</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">ASSIGNED TO</th>
                  <th className="hidden lg:table-cell px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">ASSIGNED DATE</th>
                  <th className="hidden lg:table-cell px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold text-left">LEAD POOL</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLeadLoading ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center sm:p-8">
                      <Loader2 className="w-5 h-5 mx-auto text-blue-600 animate-spin sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Loading leads...</span>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center sm:p-8">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-400 sm:w-10 sm:h-10" />
                      <span className="text-xs text-gray-600 sm:text-sm">No leads found</span>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => <TableRow key={lead.id} lead={lead} />)
                )}
              </tbody>
            </table>
          </div>

          <div className="block p-3 md:hidden">
            {isLeadLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 mx-auto text-blue-600 animate-spin" />
                <span className="text-xs">Loading leads...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
                <span className="text-xs text-gray-600">No leads found</span>
              </div>
            ) : (
              leads.map((lead) => <MobileLeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        </div>

        {leads.length > 0 && (
          <div className="p-3 mt-4 bg-white border rounded-lg sm:p-4">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <span>Show:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-1.5 py-1 text-xs border rounded sm:px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>

              <div className="text-[10px] sm:text-xs">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLeadLoading}
                  className="p-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLeadLoading}
                  className="p-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignLead;
