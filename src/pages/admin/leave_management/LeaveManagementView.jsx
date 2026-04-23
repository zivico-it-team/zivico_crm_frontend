import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/components/ui/use-toast';
import { Menu, X } from 'lucide-react';
import api from '@/lib/api';
import { updateLeaveStatus } from '@/lib/leaveApi';
import { useAuth } from '@/contexts/AuthContext';

// Import components
import LeaveHeader from './components/LeaveHeader';
import LeaveFilters from './components/LeaveFilters';
import LeaveStats from './components/LeaveStats';
import LeaveTable from './components/LeaveTable';

// Import modals 
import ActionModal from './modals/ActionModal';
import ClearRecordsModal from './modals/ClearRecordsModal';

// Import utils
import { filterLeaves, getLeaveStats } from './utils/leaveUtils';

const toDisplayType = (type = '') =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : 'General';

const normalizeLeave = (leave) => ({
  id: leave._id,
  user_name: leave.user?.name || 'Unknown',
  leave_type: toDisplayType(leave.type),
  start_date: leave.fromDate,
  end_date: leave.toDate,
  days: leave.totalDays || 0,
  status: leave.status || 'pending',
  reason: leave.reason || '',
  applied_date: leave.createdAt,
  comments: leave.remark || '',
  action_by: leave.status === 'pending' ? '-' : (leave.actionBy?.name || leave.actionByName || '-'),
});

const LeaveManagementView = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearOption, setClearOption] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const currentRole = String(currentUser?.role || '').toLowerCase();
  const canManageLeaves = ['admin', 'hr', 'manager'].includes(currentRole);
  const canClearRecords = ['admin', 'manager'].includes(currentRole);

  const stats = getLeaveStats(leaves);

  const loadLeaveData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves-admin/list', {
        params: { status: 'all', limit: 100 },
      });
      const normalizedLeaves = Array.isArray(data?.leaves)
        ? data.leaves.map(normalizeLeave)
        : [];
      setLeaves(normalizedLeaves);
      setFilteredLeaves(normalizedLeaves);
    } catch (error) {
      console.error('Error loading leaves:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLeaveData();
  }, [loadLeaveData]);

  useEffect(() => {
    const result = filterLeaves(leaves, searchTerm, statusFilter);
    setFilteredLeaves(result);
  }, [searchTerm, statusFilter, leaves]);

  const handleAction = async (comment) => {
    if (!canManageLeaves || !selectedLeave || !actionType) return;

    try {
      await updateLeaveStatus(
        selectedLeave.id,
        actionType === 'approve' ? 'approved' : 'rejected',
        comment
      );
      await loadLeaveData();

      toast({
        title: actionType === 'approve' ? "Request Approved" : "Request Rejected",
        description: `Leave request has been ${actionType}d successfully.`,
        variant: actionType === 'approve' ? "default" : "destructive"
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to process leave request",
        variant: "destructive",
      });
    } finally {
      setSelectedLeave(null);
      setActionType(null);
    }
  };

  const handleClearLeaves = async () => {
    if (!canManageLeaves || !clearOption) return;

    try {
      await api.delete('/leaves-admin/clear', {
        params: { status: clearOption },
      });
      await loadLeaveData();

      toast({
        title: "Records Cleared",
        description: `Leave requests have been cleared successfully.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clear records",
        variant: "destructive",
      });
    } finally {
      setClearDialogOpen(false);
      setClearOption('all');
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Leave Requests - HRMS</title>
        </Helmet>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading leave requests...</p>
            </div>
          </div>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Leave Requests - HRMS</title>
      </Helmet>
      
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="px-3 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6">
            
            {/* Mobile Header with Menu */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h1 className="text-xl font-bold text-gray-900">Leave Requests</h1>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {showMobileFilters ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden p-4 lg:block">
              <LeaveHeader
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onClearRecords={canClearRecords ? () => setClearDialogOpen(true) : undefined}
                stats={stats}
              />
            </div>

            {/* Mobile Filters Panel */}
            {showMobileFilters && (
              <div className="mb-4 space-y-4 lg:hidden">
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <LeaveFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Search employee..."
                  />
                  
                  <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Requests</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {canClearRecords && (
                    <button
                      onClick={() => setClearDialogOpen(true)}
                      className="w-full py-2 mt-4 text-sm text-red-600 border border-red-200 rounded-lg px- hover:bg-red-50"
                    >
                      Clear Records
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
              
              {/* Stats Section - Always Visible */}
              <div className="p-4 border-b border-gray-100">
                <LeaveStats leaves={leaves} stats={stats} />
              </div>

              {/* Results Count */}
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 sm:text-sm">
                Showing <span className="font-medium text-gray-900">{filteredLeaves.length}</span> of{' '}
                <span className="font-medium text-gray-900">{leaves.length}</span> requests
              </div>

              {/* Leave Table/Cards */}
              <LeaveTable
                leaves={filteredLeaves}
                onApprove={(leave) => {
                  setSelectedLeave(leave);
                  setActionType('approve');
                }}
                onReject={(leave) => {
                  setSelectedLeave(leave);
                  setActionType('reject');
                }}
                searchTerm={searchTerm}
                canManageActions={canManageLeaves}
              />
            </div>
          </div>
        </div>

        {canManageLeaves && (
          <>
            <ActionModal
              isOpen={!!selectedLeave}
              onClose={() => {
                setSelectedLeave(null);
                setActionType(null);
              }}
              selectedLeave={selectedLeave}
              actionType={actionType}
              onConfirm={handleAction}
            />

            {canClearRecords && (
              <ClearRecordsModal
                isOpen={clearDialogOpen}
                onClose={() => {
                  setClearDialogOpen(false);
                  setClearOption('all');
                }}
                leaves={leaves}
                clearOption={clearOption}
                setClearOption={setClearOption}
                onConfirm={handleClearLeaves}
                stats={stats}
              />
            )}
          </>
        )}
      </MainLayout>
    </>
  );
};

export default LeaveManagementView;
