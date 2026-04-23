import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search } from "lucide-react";
import EmployeeModal from "@/components/modals/EmployeeModal";
import ManagerModal from "@/components/manager_modals/ManagerModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import EmployeeTable from "./EmployeeTable";
import EmployeeProfile from "./EmployeeProfile";
import ManagerProfile from "@/pages/admin/manager_management/ManagerProfile";
import api from "@/lib/api";
import { buildAvatarUrl } from "@/lib/avatar";

const DEPARTMENT_MAP = {
  1: "Sales",
  2: "IT",
  3: "Retention",
  4: "Management",
  5: "Compliance",
  6: "HR",
  7: "Finance",
};

const DEPARTMENT_ID_MAP = Object.fromEntries(
  Object.entries(DEPARTMENT_MAP).map(([id, name]) => [name, id]),
);

const DEFAULT_EMPLOYEE_LEAVE_BALANCES = {
  Annual: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Casual: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Special: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Unpaid: { total: 0, used: 0, remaining: 0, halfDay: 0 },
};

const DEFAULT_MANAGER_LEAVE_BALANCES = {
  Annual: { total: 24, used: 0, remaining: 24, halfDay: 0 },
  Casual: { total: 10, used: 0, remaining: 10, halfDay: 0 },
  Medical: { total: 21, used: 0, remaining: 21, halfDay: 0 },
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampNonNegative = (value) => Math.max(0, value);

const normalizeEditableLeaveBalance = (rawConfig) => {
  const total = clampNonNegative(
    toNumber(
      rawConfig?.total ??
        rawConfig?.assigned ??
        rawConfig?.allocation ??
        rawConfig,
      0,
    ),
  );

  const remainingValue =
    rawConfig?.remaining ??
    rawConfig?.left ??
    rawConfig?.available ??
    rawConfig?.balance;
  const hasExplicitRemaining = remainingValue !== undefined;

  const usedValue =
    rawConfig?.used ?? rawConfig?.usedDays ?? rawConfig?.taken ?? rawConfig?.spent;
  const hasExplicitUsed = usedValue !== undefined;

  const halfDayValue = rawConfig?.halfDay ?? rawConfig?.half_day;
  const hasExplicitHalfDay = halfDayValue !== undefined;

  const rawUsed = clampNonNegative(toNumber(usedValue, 0));
  const rawRemaining = clampNonNegative(toNumber(remainingValue, total));

  const effectiveUsed = hasExplicitUsed
    ? rawUsed
    : hasExplicitRemaining
      ? clampNonNegative(total - rawRemaining)
      : 0;

  const inferredHalfDay =
    hasExplicitHalfDay || Number.isInteger(effectiveUsed)
      ? hasExplicitHalfDay && toNumber(halfDayValue, 0) > 0
        ? 1
        : 0
      : Math.abs((effectiveUsed % 1) - 0.5) < 0.001
        ? 1
        : 0;

  const used = clampNonNegative(effectiveUsed - inferredHalfDay * 0.5);
  const remaining = hasExplicitRemaining
    ? rawRemaining
    : clampNonNegative(total - effectiveUsed);

  return {
    total,
    used,
    halfDay: inferredHalfDay,
    remaining,
  };
};

const buildApiEditableLeaveBalance = (balance = {}, { unlimited = false } = {}) => {
  const total = clampNonNegative(toNumber(balance?.total, 0));
  const used = clampNonNegative(toNumber(balance?.used, 0));
  const halfDay = toNumber(balance?.halfDay, 0) > 0 ? 1 : 0;
  const effectiveUsed = clampNonNegative(used + halfDay * 0.5);
  const remaining = clampNonNegative(total - effectiveUsed);

  return {
    total,
    used: effectiveUsed,
    left: remaining,
    remaining,
    halfDay,
    accessGranted: unlimited || total > 0,
    ...(unlimited ? { unlimited: true } : {}),
  };
};

const getPersistableProfileImageUrl = (value) => {
  const normalized = String(value || "").trim();
  return normalized && !/^data:/i.test(normalized) ? normalized : "";
};

const normalizeEmploymentStatus = (value) =>
  String(value || "active").toLowerCase() === "inactive"
    ? "inactive"
    : "active";

const uploadProfileImageIfNeeded = async (avatarFile) => {
  if (!avatarFile) {
    return null;
  }

  const formData = new FormData();
  formData.append("file", avatarFile);

  const { data } = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    profileImageUrl: data?.file?.url || "",
    profileImageFileName: data?.file?.fileName || avatarFile?.name || "",
  };
};

