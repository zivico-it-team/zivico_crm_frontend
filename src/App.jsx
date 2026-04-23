// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet";
import { AuthProvider } from "@/contexts/AuthContext";
import { LeadsProvider } from "./contexts/LeadsContext";
import { Toaster } from "@/components/ui/toaster";
import PageLoader from "@/components/PageLoader";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDashboardPathForUser,
  isAdminOrHRUser,
  isHRUser,
} from "@/lib/roleUtils";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";

// Hierarchy pages
import HierarchyManagement from "@/pages/admin/hierarchy_management/HierarchyManagement";
import ViewHierarchy from "@/pages/employee/hierarchy/ViewHierarchy";
import HierarchyManager from "@/pages/manager/hierarchy_manager/HierarchyManager";

// Layout
import MainLayout from "@/components/MainLayout";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard";
import EmployeeManagement from "@/pages/admin/employee_management/EmployeeManagement";
import AccessManagement from "@/pages/admin/access_management/AccessManagement";
import AdminProfileView from "@/pages/admin/profile/AdminProfileView";
import FileManagementView from "@/pages/admin/file_management/FileManagementView";
import EmployeeLeaveBalanceView from "@/pages/admin/leave_balance/EmployeeLeaveBalanceView";
import LeaveManagementView from "@/pages/admin/leave_management/LeaveManagementView";
import AttendanceView from "@/pages/admin/attendance_view/AttendanceView";
import HRDashboard from "@/pages/hr/dashboard/HRDashboard";
import HRHierarchyManagement from "@/pages/hr/hierarchy_management/HRHierarchyManagement";
import HREmployeeManagement from "@/pages/hr/employee_management/HREmployeeManagement";
import HRProfileView from "@/pages/hr/profile/HRProfileView";
import HRFileManagementView from "@/pages/hr/file_management/HRFileManagementView";
import HRLeaveManagementView from "@/pages/hr/leave_management/HRLeaveManagementView";
import HRAttendanceView from "@/pages/hr/attendance_view/HRAttendanceView";
import ImportantDocumentsView from "@/pages/shared/important_documents/ImportantDocumentsView";

// Manager Pages
import ManagerDashboard from "@/pages/manager/dashboard/ManagerDashboard";
import ManagerProfileView from "@/pages/manager/profile/ManagerProfileView";
import TeamView from "@/pages/manager/team/TeamView";
import TeamFilesView from "@/pages/manager/team_file/TeamFilesView";
import TeamLeaveView from "@/pages/manager/team_leave/TeamLeaveView";
import TeamAttendanceView from "@/pages/manager/my_attendance/TeamAttendanceView";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/dashboard/EmployeeDashboard";
import ProfileView from "@/pages/employee/profile/ProfileView";
import LeaveApplicationView from "@/pages/employee/leave_application/LeaveApplicationView";
import MyAttendanceView from "@/pages/employee/attendance_view/MyAttendanceView";
import SharedFilesView from "@/pages/employee/shared_file/SharedFilesView";

// Admin/Manager Leads pages
import AdminGeneralLeads from "@/pages/admin/leads/general/GeneralLeads";
import AssignLead from "@/pages/admin/leads/assign/AssignLead";
import UploadLeads from "@/pages/admin/leads/upload/UploadLeads";
import AdminRankings from "@/pages/admin/leads/rankings/Rankings";
import ComplaintsLeads from "@/pages/admin/leads/Complaints/ComplaintsLeads";
import EmployeeRankings from "@/pages/employee/leads/rankings/Rankings";
import LeadDetails from "@/pages/admin/leads/lead_info/LeadDetails"; // ✅ CORRECT IMPORT
import LeadReminderNotifier from "@/components/reminders/LeadReminderNotifier";

const HRDashboardRoute = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isHRUser(currentUser)) {
    return (
      <Navigate to={getDashboardPathForUser(currentUser) || "/login"} replace />
    );
  }

  return children;
};

const AdminOrHRRoute = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminOrHRUser(currentUser)) {
    return (
      <Navigate to={getDashboardPathForUser(currentUser) || "/login"} replace />
    );
  }

  return children;
};

const ManagerDashboardRoute = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== "manager") {
    return (
      <Navigate to={getDashboardPathForUser(currentUser) || "/login"} replace />
    );
  }

  if (isHRUser(currentUser)) {
    return <Navigate to="/hr/dashboard" replace />;
  }

  return children;
};

