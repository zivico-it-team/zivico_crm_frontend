import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';

import TeamHeader from './components/TeamHeader';
import TeamStats from './components/TeamStats';
import TeamControls from './components/TeamControls';
import TeamGrid from './components/TeamGrid';
import AddMemberModal from './modals/AddMemberModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import ProfileModal from './modals/ProfileModal';
import { initialMemberData } from './utils/teamData';
import { calculateStats, filterAndSortMembers } from './utils/teamUtils';

const getEmployeeId = (employee) => employee?._id || employee?.id || '';

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getManagerKeys = (manager) =>
  [manager?._id, manager?.id, manager?.name, manager?.email, manager?.userName]
    .filter(Boolean)
    .map((value) => normalizeText(value));

const filterTeamMembers = (employees, manager) => {
  if (!Array.isArray(employees) || employees.length === 0) {
    return [];
  }

  const managerKeys = getManagerKeys(manager);
  const managerDepartment = normalizeText(manager?.professional?.department);
  const managerTeam = normalizeText(manager?.professional?.teamName);

  const directReports = employees.filter((employee) => {
    const reportingManager = normalizeText(employee?.professional?.reportingManager);
    return reportingManager && managerKeys.includes(reportingManager);
  });

  if (directReports.length > 0) {
    return directReports;
  }

  const departmentMatches = employees.filter((employee) => {
    const employeeDepartment = normalizeText(employee?.professional?.department);
    const employeeTeam = normalizeText(employee?.professional?.teamName);

    if (managerTeam && employeeTeam === managerTeam) {
      return true;
    }

    if (managerDepartment && employeeDepartment === managerDepartment) {
      return true;
    }

    return false;
  });

  return departmentMatches.length > 0 ? departmentMatches : employees;
};

const buildStatusMap = (activeMembers, onLeaveMembers) => {
  const activeIds = new Set(activeMembers.map((member) => getEmployeeId(member)).filter(Boolean));
  const onLeaveIds = new Set(onLeaveMembers.map((member) => getEmployeeId(member)).filter(Boolean));

  return { activeIds, onLeaveIds };
};

const normalizeMember = (member, statusMap) => {
  const memberId = getEmployeeId(member);
  const professional = member?.professional || {};
  const status = statusMap.activeIds.has(memberId)
    ? 'Active'
    : statusMap.onLeaveIds.has(memberId)
      ? 'On Leave'
      : 'Inactive';

  return {
    ...member,
    id: memberId,
    _id: memberId,
    name: member?.name || '',
    userName: member?.userName || '',
    email: member?.email || '',
    phone: member?.phone || '',
    designation: professional?.designation || '',
    department: professional?.department || professional?.teamName || '',
    employeeId: professional?.employeeId || memberId,
    joiningDate: professional?.joiningDate || '',
    dateOfBirth: member?.dob || '',
    workLocation: professional?.workLocation || '',
    manager: professional?.reportingManager || '',
    bio: member?.bio || '',
    skills: Array.isArray(member?.skills) ? member.skills.join(', ') : member?.skills || '',
    avatar: buildAvatarUrl(member),
    lastActive: member?.updatedAt || member?.createdAt || '',
    status,
  };
};

const normalizeManager = (manager) => ({
  ...manager,
  id: manager?._id || manager?.id,
});