const buildUiEmployeeLeaveBalances = (rawBalances = {}) => {
  const balances = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEE_LEAVE_BALANCES));
  if (!rawBalances || typeof rawBalances !== "object") return balances;

  const mappings = [
    ["annual", "Annual"],
    ["casual", "Casual"],
    ["special", "Special"],
    ["medical", "Special"],
    ["unpaid", "Unpaid"],
  ];

  mappings.forEach(([key, target]) => {
    const rawConfig = rawBalances[key];
    if (rawConfig === undefined) return;

    balances[target] = normalizeEditableLeaveBalance(rawConfig);
  });

  return balances;
};

const buildUiManagerLeaveBalances = (rawBalances = {}) => {
  const balances = JSON.parse(JSON.stringify(DEFAULT_MANAGER_LEAVE_BALANCES));
  if (!rawBalances || typeof rawBalances !== "object") return balances;

  const mappings = [
    ["annual", "Annual"],
    ["casual", "Casual"],
    ["medical", "Medical"],
    ["special", "Medical"],
  ];

  mappings.forEach(([key, target]) => {
    const rawConfig = rawBalances[key];
    if (rawConfig === undefined) return;

    const total = Math.max(
      0,
      toNumber(
        rawConfig?.total ??
          rawConfig?.assigned ??
          rawConfig?.allocation ??
          rawConfig,
        0,
      ),
    );
    const used = 0;
    const halfDay = 0;
    const remaining = total;
    balances[target] = { total, used, halfDay, remaining };
  });

  return balances;
};

const buildApiEmployeeLeaveBalance = (
  uiBalances = DEFAULT_EMPLOYEE_LEAVE_BALANCES,
) => ({
  annual: buildApiEditableLeaveBalance(uiBalances?.Annual),
  casual: buildApiEditableLeaveBalance(uiBalances?.Casual),
  special: buildApiEditableLeaveBalance(uiBalances?.Special),
  unpaid: buildApiEditableLeaveBalance(uiBalances?.Unpaid, { unlimited: true }),
});

const buildApiManagerLeaveBalance = (
  uiBalances = DEFAULT_MANAGER_LEAVE_BALANCES,
) => ({
  annual: { total: Math.max(0, toNumber(uiBalances?.Annual?.total, 0)) },
  casual: { total: Math.max(0, toNumber(uiBalances?.Casual?.total, 0)) },
  special: {
    total: Math.max(
      0,
      toNumber((uiBalances?.Medical || uiBalances?.Special || {})?.total, 0),
    ),
  },
  unpaid: { total: Math.max(0, toNumber(uiBalances?.Unpaid?.total, 0)) },
});

const normalizeEmployee = (employee) => ({
  ...employee,
  id: employee._id || employee.id,
  recordType: "employee",
  employeeId: employee.professional?.employeeId || employee.employeeId || "",
  designation: employee.professional?.designation || employee.designation || "",
  department: employee.professional?.department || employee.department || "",
  department_id:
    employee.department_id ||
    DEPARTMENT_ID_MAP[
      employee.professional?.department || employee.department
    ] ||
    "1",
  nicNo: employee.professional?.nicNo || employee.nicNo || "",
  appointmentDate:
    employee.professional?.appointmentDate || employee.appointmentDate || "",
  resignedDate: employee.professional?.resignedDate || employee.resignedDate || "",
  status: normalizeEmploymentStatus(
    employee.professional?.employmentStatus || employee.status,
  ),
  avatar: buildAvatarUrl(employee),
  leaveBalances: buildUiEmployeeLeaveBalances(
    employee.leaveBalances ||
      employee.professional?.leaveBalance ||
      employee.professional?.leaveBalances ||
      {},
  ),
});

