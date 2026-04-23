import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';
import { Building2, Clock3, Mail, Phone, Search, ShieldCheck, UserRoundX } from 'lucide-react';

const normalizePendingEmployee = (employee) => ({
  ...employee,
  id: employee?._id || employee?.id || '',
  employeeId: employee?.professional?.employeeId || employee?.employeeId || '',
  designation: employee?.professional?.designation || employee?.designation || 'Employee',
  department: employee?.professional?.department || employee?.department || 'Unassigned',
  avatar: buildAvatarUrl(employee),
  createdAt: employee?.createdAt || employee?.created_at || null,
});

const formatRegistrationTime = (value) => {
  if (!value) return 'Unknown';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const AccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadPendingEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/access/pending');
      const nextEmployees = (Array.isArray(data) ? data : []).map(normalizePendingEmployee);
      setEmployees(nextEmployees);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load pending employee registrations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPendingEmployees();
  }, [loadPendingEmployees]);

  const handleApprove = async (employee) => {
    if (!employee?.id) return;

    try {
      setApprovingId(employee.id);
      await api.patch(`/admin/access/${employee.id}/approve`);
      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      toast({
        title: 'Access Approved',
        description: `${employee.name || 'Employee'} can now log in to the system.`,
      });
    } catch (error) {
      toast({
        title: 'Approval Failed',
        description: error.response?.data?.message || 'Unable to approve this employee right now.',
        variant: 'destructive',
      });
    } finally {
      setApprovingId('');
    }
  };

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) => {
    if (!normalizedQuery) return true;

    const blob = [
      employee.name,
      employee.email,
      employee.phone,
      employee.employeeId,
      employee.designation,
      employee.department,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return blob.includes(normalizedQuery);
  });

  return (
    <>
      <Helmet>
        <title>Access Approval - CRM</title>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Access Approval</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review newly registered employees and approve system access.
                </p>
              </div>

              <div className="relative w-full max-w-md">
                <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search pending registrations..."
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 monitor:grid-cols-3">
              <div className="p-5 bg-white rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Pending approvals</p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">{employees.length}</p>
                <p className="mt-1 text-xs text-gray-400">Employees waiting for admin approval</p>
              </div>
              <div className="p-5 bg-white rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Visible results</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{filteredEmployees.length}</p>
                <p className="mt-1 text-xs text-gray-400">Current search result count</p>
              </div>
              <div className="p-5 bg-white rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">After approval</p>
                <p className="mt-2 text-lg font-semibold text-emerald-600">Moves to Employees</p>
                <p className="mt-1 text-xs text-gray-400">Approved users leave this queue automatically</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 bg-white rounded-xl shadow-sm">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-500">Loading pending registrations...</p>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="px-6 py-16 text-center bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gray-100">
                  <UserRoundX className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">No pending registrations</h2>
                <p className="mt-2 text-sm text-gray-500">
                  {employees.length === 0
                    ? 'New employee registrations will appear here until an admin approves them.'
                    : 'No pending employees matched your current search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 monitor:grid-cols-2">
                {filteredEmployees.map((employee) => {
                  const isApproving = approvingId === employee.id;

                  return (
                    <div key={employee.id} className="p-5 bg-white shadow-sm rounded-xl">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-14 h-14 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                            {employee.avatar ? (
                              <img src={employee.avatar} alt={employee.name || 'Employee'} className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-lg font-semibold text-white">
                                {(employee.name || 'E').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-semibold text-gray-900">{employee.name || 'Unnamed employee'}</h2>
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                                Pending approval
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{employee.designation}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <Clock3 className="w-4 h-4" />
                              <span>Registered {formatRegistrationTime(employee.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleApprove(employee)}
                          disabled={isApproving}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          {isApproving ? 'Approving...' : 'Approve Access'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 mt-5 sm:grid-cols-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900 break-all">{employee.email || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm font-medium text-gray-900">{employee.department || 'Unassigned'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <ShieldCheck className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Employee ID</p>
                            <p className="text-sm font-medium text-gray-900">{employee.employeeId || 'Not assigned yet'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default AccessManagement;