function App() {
  const INITIAL_LOAD_DELAY_MS = 1800;
  const LOADER_FADE_DURATION_MS = 550;

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setIsLoaderExiting(true);
    }, INITIAL_LOAD_DELAY_MS);

    const hideTimer = window.setTimeout(() => {
      setIsPageLoading(false);
    }, INITIAL_LOAD_DELAY_MS + LOADER_FADE_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {isPageLoading ? <PageLoader isExiting={isLoaderExiting} /> : null}
      <AuthProvider>
        <LeadsProvider>
          <Router>
            <Helmet>
              <title>HRMS - Human Resource Management System</title>
              <meta
                name="description"
                content="Comprehensive HRMS for employee management, attendance tracking, leave applications, and file sharing"
              />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordPage />}
                />

                {/* ================= ADMIN ROUTES ================= */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminOrHRRoute>
                      <AdminDashboard />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/hierarchy"
                  element={
                    <AdminOrHRRoute>
                      <MainLayout>
                        <HierarchyManagement />
                      </MainLayout>
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/employees"
                  element={
                    <AdminOrHRRoute>
                      <EmployeeManagement />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/access"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AccessManagement />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/managers"
                  element={
                    <AdminOrHRRoute>
                      <Navigate to="/admin/employees" replace />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <RoleBasedRoute allowedRoles={["admin"]}>
                      <AdminProfileView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/files"
                  element={
                    <AdminOrHRRoute>
                      <FileManagementView />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/leave"
                  element={
                    <AdminOrHRRoute>
                      <LeaveManagementView />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/attendance"
                  element={
                    <AdminOrHRRoute>
                      <AttendanceView />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/leave-balance"
                  element={
                    <AdminOrHRRoute>
                      <EmployeeLeaveBalanceView routeBase="/admin" />
                    </AdminOrHRRoute>
                  }
                />
                <Route
                  path="/admin/important-documents"
                  element={
                    <AdminOrHRRoute>
                      <ImportantDocumentsView
                        pageTitle="Important Documents - Admin"
                        routeBase="/admin"
                      />
                    </AdminOrHRRoute>
                  }
                />

                {/* ================= ADMIN/MANAGER LEADS ROUTES ================= */}
                <Route
                  path="/leads/general"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager"]}
                      disallowHR
                    >
                      <MainLayout>
                        <AdminGeneralLeads />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/leads/assign"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager"]}
                      disallowHR
                    >
                      <MainLayout>
                        <AssignLead />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/leads/upload"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager"]}
                      disallowHR
                    >
                      <MainLayout>
                        <UploadLeads />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/leads/rankings"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager"]}
                      disallowHR
                    >
                      <MainLayout>
                        <AdminRankings />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/leads/Complaints"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager"]}
                      disallowHR
                    >
                      <MainLayout>
                        <ComplaintsLeads />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/leads/:id"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["admin", "manager", "employee"]}
                      employeeMobileLeaveOnly
                      disallowHR
                    >
                      <MainLayout>
                        <LeadDetails /> {/* ✅ CORRECT COMPONENT NAME */}
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />

                {/* ================= MANAGER ROUTES ================= */}
                <Route
                  path="/manager/dashboard"
                  element={
                    <ManagerDashboardRoute>
                      <ManagerDashboard />
                    </ManagerDashboardRoute>
                  }
                />
                <Route
                  path="/hr/dashboard"
                  element={
                    <HRDashboardRoute>
                      <HRDashboard />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/hierarchy"
                  element={
                    <HRDashboardRoute>
                      <HRHierarchyManagement />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/employees"
                  element={
                    <HRDashboardRoute>
                      <HREmployeeManagement />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/profile"
                  element={
                    <HRDashboardRoute>
                      <HRProfileView />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/files"
                  element={
                    <HRDashboardRoute>
                      <HRFileManagementView />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/leave"
                  element={
                    <HRDashboardRoute>
                      <HRLeaveManagementView />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/attendance"
                  element={
                    <HRDashboardRoute>
                      <HRAttendanceView />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/leave-balance"
                  element={
                    <HRDashboardRoute>
                      <EmployeeLeaveBalanceView
                        pageTitle="HR Leave Balance - CRM"
                        routeBase="/hr"
                      />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/hr/important-documents"
                  element={
                    <HRDashboardRoute>
                      <ImportantDocumentsView
                        pageTitle="Important Documents - HR"
                        routeBase="/hr"
                      />
                    </HRDashboardRoute>
                  }
                />
                <Route
                  path="/manager/hierarchy"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <MainLayout>
                        <HierarchyManager />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/profile"
                  element={
                    <RoleBasedRoute allowedRoles={["manager", "hr"]}>
                      <ManagerProfileView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/team"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <TeamView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/team-files"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <TeamFilesView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/leave-requests"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <TeamLeaveView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/team-attendance"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <TeamAttendanceView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/important-documents"
                  element={
                    <RoleBasedRoute allowedRoles={["manager"]}>
                      <ImportantDocumentsView
                        pageTitle="Important Documents - Manager"
                        routeBase="/manager"
                      />
                    </RoleBasedRoute>
                  }
                />

                {/* ================= EMPLOYEE ROUTES ================= */}
                <Route
                  path="/employee/dashboard"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <EmployeeDashboard />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/hierarchy"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <MainLayout>
                        <ViewHierarchy />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/profile"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <ProfileView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/leave"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <LeaveApplicationView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/attendance"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <MyAttendanceView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/shared-files"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <SharedFilesView />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/important-documents"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                    >
                      <ImportantDocumentsView
                        pageTitle="Important Documents - Employee"
                        routeBase="/employee"
                      />
                    </RoleBasedRoute>
                  }
                />

                {/* Employee Leads Routes */}
                <Route
                  path="/employee/leads/general"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <MainLayout>
                        <AdminGeneralLeads />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/employee/leads/rankings"
                  element={
                    <RoleBasedRoute
                      allowedRoles={["employee"]}
                      employeeMobileLeaveOnly
                    >
                      <MainLayout>
                        <EmployeeRankings />
                      </MainLayout>
                    </RoleBasedRoute>
                  }
                />

                {/* Default */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <LeadReminderNotifier />
              <Toaster />
            </div>
          </Router>
        </LeadsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
