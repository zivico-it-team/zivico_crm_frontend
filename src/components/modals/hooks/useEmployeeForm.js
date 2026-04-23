/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_EMPLOYEE_LEAVE_BALANCES = {
  Annual: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Casual: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Special: { total: 0, used: 0, remaining: 0, halfDay: 0 },
  Unpaid: { total: 0, used: 0, remaining: 0, halfDay: 0 },
};

const cloneDefaultBalances = () =>
  JSON.parse(JSON.stringify(DEFAULT_EMPLOYEE_LEAVE_BALANCES));

const toDateInputValue = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const normalized = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
      return normalized.slice(0, 10);
    }
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().slice(0, 10);
};

const normalizeEmploymentStatus = (value) =>
  String(value || "active").toLowerCase() === "inactive"
    ? "inactive"
    : "active";

const DESIGNATION_OPTIONS_BY_DEPARTMENT = {
  1: ["Team Leader", "Assistant Team Leader", "Call Center Executive"],
  2: ["Graphic Designer", "Full Stack Developer", "Intern"],
  3: ["Team Leader", "Assistant Team Leader", "Retention Executive"],
  4: ["Manager"],
  5: ["Team Leader", "Assistant Team Leader", "Compliance Executive"],
  6: ["Intern", "Junior Executive", "Senior Executive", "Executive"],
  7: ["Intern", "Junior Executive", "Senior Executive", "Executive"],
};