const normalizeManager = (manager) => ({
  ...manager,
  id: manager._id || manager.id,
  recordType: "manager",
  employeeId:
    manager.professional?.employeeId || manager.employeeId || manager._id,
  designation:
    manager.professional?.designation || manager.designation || "Manager",
  department: manager.professional?.department || manager.department || "",
  department_id:
    manager.department_id ||
    DEPARTMENT_ID_MAP[manager.professional?.department || manager.department] ||
    "4",
  avatar: buildAvatarUrl(manager),
  status: normalizeEmploymentStatus(
    manager.professional?.employmentStatus || manager.status,
  ),
  leaveBalances: buildUiManagerLeaveBalances(
    manager.leaveBalances ||
      manager.professional?.leaveBalance ||
      manager.professional?.leaveBalances ||
      {},
  ),
});

const extractPeopleFromHierarchy = (payload = {}) => {
  const hierarchyManagers = Array.isArray(payload?.cards?.managers)
    ? payload.cards.managers
    : [];
  const hierarchyEmployees = (Array.isArray(payload?.teams) ? payload.teams : []).flatMap(
    (team) => (Array.isArray(team?.members) ? team.members : []),
  );

  return {
    employees: hierarchyEmployees,
    managers: hierarchyManagers,
  };
};

const EmployeeManagement = () => {
  const { currentUser } = useAuth();
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);

  const [employeeProfileOpen, setEmployeeProfileOpen] = useState(false);
  const [managerProfileOpen, setManagerProfileOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState(null);
  const [managerToView, setManagerToView] = useState(null);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesResult, managersResult, hierarchyResult] =
        await Promise.allSettled([
          api.get("/admin/employee", { params: { employmentStatus: "all" } }),
          api.get("/admin/manager"),
          api.get("/hierarchy/overview"),
        ]);

      const hierarchyPeople =
        hierarchyResult.status === "fulfilled"
          ? extractPeopleFromHierarchy(hierarchyResult.value?.data)
          : { employees: [], managers: [] };

      const employeesSource =
        employeesResult.status === "fulfilled"
          ? Array.isArray(employeesResult.value?.data)
            ? employeesResult.value.data
            : employeesResult.value?.data?.employees || []
          : hierarchyPeople.employees;

      const managersSource =
        managersResult.status === "fulfilled"
          ? Array.isArray(managersResult.value?.data)
            ? managersResult.value.data
            : managersResult.value?.data?.managers || []
          : hierarchyPeople.managers;

      const employees = employeesSource.map(normalizeEmployee);
      const managers = managersSource.map(normalizeManager);

      const merged = [...managers, ...employees].sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });

      setPeople(merged);
      setFilteredPeople(merged);

      const hasAdminEmployeeAccess = employeesResult.status === "fulfilled";
      const hasAdminManagerAccess = managersResult.status === "fulfilled";
      const isManagerUser =
        String(currentUser?.role || "").trim().toLowerCase() === "manager";

      if (!hasAdminEmployeeAccess || (!hasAdminManagerAccess && !isManagerUser)) {
        const deniedMessage =
          employeesResult.status === "rejected"
            ? employeesResult.reason?.response?.data?.message
            : managersResult.status === "rejected"
              ? managersResult.reason?.response?.data?.message
              : "";

        if (deniedMessage && merged.length > 0) {
          toast({
            title: "Limited Access",
            description:
              "Some management data was loaded with restricted access. Available records are still shown.",
          });
        }
      }
    } catch (error) {
      console.error("Error loading employees/managers:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to load employees and managers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.role, toast]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  useEffect(() => {
    const handleProfileImageUpdated = () => {
      loadPeople();
    };

    window.addEventListener("profile-image-updated", handleProfileImageUpdated);
    return () =>
      window.removeEventListener(
        "profile-image-updated",
        handleProfileImageUpdated,
      );
  }, [loadPeople]);

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setFilteredPeople(people);
      return;
    }

    setFilteredPeople(
      people.filter((person) => {
        const roleLabel =
          person.recordType === "manager" ? "manager" : "employee";
        return (
          (person.name || "").toLowerCase().includes(query) ||
          (person.email || "").toLowerCase().includes(query) ||
          (person.phone || "").toLowerCase().includes(query) ||
          (person.designation || "").toLowerCase().includes(query) ||
          (person.department || "").toLowerCase().includes(query) ||
          (person.employeeId || "").toLowerCase().includes(query) ||
          roleLabel.includes(query)
        );
      }),
    );
  }, [people, searchTerm]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditPerson = (person) => {
    if (person.recordType === "manager") {
      setSelectedManager(person);
      setIsManagerModalOpen(true);
      return;
    }

    setSelectedEmployee(person);
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteClick = (person) => {
    setPersonToDelete(person);
    setDeleteDialogOpen(true);
  };

  const handleViewProfile = (person) => {
    if (person.recordType === "manager") {
      setManagerToView(person);
      setManagerProfileOpen(true);
      return;
    }

    setEmployeeToView(person);
    setEmployeeProfileOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!personToDelete?.id) return;

    const isManager = personToDelete.recordType === "manager";
    const endpoint = isManager
      ? `/admin/manager/${personToDelete.id}`
      : `/admin/employee/${personToDelete.id}`;
    const label = isManager ? "Manager" : "Employee";

    try {
      await api.delete(endpoint);
      await loadPeople();
      setDeleteDialogOpen(false);
      setPersonToDelete(null);
      toast({
        title: `${label} Deleted`,
        description: `${label} has been successfully removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to delete ${label.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      let profileImageUrl = getPersistableProfileImageUrl(
        employeeData.profileImageUrl || employeeData.avatar,
      );
      let profileImageFileName = employeeData.profileImageFileName || "";

      if (employeeData.avatarFile) {
        const uploadedImage = await uploadProfileImageIfNeeded(
          employeeData.avatarFile,
        );
        if (uploadedImage?.profileImageUrl) {
          profileImageUrl = uploadedImage.profileImageUrl;
          profileImageFileName = uploadedImage.profileImageFileName;
        }
      }

      const payload = {
        name: employeeData.name,
        userName: employeeData.userName,
        email: employeeData.email,
        phone: employeeData.phone,
        password: employeeData.password,
        role: employeeData.role || "employee",
        professional: {
          ...(selectedEmployee?.professional || {}),
          employeeId: employeeData.employeeId,
          nicNo: employeeData.nicNo,
          employmentStatus: normalizeEmploymentStatus(
            employeeData.employmentStatus,
          ),
          appointmentDate:
            normalizeEmploymentStatus(employeeData.employmentStatus) ===
            "active"
              ? employeeData.appointmentDate
              : "",
          resignedDate:
            normalizeEmploymentStatus(employeeData.employmentStatus) ===
            "inactive"
              ? employeeData.resignedDate
              : "",
          designation: employeeData.designation,
          department:
            DEPARTMENT_MAP[employeeData.department_id] ||
            employeeData.department ||
            "",
          leaveBalance: buildApiEmployeeLeaveBalance(
            employeeData.leaveBalances,
          ),
        },
        profileImageFileName: profileImageFileName,
        dob: employeeData.dob,
        gender: employeeData.gender,
        nationality: employeeData.nationality,
        addressLine: employeeData.addressLine,
        city: employeeData.city,
        state: employeeData.state,
        postalCode: employeeData.postalCode,
        bank: employeeData.bank,
        documents: employeeData.documents,
        emergencyContact: employeeData.emergencyContact,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      };

      if (selectedEmployee?.id) {
        await api.patch(`/admin/employee/${selectedEmployee.id}`, payload);
        toast({
          title: "Employee Updated",
          description: "Employee information updated successfully.",
        });
      } else {
        await api.post("/admin/employee", payload);
        toast({
          title: "Employee Added",
          description: "New employee added successfully.",
        });
      }

      await loadPeople();
      setIsEmployeeModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save employee",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSaveManager = async (managerData) => {
    try {
      let profileImageUrl = getPersistableProfileImageUrl(
        managerData.profileImageUrl || managerData.avatar,
      );
      let profileImageFileName = managerData.profileImageFileName || "";

      if (managerData.avatarFile) {
        const uploadedImage = await uploadProfileImageIfNeeded(
          managerData.avatarFile,
        );
        if (uploadedImage?.profileImageUrl) {
          profileImageUrl = uploadedImage.profileImageUrl;
          profileImageFileName = uploadedImage.profileImageFileName;
        }
      }

      const payload = {
        name: managerData.name,
        userName: managerData.userName,
        email: managerData.email,
        phone: managerData.phone,
        password: managerData.password,
        dob: managerData.dob,
        gender: managerData.gender,
        nationality: managerData.nationality,
        addressLine: managerData.addressLine,
        city: managerData.city,
        state: managerData.state,
        postalCode: managerData.postalCode,
        professional: {
          ...(selectedManager?.professional || {}),
          employeeId: managerData.employeeId,
          designation: managerData.designation,
          department:
            DEPARTMENT_MAP[managerData.department_id] ||
            managerData.department ||
            "",
          leaveBalance: buildApiManagerLeaveBalance(managerData.leaveBalances),
        },
        bank: managerData.bank,
        documents: managerData.documents,
        emergencyContact: managerData.emergencyContact,
        profileImageFileName: profileImageFileName,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      };

      if (selectedManager?.id) {
        await api.patch(`/admin/manager/${selectedManager.id}`, payload);
        toast({
          title: "Manager Updated",
          description: "Manager information updated successfully.",
        });
      } else {
        await api.post("/admin/manager", payload);
        toast({
          title: "Manager Added",
          description: "New manager added successfully.",
        });
      }

      await loadPeople();
      setIsManagerModalOpen(false);
    } catch (error) {
      console.error("Error saving manager:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save manager",
        variant: "destructive",
      });
      throw error;
    }
  };

  const totalPeople = people.length;
  const totalEmployees = people.filter(
    (person) => person.recordType === "employee",
  ).length;
  const totalManagers = people.filter(
    (person) => person.recordType === "manager",
  ).length;
  const activePeople = people.filter(
    (person) => person.status !== "inactive",
  ).length;
  const inactivePeople = people.filter(
    (person) => person.status === "inactive",
  ).length;
  const departmentCount = new Set(
    people.map((person) => person.department).filter(Boolean),
  ).size;
  const isDeletingManager = personToDelete?.recordType === "manager";

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Employee Management - HRMS</title>
        </Helmet>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="mt-4 text-gray-600">
                Loading employees and managers...
              </p>
            </div>
          </div>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Employee Management - CRM</title>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">
                    Employee Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage employee accounts from one place
                  </p>
                </div>

                <Button
                  onClick={handleAddEmployee}
                  className="w-full transition-colors bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 monitor:grid-cols-4 sm:gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPeople}
                  </p>
                  <p className="text-xs text-gray-400">Staff Members</p>
                </div>

                {/* <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalEmployees}
                  </p>
                  <p className="text-xs text-gray-400">Staff members</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Managers</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {totalManagers}
                  </p>
                  <p className="text-xs text-gray-400">Team leads</p>
                </div> */}

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activePeople}
                  </p>
                  <p className="text-xs text-gray-400">Current users</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {inactivePeople}
                  </p>
                  <p className="text-xs text-gray-400">Current users</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Departments</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {departmentCount}
                  </p>
                  <p className="text-xs text-gray-400">Covered</p>
                </div>

              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search by name, email, phone, department, ID, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">{filteredPeople.length}</span> of{" "}
                <span className="font-medium">{people.length}</span> records
              </p>
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-sm">
              <EmployeeTable
                employees={filteredPeople}
                onView={handleViewProfile}
                onEdit={handleEditPerson}
                onDelete={handleDeleteClick}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>

        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          employee={selectedEmployee}
        />

        <ManagerModal
          isOpen={isManagerModalOpen}
          onClose={() => setIsManagerModalOpen(false)}
          onSave={handleSaveManager}
          manager={selectedManager}
        />

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={isDeletingManager ? "Delete Manager" : "Delete Employee"}
          description={
            isDeletingManager
              ? "Are you sure you want to delete this manager? This action cannot be undone."
              : "Are you sure you want to delete this employee? This action cannot be undone."
          }
        />

        <EmployeeProfile
          isOpen={employeeProfileOpen}
          onClose={() => setEmployeeProfileOpen(false)}
          employee={employeeToView}
          onEdit={handleEditPerson}
        />

        <ManagerProfile
          isOpen={managerProfileOpen}
          onClose={() => setManagerProfileOpen(false)}
          manager={managerToView}
          onEdit={handleEditPerson}
        />
      </MainLayout>
    </>
  );
};

export default EmployeeManagement;
