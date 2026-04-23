/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_LEAVE_BALANCES = {
  Annual: { total: 24, used: 0, remaining: 24, halfDay: 0 },
  Casual: { total: 10, used: 0, remaining: 10, halfDay: 0 },
  Medical: { total: 21, used: 0, remaining: 21, halfDay: 0 },
};

const DEFAULT_PERMISSIONS = {
  canManageEmployees: true,
  canManageLeaves: true,
  canViewReports: true,
  canApproveRequests: true,
  canManageSettings: false,
};

const getDepartmentId = (departmentName) => {
  switch (departmentName) {
    case "Sales":
      return "1";
    case "IT":
      return "2";
    case "Retention":
      return "3";
    case "Management":
      return "4";
    case "Complaints":
      return "5";
    case "HR":
      return "6";
    case "Finance":
      return "7";
    default:
      return "4";
  }
};

const useManagerForm = (manager, isProfile) => {
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [editingBalances, setEditingBalances] = useState(
    DEFAULT_LEAVE_BALANCES,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    employeeId: "",
    avatar: "",
    avatarFile: null,
    profileImageUrl: "",
    profileImageFileName: "",
    userName: "",
    designation: "Manager",
    department_id: "4",
    role: "manager",
    leaveBalances: DEFAULT_LEAVE_BALANCES,
    permissions: DEFAULT_PERMISSIONS,
  });

  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (manager) {
      const departmentName =
        manager.professional?.department || manager.department || "Management";
      const nextLeaveBalances = manager.leaveBalances || DEFAULT_LEAVE_BALANCES;
      const nextAvatar = manager.profileImageUrl || manager.avatar || "";

      const managerData = {
        name: manager.name || "",
        email: manager.email || "",
        phone: manager.phone || "",
        password: "",
        employeeId:
          manager.professional?.employeeId || manager.employeeId || "",
        avatar: nextAvatar,
        avatarFile: null,
        profileImageUrl: manager.profileImageUrl || "",
        profileImageFileName: manager.profileImageFileName || "",
        userName: manager.userName || manager.email?.split("@")[0] || "",
        designation:
          manager.professional?.designation || manager.designation || "Manager",
        department_id: manager.department_id || getDepartmentId(departmentName),
        role: manager.role || "manager",
        leaveBalances: nextLeaveBalances,
        permissions: manager.permissions || {
          ...DEFAULT_PERMISSIONS,
          canManageSettings: manager.role === "admin",
        },
      };

      setFormData(managerData);
      setEditingBalances(nextLeaveBalances);
      setAvatarPreview(nextAvatar || null);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      employeeId: "",
      password: "",
      avatar: "",
      avatarFile: null,
      profileImageUrl: "",
      profileImageFileName: "",
      leaveBalances: DEFAULT_LEAVE_BALANCES,
      permissions: DEFAULT_PERMISSIONS,
    }));
    setEditingBalances(DEFAULT_LEAVE_BALANCES);
    setAvatarPreview(null);
  }, [manager]);

  const handleLeaveBalanceChange = (leaveType, field, value) => {
    const numValue = parseFloat(value) || 0;

    setEditingBalances((prev) => {
      const updated = { ...prev };

      if (field === "total") {
        const used = updated[leaveType].used + updated[leaveType].halfDay * 0.5;
        const total = Math.max(0, numValue);
        updated[leaveType] = {
          ...updated[leaveType],
          total,
          remaining: Math.max(0, total - used),
        };
      } else if (field === "used") {
        const total = updated[leaveType].total;
        const used = Math.min(total, Math.max(0, numValue));
        updated[leaveType] = {
          ...updated[leaveType],
          used,
          remaining: total - (used + updated[leaveType].halfDay * 0.5),
        };
      } else if (field === "halfDay") {
        const total = updated[leaveType].total;
        const used = updated[leaveType].used;
        const halfDay = value ? 1 : 0;
        updated[leaveType] = {
          ...updated[leaveType],
          halfDay,
          remaining: total - (used + halfDay * 0.5),
        };
      }

      setFormData((prev) => ({
        ...prev,
        leaveBalances: updated,
      }));

      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!manager && !isProfile && !formData.password) {
      errors.password = "Password is required";
    }

    if (
      !manager &&
      !isProfile &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.designation.trim())
      errors.designation = "Designation is required";
    if (!formData.employeeId.trim())
      errors.employeeId = "Employee ID is required";
    if (!formData.department_id)
      errors.department_id = "Department is required";
    if (!formData.userName.trim()) errors.userName = "Username is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "role") {
        next.permissions = {
          ...prev.permissions,
          canManageSettings: value === "admin",
        };
      }

      return next;
    });
  };

  const handlePermissionChange = (permission, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      handleChange("avatar", base64String);
      handleChange("avatarFile", file);
      handleChange("profileImageUrl", "");
      handleChange("profileImageFileName", file.name || "");
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";
  const departments = [
    { id: "1", name: "Sales" },
    { id: "2", name: "IT" },
    { id: "3", name: "Retention" },
    { id: "4", name: "Management" },
    { id: "5", name: "Complaints" },
    { id: "6", name: "HR" },
    { id: "7", name: "Finance" },
  ];

  return {
    formData,
    formErrors,
    isSubmitting,
    setIsSubmitting,
    avatarPreview,
    setAvatarPreview,
    activeTab,
    setActiveTab,
    editingBalances,
    formState: {
      manager,
      isProfile,
      isAdmin,
    },
    departments,
    handlers: {
      handleChange,
      handlePermissionChange,
      handleLeaveBalanceChange,
      handleAvatarUpload,
      validateForm,
    },
  };
};

export default useManagerForm;