const TeamView = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [filterDept, setFilterDept] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState(initialMemberData);

  const stats = calculateStats(members);

  const loadTeamData = useCallback(async () => {
    if (!currentUser) {
      setMembers([]);
      setFilteredMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [allMembersResult, activeMembersResult, onLeaveMembersResult, managersResult, teamsResult] =
        await Promise.all([
          api.get('/team/members', { params: { page: 1, limit: 200 } }),
          api.get('/team/members', { params: { page: 1, limit: 200, status: 'active' } }),
          api.get('/team/members', { params: { page: 1, limit: 200, status: 'onLeave' } }),
          api.get('/team/managers'),
          api.get('/team/teams'),
        ]);

      const allEmployees = allMembersResult?.data?.members || [];
      const activeEmployees = activeMembersResult?.data?.members || [];
      const onLeaveEmployees = onLeaveMembersResult?.data?.members || [];
      const teamMembers = filterTeamMembers(allEmployees, currentUser);
      const statusMap = buildStatusMap(activeEmployees, onLeaveEmployees);
      const normalizedMembers = teamMembers.map((member) => normalizeMember(member, statusMap));
      const managers = Array.isArray(managersResult?.data)
        ? managersResult.data.map(normalizeManager)
        : [];
      const teamsFromApi = Array.isArray(teamsResult?.data) ? teamsResult.data.filter(Boolean) : [];
      const teamsFromMembers = [...new Set(normalizedMembers.map((member) => member.department).filter(Boolean))];

      setMembers(normalizedMembers);
      setManagerOptions(managers);
      setTeamOptions(teamsFromApi.length > 0 ? teamsFromApi : teamsFromMembers);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load team data',
        variant: 'destructive',
      });
      setMembers([]);
      setManagerOptions([]);
      setTeamOptions([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  useEffect(() => {
    const handleProfileImageUpdated = () => {
      loadTeamData();
    };

    window.addEventListener('profile-image-updated', handleProfileImageUpdated);
    return () => window.removeEventListener('profile-image-updated', handleProfileImageUpdated);
  }, [loadTeamData]);

  useEffect(() => {
    const result = filterAndSortMembers(members, {
      searchTerm,
      filterDept,
      activeTab,
    });

    setFilteredMembers(result);
  }, [searchTerm, filterDept, members, activeTab]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    const payload = {
      name: newEmployee.name,
      userName: newEmployee.userName,
      email: newEmployee.email,
      password: newEmployee.password,
      dob: newEmployee.dateOfBirth,
      phoneNumber: newEmployee.phone,
      employeeId: newEmployee.employeeId,
      address: newEmployee.address,
      bio: newEmployee.bio,
      skills: newEmployee.skills,
      designation: newEmployee.designation,
      joiningDate: newEmployee.joiningDate,
      workLocation: newEmployee.workLocation,
      teamDepartment: newEmployee.department,
      assignedManagerId:
        newEmployee.manager && newEmployee.manager !== 'none' ? newEmployee.manager : '',
    };

    try {
      await api.post('/team/members', payload);
      await loadTeamData();
      setIsAddModalOpen(false);
      setNewEmployee(initialMemberData);

      toast({
        title: 'Success',
        description: `${payload.name} has been added to the team.`,
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add team member',
        variant: 'destructive',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete?.id) return;

    try {
      await api.delete(`/admin/employee/${memberToDelete.id}`);
      await loadTeamData();
      setSelectedMembers((prev) => prev.filter((id) => id !== memberToDelete.id));
      setIsDeleteOpen(false);
      setMemberToDelete(null);

      toast({
        title: 'Member Removed',
        description: `${memberToDelete.name} has been removed from the team.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;

    try {
      const results = await Promise.allSettled(
        selectedMembers.map((memberId) => api.delete(`/admin/employee/${memberId}`))
      );

      const failedCount = results.filter((result) => result.status === 'rejected').length;
      const successCount = results.length - failedCount;

      await loadTeamData();
      setSelectedMembers([]);
      setIsBulkDeleteOpen(false);

      toast({
        title: failedCount === 0 ? 'Bulk Removal Complete' : 'Bulk Removal Partially Complete',
        description:
          failedCount === 0
            ? `${successCount} team member(s) have been removed.`
            : `${successCount} removed, ${failedCount} failed.`,
        variant: failedCount === 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Error bulk deleting team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove selected members.',
        variant: 'destructive',
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
    );
  };

  const getManagerName = (managerValue) => {
    if (!managerValue || managerValue === 'none') return 'No Manager';

    const normalized = normalizeText(managerValue);
    const manager = managerOptions.find((item) => getManagerKeys(item).includes(normalized));
    return manager?.name || managerValue;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDept('All');
    setActiveTab('all');
  };

  const handleOpenProfile = (member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>My Team - HRMS</title>
      </Helmet>
      <MainLayout>
        <div className="space-y-6">
          <TeamHeader onAddMember={() => setIsAddModalOpen(true)} />

          <TeamStats stats={stats} loading={loading} />

          <TeamControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDept={filterDept}
            setFilterDept={setFilterDept}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedMembers={selectedMembers}
            onBulkDelete={() => setIsBulkDeleteOpen(true)}
            filteredMembers={filteredMembers}
            members={members}
            teamOptions={teamOptions}
          />

          <TeamGrid
            loading={loading}
            filteredMembers={filteredMembers}
            members={members}
            searchTerm={searchTerm}
            filterDept={filterDept}
            activeTab={activeTab}
            selectedMembers={selectedMembers}
            onToggleSelect={toggleSelect}
            onOpenProfile={handleOpenProfile}
            onDeleteMember={(member) => {
              setMemberToDelete(member);
              setIsDeleteOpen(true);
            }}
            onClearFilters={handleClearFilters}
            getManagerName={getManagerName}
          />

          <AddMemberModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleAddEmployee}
            formSubmitting={formSubmitting}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            teamOptions={teamOptions}
            managerOptions={managerOptions}
          />

          <DeleteConfirmModal
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDeleteMember}
            title="Remove Team Member?"
            message={`Are you sure you want to remove ${memberToDelete?.name} from the team?`}
          />

          <DeleteConfirmModal
            isOpen={isBulkDeleteOpen}
            onOpenChange={setIsBulkDeleteOpen}
            onConfirm={handleBulkDelete}
            title={`Remove ${selectedMembers.length} Members?`}
            message={`Are you sure you want to remove ${selectedMembers.length} selected team member(s)?`}
            confirmText="Remove All"
            isBulk
            selectedCount={selectedMembers.length}
          />

          {isProfileOpen && selectedMember && (
            <ProfileModal
              isOpen={isProfileOpen}
              onOpenChange={(open) => {
                setIsProfileOpen(open);
                if (!open) setSelectedMember(null);
              }}
              member={selectedMember}
            />
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default TeamView;
