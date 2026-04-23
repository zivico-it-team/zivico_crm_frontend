import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Users, Filter, ChevronDown } from "lucide-react";
import ManagerModal from "@/components/manager_modals/ManagerModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ManagerTable from "./ManagerTable";
import ManagerProfile from "./ManagerProfile";
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

const getPersistableProfileImageUrl = (value) => {
  const normalized = String(value || "").trim();
  return normalized && !/^data:/i.test(normalized) ? normalized : "";
};

const normalizeManager = (manager) => ({
  ...manager,
  id: manager._id || manager.id,
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
  status: manager.status || "active",
});

const ManagerManagement = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [profileViewOpen, setProfileViewOpen] = useState(false);
  const [managerToView, setManagerToView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { toast } = useToast();

  const loadManagers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/manager");
      const managerUsers = (
        Array.isArray(data) ? data : data?.managers || []
      ).map(normalizeManager);
      setManagers(managerUsers);
      setFilteredManagers(managerUsers);
    } catch (error) {
      console.error("Error loading managers:", error);
      toast({
        title: "Error",
        description: "Failed to load managers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterManagers = useCallback(() => {
    let filtered = [...managers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (mgr) =>
          (mgr.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mgr.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mgr.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mgr.designation || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (mgr.department || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((mgr) => mgr.department === departmentFilter);
    }

    setFilteredManagers(filtered);
  }, [departmentFilter, managers, searchTerm]);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  useEffect(() => {
    const handleWindowFocus = () => {
      loadManagers();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadManagers();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadManagers]);

  useEffect(() => {
    const handleProfileImageUpdated = () => {
      loadManagers();
    };

    window.addEventListener("profile-image-updated", handleProfileImageUpdated);
    return () =>
      window.removeEventListener(
        "profile-image-updated",
        handleProfileImageUpdated,
      );
  }, [loadManagers]);

  useEffect(() => {
    filterManagers();
  }, [filterManagers]);

  const handleAddManager = () => {
    setSelectedManager(null);
    setIsModalOpen(true);
  };

  const handleEditManager = (manager) => {
    setSelectedManager(manager);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (manager) => {
    setManagerToDelete(manager);
    setDeleteDialogOpen(true);
  };

  const handleViewProfile = (manager) => {
    setManagerToView(manager);
    setProfileViewOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!managerToDelete?.id) return;

    try {
      await api.delete(`/admin/manager/${managerToDelete.id}`);
      await loadManagers();
      setDeleteDialogOpen(false);
      toast({
        title: "Manager Deleted",
        description: "Manager has been successfully removed.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete manager",
        variant: "destructive",
      });
    }
  };

  const handleSaveManager = async (managerData) => {
    try {
      const profileImageUrl = getPersistableProfileImageUrl(
        managerData.profileImageUrl || managerData.avatar,
      );
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
          leaveBalance: {
            annual: { ...(managerData.leaveBalances?.Annual || {}) },
            casual: { ...(managerData.leaveBalances?.Casual || {}) },
            special: {
              ...(managerData.leaveBalances?.Special ||
                managerData.leaveBalances?.Medical ||
                {}),
            },
            unpaid: { ...(managerData.leaveBalances?.Unpaid || {}) },
          },
        },
        bank: managerData.bank,
        documents: managerData.documents,
        emergencyContact: managerData.emergencyContact,
        profileImageFileName: managerData.profileImageFileName,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      };

      if (selectedManager) {
        await api.patch(`/admin/manager/${selectedManager.id}`, payload);
        toast({
          title: "Manager Updated",
          description: "Manager information updated successfully.",
        });
      } else {
        await api.post("/admin/manager", payload);
        toast({
          title: "Manager Added",
          description: "New manager added successfully",
        });
      }

      await loadManagers();
      setIsModalOpen(false);
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

  // Get unique departments for filter
  const departments = [
    "all",
    ...new Set(managers.map((mgr) => mgr.department).filter(Boolean)),
  ];

  // Stats for header
  const totalManagers = managers.length;
  const adminManagers = managers.filter((mgr) => mgr.role === "admin").length;
  const regularManagers = managers.filter(
    (mgr) => mgr.role === "manager",
  ).length;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Manager Management - HRMS</title>
        </Helmet>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading managers...</p>
            </div>
          </div>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manager Management - HRMS</title>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Header Section with Stats */}
            <div className="mb-6">
              {/* Title and Add Button */}
              <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">
                    Manager Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage managers, their roles, and team assignments
                  </p>
                </div>

                <Button
                  onClick={handleAddManager}
                  className="w-full transition-colors bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manager
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalManagers}
                  </p>
                  <p className="text-xs text-gray-400">Managers</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {adminManagers}
                  </p>
                  <p className="text-xs text-gray-400">System admins</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Managers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {regularManagers}
                  </p>
                  <p className="text-xs text-gray-400">Team managers</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Departments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {departments.length - 1}
                  </p>
                  <p className="text-xs text-gray-400">Covered</p>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search managers by name, email, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4"
                  />
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center w-full gap-2 sm:w-auto"
                  >
                    <Filter className="w-4 h-4" />
                    Filter by Department
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                    />
                  </Button>

                  {filterOpen && (
                    <div className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="py-1">
                        {departments.map((dept) => (
                          <button
                            key={dept}
                            onClick={() => {
                              setDepartmentFilter(dept);
                              setFilterOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              departmentFilter === dept
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {dept === "all" ? "All Departments" : dept}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">{filteredManagers.length}</span>{" "}
                of <span className="font-medium">{managers.length}</span>{" "}
                managers
              </p>

              {(searchTerm || departmentFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Manager Table/Cards Container */}
            <div className="overflow-hidden bg-white rounded-lg shadow-sm">
              <ManagerTable
                managers={filteredManagers}
                onView={handleViewProfile}
                onEdit={handleEditManager}
                onDelete={handleDeleteClick}
                searchTerm={searchTerm}
              />
            </div>

            {/* Empty State */}
            {filteredManagers.length === 0 && managers.length > 0 && (
              <div className="mt-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No results found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setDepartmentFilter("all");
                    }}
                    variant="outline"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ManagerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveManager}
          manager={selectedManager}
        />

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Manager"
          description="Are you sure you want to delete this manager? This action cannot be undone."
        />

        <ManagerProfile
          isOpen={profileViewOpen}
          onClose={() => setProfileViewOpen(false)}
          manager={managerToView}
          onEdit={handleEditManager}
        />
      </MainLayout>
    </>
  );
};

export default ManagerManagement;
