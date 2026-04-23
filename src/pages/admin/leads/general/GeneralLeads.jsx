// src/pages/admin/leads/general/GeneralLeads.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, RefreshCw, Trash2, Plus, MoreVertical, FileText, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLeads } from '@/contexts/LeadsContext';
import * as XLSX from 'xlsx';

import LeadTable from './components/LeadTable';
import Pagination from './components/Pagination';
import ColumnSettings from './components/ColumnSettings';
import CreateLabelModal from './components/CreateLabelModal';
import AddToLabelModal from './components/AddToLabelModal';
import LabelTabMenu from './components/LabelTabMenu';

const LABELS_STORAGE_KEY = 'leadLabelTabs';
const LABEL_COLORS_STORAGE_KEY = 'leadLabelColors';
const ADMIN_BASE_TABS = ['All Leads', 'Assigned Leads', 'Unassign Leads', 'New Leads', 'Sales Done'];
const EMPLOYEE_BASE_TABS = ['All Leads', 'New Leads', 'Completed Leads', 'Sales Done'];
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 5;
const DEFAULT_CURRENT_PAGE = 1;

const normalizeValue = (value) => String(value || '').trim().toLowerCase();
const normalizeStorageValue = (value) => String(value || '').trim();

const buildItemsPerPageStorageKey = ({ role, userId }) =>
  `leadGeneralItemsPerPage:${normalizeStorageValue(role) || 'guest'}:${normalizeStorageValue(userId) || 'anonymous'}`;

const buildCurrentPageStorageKey = ({ role, userId }) =>
  `leadGeneralCurrentPage:${normalizeStorageValue(role) || 'guest'}:${normalizeStorageValue(userId) || 'anonymous'}`;

const readStoredItemsPerPage = (storageKey) => {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = Number(rawValue);
    return ITEMS_PER_PAGE_OPTIONS.includes(parsedValue) ? parsedValue : DEFAULT_ITEMS_PER_PAGE;
  } catch {
    return DEFAULT_ITEMS_PER_PAGE;
  }
};

const readStoredCurrentPage = (storageKey) => {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = Number(rawValue);
    return Number.isInteger(parsedValue) && parsedValue >= DEFAULT_CURRENT_PAGE
      ? parsedValue
      : DEFAULT_CURRENT_PAGE;
  } catch {
    return DEFAULT_CURRENT_PAGE;
  }
};

const hasCurrentAssignment = (lead) => {
  const assignmentStatus = normalizeValue(lead?.assignmentStatus);
  if (assignmentStatus === 'assigned') {
    return true;
  }

  const assignedTo = normalizeValue(lead?.assignedTo);
  const assignedToId = String(lead?.assignedToId || '').trim();
  return (assignedTo !== '' && assignedTo !== 'unassigned' && assignedTo !== 'n/a') || Boolean(assignedToId);
};

const wasLeadEverAssigned = (lead) => {
  if (Boolean(lead?.wasEverAssigned)) {
    return true;
  }

  const assignmentStatus = normalizeValue(lead?.assignmentStatus);
  return assignmentStatus === 'assigned' || assignmentStatus === 'unassigned';
};

const isSalesDoneLead = (lead) => {
  if (lead?.isSalesDoneLead) {
    return true;
  }

  const stage = normalizeValue(lead?.stage);
  const tag = normalizeValue(lead?.tag);

  return (
    stage === 'converted'
    || stage === 'sale done'
    || stage === 'sales done'
    || tag === 'converted'
    || tag === 'sale done'
    || tag === 'sales done'
    || tag === 'existing client (invested)'
  );
};

const isEmployeeSalesDoneLead = (lead) => {
  if (lead?.isSalesDoneLead) {
    return true;
  }

  const stage = normalizeValue(lead?.stage);
  return stage === 'converted' || stage === 'sale done' || stage === 'sales done';
};

const hasLeadDetailUpdates = (lead) => {
  if (lead?.hasLeadDetailUpdates || lead?.isCompletedLead) {
    return true;
  }

  return false;
};

const isCompletedEmployeeLead = (lead) =>
  !isEmployeeSalesDoneLead(lead) && hasLeadDetailUpdates(lead);

const isNewEmployeeLead = (lead) =>
  !isEmployeeSalesDoneLead(lead) && !hasLeadDetailUpdates(lead);