const useEmployeeForm = (employee, isProfile) => {
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  const { currentUser } = useAuth();

  // Initial form data with leave balances
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
    employeeId: "",
    avatar: "",
    avatarFile: null,
    profileImageUrl: "",
    profileImageFileName: "",
    userName: "",
    nicNo: "",
    dob: "",
    employmentStatus: "active",
    appointmentDate: "",
    resignedDate: "",
    designation: "",
    department_id: "1",
    leaveBalances: cloneDefaultBalances(),
  });

  const [editingBalances, setEditingBalances] = useState(
    cloneDefaultBalances(),
  );

  useEffect(() => {
    if (employee) {
      const departmentName =
        employee.professional?.department || employee.department || "";
      const professional = employee.professional || {};
      const employmentStatus = normalizeEmploymentStatus(
        professional.employmentStatus || employee.status,
      );
      const employeeData = {
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        password: "",
        role: employee.role || "employee",
        employeeId:
          employee.professional?.employeeId || employee.employeeId || "",
        avatar: employee.avatar || "",
        avatarFile: null,
        profileImageUrl: employee.profileImageUrl || "",
        profileImageFileName: employee.profileImageFileName || "",
        userName: employee.userName || "",
        nicNo: professional.nicNo || employee.nicNo || "",
        dob: toDateInputValue(employee.dob),
        employmentStatus,
        appointmentDate: toDateInputValue(
          professional.appointmentDate || employee.appointmentDate,
        ),
        resignedDate: toDateInputValue(
          professional.resignedDate || employee.resignedDate,
        ),
        designation:
          professional.designation || employee.designation || "",
        department_id:
          employee.department_id ||
          (departmentName === "Sales"
            ? "1"
            : departmentName === "IT"
              ? "2"
              : departmentName === "Retention"
                ? "3"
                : departmentName === "Management"
                  ? "4"
                  : departmentName === "Complaints" ||
                      departmentName === "Compliance"
                    ? "5"
                    : departmentName === "HR"
                      ? "6"
                      : departmentName === "Finance"
                        ? "7"
                        : "1"),
        leaveBalances: employee.leaveBalances || cloneDefaultBalances(),
      };

      setFormData(employeeData);
      if (employeeData.leaveBalances) {
        setEditingBalances({
          Annual:
            employeeData.leaveBalances.Annual || cloneDefaultBalances().Annual,
          Casual:
            employeeData.leaveBalances.Casual || cloneDefaultBalances().Casual,
          Special:
            employeeData.leaveBalances.Special ||
            cloneDefaultBalances().Special,
          Unpaid:
            employeeData.leaveBalances.Unpaid || cloneDefaultBalances().Unpaid,
        });
      }

      if (employee.avatar) setAvatarPreview(employee.avatar);
    } else {
      const defaultBalances = cloneDefaultBalances();
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "employee",
        employeeId: "",
        avatar: "",
        avatarFile: null,
        profileImageUrl: "",
        profileImageFileName: "",
        userName: "",
        nicNo: "",
        dob: "",
        employmentStatus: "active",
        appointmentDate: "",
        resignedDate: "",
        designation: "",
        department_id: "1",
        leaveBalances: defaultBalances,
      });
      setEditingBalances(defaultBalances);
      setAvatarPreview(null);
    }
  }, [employee]);

  const validateForm = () => {
    const errors = {};
    const selectedRole = String(formData.role || "employee").toLowerCase();
    const requiresDesignation = selectedRole === "employee";

    if (!formData.name.trim()) errors.name = "Name is required";

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "Invalid email format";
    }

    if (!employee && !isProfile && !formData.password) {
      errors.password = "Password is required";
    }

    if (
      !employee &&
      !isProfile &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (requiresDesignation && !formData.designation.trim()) {
      errors.designation = "Designation is required for employee accounts";
    }
    if (!formData.employeeId.trim())
      errors.employeeId = "Employee ID is required";
    if (!formData.department_id)
      errors.department_id = "Department is required";
    if (!formData.userName.trim()) errors.userName = "Username is required";
    if (!String(formData.nicNo || "").trim()) {
      errors.nicNo = "NIC No is required";
    }
    if (!formData.dob) errors.dob = "Date of Birth is required";

    const employmentStatus = normalizeEmploymentStatus(
      formData.employmentStatus,
    );
    if (employmentStatus === "active" && !formData.appointmentDate) {
      errors.appointmentDate = "Appointment Date is required";
    }
    if (employmentStatus === "inactive" && !formData.resignedDate) {
      errors.resignedDate = "Resigned Date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLeaveBalanceChange = (leaveType, field, value) => {
    const numValue = parseFloat(value) || 0;

    setEditingBalances((prev) => {
      const updated = { ...prev };
      const current = updated[leaveType] || { total: 0, used: 0, remaining: 0, halfDay: 0 };

      const calculateRemaining = (total, used, halfDay) =>
        Math.max(0, total - (used + halfDay * 0.5));

      if (field === "total") {
        const total = Math.max(0, numValue);
        const halfDay = current.halfDay;
        const maxUsed = Math.max(0, total - halfDay * 0.5);
        const used = Math.min(Math.max(0, current.used), maxUsed);
        updated[leaveType] = {
          ...current,
          total,
          used,
          remaining: calculateRemaining(total, used, halfDay),
        };
      } else if (field === "used") {
        const total = current.total;
        const halfDay = current.halfDay;
        const maxUsed = Math.max(0, total - halfDay * 0.5);
        const used = Math.min(maxUsed, Math.max(0, numValue));
        updated[leaveType] = {
          ...current,
          used,
          remaining: calculateRemaining(total, used, halfDay),
        };
      } else if (field === "halfDay") {
        const total = current.total;
        const halfDay = value ? 1 : 0;
        const maxUsed = Math.max(0, total - halfDay * 0.5);
        const used = Math.min(Math.max(0, current.used), maxUsed);
        updated[leaveType] = {
          ...current,
          used,
          halfDay,
          remaining: calculateRemaining(total, used, halfDay),
        };
      }

      setFormData((prev) => ({
        ...prev,
        leaveBalances: updated,
      }));

      return updated;
    });
  };

  const handleChange = (name, value) => {
    if (name === "role") {
      setFormErrors((prev) => {
        if (
          String(value || "").toLowerCase() !== "manager" ||
          !prev.designation
        ) {
          return prev;
        }

        const nextErrors = { ...prev };
        delete nextErrors.designation;
        return nextErrors;
      });
    }

    setFormData((prev) => {
      if (name === "role") {
        return {
          ...prev,
          role: value,
        };
      }

      if (name === "department_id") {
        const nextDepartmentId = String(value || "");
        const nextOptions =
          DESIGNATION_OPTIONS_BY_DEPARTMENT[nextDepartmentId] || [];
        const shouldResetDesignation =
          prev.designation && !nextOptions.includes(prev.designation);

        return {
          ...prev,
          department_id: nextDepartmentId,
          designation: shouldResetDesignation ? "" : prev.designation,
        };
      }

      if (name === "employmentStatus") {
        const nextStatus = normalizeEmploymentStatus(value);

        return {
          ...prev,
          employmentStatus: nextStatus,
          appointmentDate:
            nextStatus === "active" ? prev.appointmentDate : "",
          resignedDate: nextStatus === "inactive" ? prev.resignedDate : "",
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleAvatarUpload = (e, toast) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";
  const departments = [
    { id: "1", name: "Sales" },
    { id: "2", name: "IT" },
    { id: "3", name: "Retention" },
    { id: "5", name: "Compliance" },
    { id: "6", name: "HR" },
    { id: "7", name: "Finance" },
  ];
  const selectedDepartmentId = String(formData.department_id || "");
  const defaultDesignationOptions =
    DESIGNATION_OPTIONS_BY_DEPARTMENT[selectedDepartmentId] || [];
  const designationOptions =
    formData.designation &&
    !defaultDesignationOptions.includes(formData.designation)
      ? [...defaultDesignationOptions, formData.designation]
      : defaultDesignationOptions;

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
      employee,
      isProfile,
      isAdmin,
    },
    departments,
    designationOptions,
    handlers: {
      handleChange,
      handleAvatarUpload,
      handleLeaveBalanceChange,
      validateForm,
    },
  };
};

export default useEmployeeForm;