const matchesLeadTab = (lead, activeTab, { isEmployeeView = false } = {}) => {
  if (isEmployeeView) {
    switch (activeTab) {
      case 'All Leads':
        return true;
      case 'New Leads':
        return isNewEmployeeLead(lead);
      case 'Completed Leads':
        return isCompletedEmployeeLead(lead);
      case 'Sales Done':
        return isEmployeeSalesDoneLead(lead);
      default:
        return lead.tag === activeTab;
    }
  }

  const isAssigned = hasCurrentAssignment(lead);
  const wasEverAssigned = wasLeadEverAssigned(lead);

  switch (activeTab) {
    case 'All Leads':
      return true;
    case 'Assigned Leads':
      return isAssigned;
    case 'Unassign Leads':
      return !isAssigned && wasEverAssigned;
    case 'New Leads':
      return !wasEverAssigned && !isAssigned;
    case 'Sales Done':
      return isSalesDoneLead(lead);
    default:
      return lead.tag === activeTab;
  }
};

const GeneralLeads = () => {
  const {
    leads,
    setLeads,
    refreshLeads: refreshLeadsFromContext,
    toggleBookmark,
    toggleArchive,
    updateLeadTag,
    deleteMultipleLeads,
    approveMasterDataApproval,
    rejectMasterDataApproval,
    currentUser,
  } = useLeads();
  const { toast } = useToast();
  const normalizedRole = String(currentUser?.role || '').trim().toLowerCase();
  const currentUserId = String(
    currentUser?._id || currentUser?.id || currentUser?.email || '',
  ).trim();
  const itemsPerPageStorageKey = buildItemsPerPageStorageKey({
    role: normalizedRole,
    userId: currentUserId,
  });
  const currentPageStorageKey = buildCurrentPageStorageKey({
    role: normalizedRole,
    userId: currentUserId,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() =>
    readStoredCurrentPage(currentPageStorageKey),
  );
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    readStoredItemsPerPage(itemsPerPageStorageKey),
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [tagFilter, setTagFilter] = useState('All');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showCreateLabelModal, setShowCreateLabelModal] = useState(false);
  const [showAddToLabelModal, setShowAddToLabelModal] = useState(false);
  const [showApprovalRecords, setShowApprovalRecords] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState('pending');
  const [selectedLeadForLabel, setSelectedLeadForLabel] = useState(null);
  const [menuOpenForTab, setMenuOpenForTab] = useState(null);
  
  // Updated selectedColumns with country and language
  const [selectedColumns, setSelectedColumns] = useState([
    'email',
    'name',
    'phone',
    'country',
    'language',
    'assignedTo',
    'leadPool',
    'followUp',
    'stage',
    'tag',
    'comment',
    'assignedDate',
  ]);
  const [activeTab, setActiveTab] = useState('All Leads');
  const [labelTabs, setLabelTabs] = useState([]);
  const [labelColors, setLabelColors] = useState({});
  const isEmployeeView = normalizedRole === 'employee';
  const baseTabs = isEmployeeView ? EMPLOYEE_BASE_TABS : ADMIN_BASE_TABS;
  const canManageLabelTabs = true;

  const allTabs = useMemo(
    () =>
      canManageLabelTabs
        ? [...baseTabs, ...labelTabs.filter((tab) => !baseTabs.includes(tab))]
        : baseTabs,
    [baseTabs, canManageLabelTabs, labelTabs],
  );
  const canUseBulkActions = true;
  const canDeleteLeads = ['admin', 'manager'].includes(currentUser?.role);
  const canDeleteLabelTabs = canManageLabelTabs;
  const canReviewApprovals = false;
  const approvalRecords = [];

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    const refreshed = await refreshLeadsFromContext();
    setLeads(Array.isArray(refreshed) ? refreshed : []);
    setIsLoading(false);
  }, [refreshLeadsFromContext, setLeads]);

  useEffect(() => {
    const savedLabels = localStorage.getItem(LABELS_STORAGE_KEY);
    const savedColors = localStorage.getItem(LABEL_COLORS_STORAGE_KEY);

    if (savedLabels) {
      setLabelTabs(JSON.parse(savedLabels));
    }
    if (savedColors) {
      setLabelColors(JSON.parse(savedColors));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labelTabs));
    localStorage.setItem(LABEL_COLORS_STORAGE_KEY, JSON.stringify(labelColors));
  }, [labelTabs, labelColors]);

  useEffect(() => {
    setItemsPerPage(readStoredItemsPerPage(itemsPerPageStorageKey));
  }, [itemsPerPageStorageKey]);

  useEffect(() => {
    setCurrentPage(readStoredCurrentPage(currentPageStorageKey));
  }, [currentPageStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(itemsPerPageStorageKey, String(itemsPerPage));
    } catch {
      // Ignore storage write errors and keep in-memory pagination preference.
    }
  }, [itemsPerPage, itemsPerPageStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(currentPageStorageKey, String(currentPage));
    } catch {
      // Ignore storage write errors and keep in-memory pagination state.
    }
  }, [currentPage, currentPageStorageKey]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!allTabs.includes(activeTab)) {
      setActiveTab('All Leads');
    }
  }, [activeTab, allTabs]);

  const refreshLeads = loadLeads;

  const allTags = useMemo(() => {
    const tags = new Set([
      'New Lead',
      'No Answer',
      'Not Interested',
      'Number Busy',
      'Other Language',
      'Whats-App (Following)',
      'Follow Up',
      'Qualified',
      'Unqualified',
      ...(canManageLabelTabs ? labelTabs : []),
      ...leads.map((lead) => lead.tag).filter(Boolean),
    ]);

    return ['All', ...Array.from(tags)];
  }, [canManageLabelTabs, labelTabs, leads]);

  useEffect(() => {
    if (!allTags.includes(tagFilter)) {
      setTagFilter('All');
    }
  }, [allTags, tagFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchTerm === '' ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag = tagFilter === 'All' || lead.tag === tagFilter;
      const matchesTab = matchesLeadTab(lead, activeTab, { isEmployeeView });

      return matchesSearch && matchesTag && matchesTab;
    });
  }, [activeTab, isEmployeeView, leads, searchTerm, tagFilter]);

  const getTabCount = useCallback(
    (tabName) =>
      leads.filter((lead) => matchesLeadTab(lead, tabName, { isEmployeeView })).length,
    [isEmployeeView, leads],
  );

  const currentLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = (currentPageIds) => {
    const allSelected = currentPageIds.every((id) => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleBookmark = async (id) => {
    try {
      const updated = await toggleBookmark(id);
      await refreshLeads();
      toast({
        title: updated?.isBookmarked ? 'Lead Bookmarked' : 'Bookmark Removed',
        description: 'Lead bookmark status updated.',
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update bookmark.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (id) => {
    try {
      const updated = await toggleArchive(id);
      await refreshLeads();
      toast({
        title: updated?.isArchived ? 'Lead Archived' : 'Lead Unarchived',
        description: 'Lead archive status updated.',
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update archive state.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!canDeleteLeads) {
      toast({ title: 'Access Denied', description: 'Only managers and admins can delete leads.' });
      return;
    }

    if (selectedRows.length === 0) {
      toast({ title: 'No Selection', description: 'Please select rows to delete.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected lead(s)?`)) {
      return;
    }

    try {
      await deleteMultipleLeads(selectedRows);
      setSelectedRows([]);
      await refreshLeads();
      toast({
        title: 'Deleted',
        description: `${selectedRows.length} lead(s) deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast({
        title: 'Delete Failed',
        description: error?.response?.data?.message || 'Failed to delete selected leads.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      toast({ title: 'No Selection', description: 'Select rows to export.' });
      return;
    }

    const exportData = leads.filter((lead) => selectedRows.includes(lead.id));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, 'leads_export.xlsx');
  };

  const handleRefresh = async () => {
    setSearchTerm('');
    setTagFilter('All');
    setCurrentPage(1);
    setSelectedRows([]);
    setActiveTab('All Leads');
    await loadLeads();
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const approved = await approveMasterDataApproval(requestId, currentUser);
      if (!approved) return;
      toast({
        title: 'Request Approved',
        description: `Lead "${approved.leadName}" master data updated successfully.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Approval Failed',
        description: error?.response?.data?.message || 'Unable to approve this request.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt('Enter reject reason (optional):') || '';
    try {
      const rejected = await rejectMasterDataApproval(requestId, currentUser, reason);
      if (!rejected) return;
      toast({
        title: 'Request Rejected',
        description: `Request for "${rejected.leadName}" has been rejected.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Reject Failed',
        description: error?.response?.data?.message || 'Unable to reject this request.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLabel = (labelData) => {
    setLabelTabs((prev) => (prev.includes(labelData.name) ? prev : [...prev, labelData.name]));
    setLabelColors((prev) => ({ ...prev, [labelData.name]: labelData.color }));
    setActiveTab(labelData.name);
    setCurrentPage(1);

    toast({
      title: 'Label Created',
      description: `Label "${labelData.name}" created successfully.`,
    });
  };

  const updateLeadTagRequest = async (leadId, tag) => {
    return updateLeadTag(leadId, tag);
  };

  const handleEditLabel = async (oldName, newData) => {
    try {
      const affectedLeads = leads.filter((lead) => lead.tag === oldName);
      const updatedLeads = await Promise.all(
        affectedLeads.map((lead) => updateLeadTagRequest(lead.id, newData.name))
      );

      setLeads((prev) =>
        prev.map((lead) => updatedLeads.find((updated) => updated.id === lead.id) || lead)
      );
      setLabelTabs((prev) => prev.map((tab) => (tab === oldName ? newData.name : tab)));
      setLabelColors((prev) => {
        const next = { ...prev };
        delete next[oldName];
        next[newData.name] = newData.color;
        return next;
      });
      if (activeTab === oldName) {
        setActiveTab(newData.name);
      }
      setMenuOpenForTab(null);
      await refreshLeads();

      toast({
        title: 'Label Updated',
        description: `Label "${oldName}" updated to "${newData.name}".`,
      });
    } catch (error) {
      console.error('Error updating label:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update label.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLabel = async (labelName) => {
    try {
      const affectedLeads = leads.filter((lead) => lead.tag === labelName);
      const updatedLeads = await Promise.all(
        affectedLeads.map((lead) => updateLeadTagRequest(lead.id, 'New Lead'))
      );

      setLeads((prev) =>
        prev.map((lead) => updatedLeads.find((updated) => updated.id === lead.id) || lead)
      );
      setLabelTabs((prev) => prev.filter((tab) => tab !== labelName));
      setLabelColors((prev) => {
        const next = { ...prev };
        delete next[labelName];
        return next;
      });
      if (activeTab === labelName) {
        setActiveTab('All Leads');
      }
      setMenuOpenForTab(null);
      await refreshLeads();

      toast({
        title: 'Label Deleted',
        description: `Label "${labelName}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: 'Delete Failed',
        description: error?.response?.data?.message || 'Failed to delete label.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToLabelTab = (lead) => {
    if (labelTabs.length === 0) {
      toast({
        title: 'No Labels Available',
        description: 'Please create a label first using the "New" button.',
      });
      return;
    }

    setSelectedLeadForLabel(lead);
    setShowAddToLabelModal(true);
  };

  const handleAddToLabel = async (leadId, labelName) => {
    try {
      const updated = await updateLeadTagRequest(leadId, labelName);
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? updated : lead)));
      await refreshLeads();
      toast({
        title: 'Lead Added to Label',
        description: `${updated.name || 'Lead'} added to "${labelName}" tab.`,
      });
    } catch (error) {
      console.error('Error adding lead to label:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update lead tag.',
        variant: 'destructive',
      });
    }
  };

  const toggleTabMenu = (tabName, e) => {
    e.stopPropagation();
    setMenuOpenForTab((prev) => (prev === tabName ? null : tabName));
  };

  const getTabStyle = (tabName) => {
    if (tabName === 'All Leads') {
      return activeTab === 'All Leads'
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }
    if (tabName === 'Assigned Leads') {
      return activeTab === 'Assigned Leads'
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }
    if (tabName === 'Unassign Leads') {
      return activeTab === 'Unassign Leads'
        ? 'bg-amber-500 text-white border-amber-500'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }
    if (tabName === 'New Leads') {
      return activeTab === 'New Leads'
        ? 'bg-sky-600 text-white border-sky-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }
    if (tabName === 'Completed Leads') {
      return activeTab === 'Completed Leads'
        ? 'bg-violet-600 text-white border-violet-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }
    if (tabName === 'Sales Done') {
      return activeTab === 'Sales Done'
        ? 'bg-emerald-600 text-white border-emerald-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent';
    }

    const labelColor = labelColors[tabName] || '#6B7280';
    return activeTab === tabName
      ? {
          className: 'text-white border-transparent',
          style: { backgroundColor: labelColor },
        }
      : {
          className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
          style: {},
        };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-6xl px-4 py-6 mx-auto sm:px-10 lg:px-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Info</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">Manage and review all leads saved in the database</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {allTabs.map((tab) => {
            const tabStyle = getTabStyle(tab);
            const isLabelTab = canManageLabelTabs && !baseTabs.includes(tab);
            const labelColor = labelColors[tab];
            const tabCount = getTabCount(tab);

            return (
              <div key={tab} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    typeof tabStyle === 'object' ? tabStyle.className : tabStyle
                  }`}
                  style={typeof tabStyle === 'object' ? tabStyle.style : {}}
                >
                  {isLabelTab && labelColor && (
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: labelColor }} />
                  )}
                  <span>{tab}</span>
                  <span className="ml-1 text-xs opacity-75">({tabCount})</span>
                </button>

                {isLabelTab && (
                  <>
                    <button
                      onClick={(e) => toggleTabMenu(tab, e)}
                      className="absolute p-1 transition-opacity duration-200 bg-white border border-gray-200 rounded-full shadow-md opacity-0 -right-2 -top-2 group-hover:opacity-100 hover:bg-gray-100"
                    >
                      <MoreVertical className="w-3 h-3 text-gray-600" />
                    </button>

                    {menuOpenForTab === tab && (
                      <LabelTabMenu
                        tabName={tab}
                        tabColor={labelColor}
                        onEdit={handleEditLabel}
                        onDelete={canDeleteLabelTabs ? handleDeleteLabel : undefined}
                        isOpen={true}
                        onClose={() => setMenuOpenForTab(null)}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 px-4 py-2 border rounded-lg"
          />

          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg"
          >
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {canManageLabelTabs && (
            <button
              onClick={() => setShowCreateLabelModal(true)}
              className="flex items-center gap-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          )}

          {canUseBulkActions && (
            <>
              <button onClick={handleExport} className="flex items-center gap-1 px-4 py-2 border rounded-lg">
                <Grid className="w-4 h-4" /> Export
              </button>

              {canDeleteLeads && (
                <button onClick={handleDeleteSelected} className="flex items-center gap-1 px-4 py-2 text-red-600 border rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}

              <button onClick={handleRefresh} className="flex items-center gap-1 px-4 py-2 border rounded-lg">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>

              {canReviewApprovals && (
                <button
                  onClick={() => setShowApprovalRecords(true)}
                  className="flex items-center gap-1 px-4 py-2 text-blue-700 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4" /> Approval Records
                </button>
              )}
            </>
          )}

          <ColumnSettings
            showColumnSettings={showColumnSettings}
            setShowColumnSettings={setShowColumnSettings}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 bg-white border rounded-lg dark:bg-slate-900 dark:border-slate-700">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-600 dark:text-slate-300">Loading leads...</span>
          </div>
        ) : (
          <LeadTable
            leads={currentLeads}
            columns={selectedColumns}
            onBookmark={handleBookmark}
            onArchive={handleArchive}
            page={currentPage}
            pageSize={itemsPerPage}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={() => handleSelectAll(currentLeads.map((lead) => lead.id))}
            onTagClick={canManageLabelTabs ? handleAddToLabelTab : undefined}
            onAddToLabelTab={canManageLabelTabs ? handleAddToLabelTab : undefined}
            showLabelAction={canManageLabelTabs}
          />
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalLeads={filteredLeads.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />

        {selectedRows.length > 0 && <div className="mt-4 text-sm text-gray-700 dark:text-slate-300">{selectedRows.length} row(s) selected</div>}

        {canManageLabelTabs && (
          <CreateLabelModal
            isOpen={showCreateLabelModal}
            onClose={() => setShowCreateLabelModal(false)}
            onCreateLabel={handleCreateLabel}
          />
        )}

        {canManageLabelTabs && (
          <AddToLabelModal
            isOpen={showAddToLabelModal}
            onClose={() => {
              setShowAddToLabelModal(false);
              setSelectedLeadForLabel(null);
            }}
            lead={selectedLeadForLabel}
            labelTabs={labelTabs}
            labelColors={labelColors}
            onAddToLabel={handleAddToLabel}
          />
        )}

        {/* Approval Records Modal */}
        {showApprovalRecords && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-4xl p-6 bg-white rounded-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Master Data Approval Records</h2>
                  <p className="text-sm text-gray-600">Review pending requests and approve or reject updates.</p>
                </div>
                <button
                  onClick={() => setShowApprovalRecords(false)}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setApprovalFilter('pending')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${approvalFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setApprovalFilter('approved')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${approvalFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setApprovalFilter('rejected')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${approvalFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setApprovalFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${approvalFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  All
                </button>
              </div>

              {approvalRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">
                  No approval records for selected filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {approvalRecords.map((record) => (
                    <div key={record.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{record.leadName}</p>
                          <p className="text-sm text-gray-600">
                            Requested by {record.requestedBy?.name} ({record.requestedBy?.role}) on {new Date(record.requestedAt).toLocaleString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Status:{' '}
                            <span className={`font-medium ${
                              record.status === 'approved'
                                ? 'text-green-600'
                                : record.status === 'rejected'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}>
                              {record.status}
                            </span>
                          </p>
                        </div>

                        {record.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveRequest(record.id)}
                              className="px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(record.id)}
                              className="px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralLeads;
