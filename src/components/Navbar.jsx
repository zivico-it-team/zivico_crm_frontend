import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Bell,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buildAvatarUrl } from '@/lib/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/lib/api';

const SYSTEM_TOAST_KEY_PREFIX = 'navbar_last_system_notification';
const USER_TOAST_KEY_PREFIX = 'navbar_last_user_notification';

/* -------------------- Helpers -------------------- */

const Badge = ({ children, variant = 'default', className = '' }) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200',
    secondary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Tooltip = ({ children, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="absolute z-50 px-2 py-1 mt-2 text-xs text-white bg-gray-900 rounded-md top-full whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );
};

const getNotificationId = (notification = {}) =>
  String(notification?.id || notification?._id || '').trim();

/* -------------------- Navbar -------------------- */

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const {
    getPendingApprovalsForRole = () => [],
    approveMasterDataApproval = () => null,
    rejectMasterDataApproval = () => null,
    getNotificationsForUser = () => [],
    markNotificationAsRead = () => null,
  } = useLeads();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileAvatar, setProfileAvatar] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApprovalMenuOpen, setIsApprovalMenuOpen] = useState(false);
  const [lastNotifiedId, setLastNotifiedId] = useState(null);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [lastSystemNotifiedId, setLastSystemNotifiedId] = useState(null);
  const notificationUserKey = String(
    currentUser?._id || currentUser?.id || currentUser?.email || 'anonymous'
  );

  const getToastStorageKey = useCallback(
    (prefix) => `${prefix}_${notificationUserKey}`,
    [notificationUserKey]
  );

  const persistToastNotificationId = useCallback(
    (prefix, notificationId) => {
      if (!notificationId) return;
      localStorage.setItem(getToastStorageKey(prefix), String(notificationId));
    },
    [getToastStorageKey]
  );

  useEffect(() => {
    if (!currentUser) {
      setLastNotifiedId(null);
      setLastSystemNotifiedId(null);
      return;
    }

    const savedUserToastId = localStorage.getItem(getToastStorageKey(USER_TOAST_KEY_PREFIX));
    const savedSystemToastId = localStorage.getItem(getToastStorageKey(SYSTEM_TOAST_KEY_PREFIX));
    setLastNotifiedId(savedUserToastId || null);
    setLastSystemNotifiedId(savedSystemToastId || null);
  }, [currentUser, getToastStorageKey]);

  useEffect(() => {
    if (!currentUser) return;
    const nextAvatar = buildAvatarUrl(currentUser);
    if (nextAvatar) {
      setProfileAvatar(nextAvatar);
      return;
    }

    // Backward compatibility for legacy admin local profile storage.
    const stored = localStorage.getItem(`profile_${currentUser.id}`);
    if (stored) {
      try {
        setProfileAvatar(JSON.parse(stored).avatar || null);
      } catch (_) {
        setProfileAvatar(null);
      }
    } else {
      setProfileAvatar(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const onProfileImageUpdated = (event) => {
      const payload = event?.detail || {};
      const updatedUser = payload?.user || {};
      const userId = updatedUser?._id || updatedUser?.id;

      if (!currentUser || !userId || String(userId) !== String(currentUser._id || currentUser.id)) {
        return;
      }

      const nextAvatar = buildAvatarUrl(updatedUser);
      if (nextAvatar) {
        setProfileAvatar(nextAvatar);
      }
    };

    window.addEventListener('profile-image-updated', onProfileImageUpdated);
    return () => window.removeEventListener('profile-image-updated', onProfileImageUpdated);
  }, [currentUser]);

  const displayName = String(currentUser?.name || currentUser?.userName || 'User').trim();
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    onMenuClick();
    navigator.vibrate?.(10);
  };

  const loadSystemNotifications = useCallback(async () => {
    if (!currentUser) {
      setSystemNotifications([]);
      return;
    }

    try {
      const { data } = await api.get('/notifications');
      const incoming = Array.isArray(data?.notifications) ? data.notifications : [];
      const uniqueById = [];
      const seen = new Set();

      incoming.forEach((item) => {
        const id = getNotificationId(item);
        if (!id || seen.has(id)) return;
        seen.add(id);
        uniqueById.push(item);
      });

      setSystemNotifications(uniqueById);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSystemNotifications();
    if (!currentUser) return undefined;

    const interval = window.setInterval(loadSystemNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [currentUser, loadSystemNotifications]);

  useEffect(() => {
    if (!isApprovalMenuOpen) return;
    loadSystemNotifications();
  }, [isApprovalMenuOpen, loadSystemNotifications]);

  const pendingApprovals = getPendingApprovalsForRole(currentUser?.role) || [];
  const userNotifications = getNotificationsForUser(currentUser?.id) || [];
  const unreadSystemNotifications = systemNotifications.filter((item) => !item.isRead);
  const unreadNotifications = userNotifications.filter(item => !item.isRead);
  const approvalBadgeCount =
    (pendingApprovals?.length || 0) +
    (unreadNotifications?.length || 0) +
    (unreadSystemNotifications?.length || 0);

  useEffect(() => {
    if (!unreadNotifications.length) return;

    const latest = unreadNotifications[0];
    const latestId = getNotificationId(latest);
    if (!latestId || latestId === lastNotifiedId) return;

    toast({
      title: latest.status === 'approved' ? 'Request Approved' : 'Request Rejected',
      description: latest.message,
      variant: latest.status === 'approved' ? 'default' : 'destructive',
      duration: 4000,
    });
    setLastNotifiedId(latestId);
    persistToastNotificationId(USER_TOAST_KEY_PREFIX, latestId);
  }, [unreadNotifications, lastNotifiedId, toast, persistToastNotificationId]);

  useEffect(() => {
    if (!unreadSystemNotifications.length) return;

    const latest = unreadSystemNotifications[0];
    const latestId = getNotificationId(latest);
    if (!latestId || latestId === lastSystemNotifiedId) return;

    toast({
      title: latest.title || 'New Notification',
      description: latest.message,
      duration: 4000,
    });
    setLastSystemNotifiedId(latestId);
    persistToastNotificationId(SYSTEM_TOAST_KEY_PREFIX, latestId);
  }, [unreadSystemNotifications, lastSystemNotifiedId, toast, persistToastNotificationId]);

  const handleApprove = async (requestId) => {
    try {
      const approved = await approveMasterDataApproval(requestId, currentUser);
      if (!approved) return;
      toast({
        title: 'Request Approved',
        description: `Lead "${approved.leadName}" master data was updated.`,
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

  const handleReject = async (requestId) => {
    try {
      const rejected = await rejectMasterDataApproval(requestId, currentUser);
      if (!rejected) return;
      toast({
        title: 'Request Rejected',
        description: `Lead "${rejected.leadName}" update request was rejected.`,
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

  const handleSystemNotificationRead = async (notificationId) => {
    if (!notificationId) return;

    setSystemNotifications((prev) =>
      prev.map((item) => {
        const id = getNotificationId(item);
        return id === notificationId
          ? { ...item, isRead: true, readAt: item.readAt || new Date().toISOString() }
          : item;
      })
    );

    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Unable to mark notification as read.',
        variant: 'destructive',
      });
    }
  };

  const getDefaultRouteForRole = useCallback(() => {
    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'hr') return '/hr/dashboard';
    if (role === 'manager') return '/manager/dashboard';
    if (role === 'employee') return '/employee/dashboard';
    return '/';
  }, [currentUser?.role]);

  const getLeaveRouteForRole = useCallback(() => {
    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'admin') return '/admin/leave';
    if (role === 'hr') return '/hr/leave';
    if (role === 'manager') return '/manager/leave-requests';
    return '/employee/leave';
  }, [currentUser?.role]);

  const getImportantDocumentsRouteForRole = useCallback(() => {
    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'admin') return '/admin/important-documents';
    if (role === 'hr') return '/hr/important-documents';
    if (role === 'manager') return '/manager/important-documents';
    return '/employee/important-documents';
  }, [currentUser?.role]);

  const getSystemNotificationRoute = useCallback((notification = {}) => {
    const meta = notification?.meta && typeof notification.meta === 'object' ? notification.meta : {};
    const explicitPath = String(meta?.targetPath || meta?.redirectPath || '').trim();
    if (explicitPath) {
      return explicitPath;
    }

    const type = String(notification?.type || '').toLowerCase();
    const module = String(notification?.module || '').toLowerCase();
    if (module === 'leave' || type.includes('leave')) {
      return getLeaveRouteForRole();
    }
    if (module === 'important_documents' || type.includes('important_document')) {
      return getImportantDocumentsRouteForRole();
    }

    const leadId = String(meta?.leadId || '').trim();
    if (leadId) {
      return `/leads/${leadId}`;
    }

    return getDefaultRouteForRole();
  }, [getDefaultRouteForRole, getImportantDocumentsRouteForRole, getLeaveRouteForRole]);

  const getUserNotificationRoute = useCallback((notification = {}) => {
    const explicitPath = String(notification?.targetPath || notification?.redirectPath || '').trim();
    if (explicitPath) {
      return explicitPath;
    }

    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'employee') {
      return '/employee/leads/general';
    }
    if (role === 'admin' || role === 'manager') {
      return '/leads/general';
    }
    return getDefaultRouteForRole();
  }, [currentUser?.role, getDefaultRouteForRole]);

  const handleSystemNotificationClick = async (notification) => {
    const notificationId = getNotificationId(notification);
    if (!notificationId) return;
    await handleSystemNotificationRead(notificationId);
    setIsApprovalMenuOpen(false);
    navigate(getSystemNotificationRoute(notification));
  };

  const handleUserNotificationClick = (notification) => {
    if (!notification?.id) return;
    markNotificationAsRead(notification.id);
    setIsApprovalMenuOpen(false);
    navigate(getUserNotificationRoute(notification));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-5 monitor:px-8">

        {/* Left: Logo + Sidebar toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Tooltip content={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
            <div
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <img
                src="/images/logo.webp"
                alt="CRM Logo"
                className="w-8 transition-transform duration-200 ease-out h-9 group-hover:scale-105"
              />
              <span className="text-lg font-bold text-gray-900 transition-colors duration-200 dark:text-white group-hover:text-indigo-600 sm:text-xl">
                CRM
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Right: Help + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            )}
          </button>

          {currentUser && (
            <DropdownMenu open={isApprovalMenuOpen} onOpenChange={setIsApprovalMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                  title="Approvals and Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-700 dark:text-slate-200" />
                  {approvalBadgeCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-semibold text-white bg-red-500 rounded-full -top-1 -right-1">
                      {approvalBadgeCount > 9 ? '9+' : approvalBadgeCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="max-h-[70vh] w-[min(92vw,24rem)] overflow-y-auto monitor:w-96">
                <DropdownMenuLabel>
                  <p className="font-semibold">Approvals</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Approvals and system notifications</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {(currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'manager') && (
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400">Pending Requests</p>
                    {pendingApprovals.length === 0 ? (
                      <p className="px-2 py-2 text-sm text-gray-500 dark:text-slate-400">No pending approvals.</p>
                    ) : (
                      pendingApprovals.slice(0, 5).map((request) => (
                        <div key={request.id} className="p-2 mt-1 border border-gray-200 rounded-lg dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{request.leadName}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Requested by {request.requestedBy?.name} ({request.requestedBy?.role})
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="inline-flex items-center px-2 py-1 text-xs text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="inline-flex items-center px-2 py-1 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <DropdownMenuSeparator />

                <div className="px-2 py-1">
                  <p className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400">System Notifications</p>
                  {unreadSystemNotifications.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-gray-500 dark:text-slate-400">No system notifications yet.</p>
                  ) : (
                    unreadSystemNotifications.slice(0, 6).map((notification) => (
                      <button
                        key={getNotificationId(notification) || notification.createdAt}
                        type="button"
                        onClick={() => handleSystemNotificationClick(notification)}
                        className={`w-full p-2 mt-1 rounded-lg border text-left transition hover:border-blue-300 hover:bg-blue-100/60 dark:hover:bg-blue-500/20 ${notification.isRead ? 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800' : 'border-blue-200 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/15'}`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title || 'Notification'}
                        </p>
                        <p className="mt-1 text-sm text-gray-800 dark:text-slate-200">{notification.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-300">Open</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <DropdownMenuSeparator />

                <div className="px-2 py-1">
                  <p className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400">Your Notifications</p>
                  {unreadNotifications.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-gray-500 dark:text-slate-400">No notifications yet.</p>
                  ) : (
                    unreadNotifications.slice(0, 6).map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleUserNotificationClick(notification)}
                        className={`w-full p-2 mt-1 rounded-lg border text-left transition hover:border-blue-300 hover:bg-blue-100/60 dark:hover:bg-blue-500/20 ${notification.isRead ? 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800' : 'border-blue-200 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/15'}`}
                      >
                        <p className="text-sm text-gray-800 dark:text-slate-200">{notification.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-300">Open</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}


          {/* Profile Dropdown */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full w-9 h-9">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="avatar"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-white bg-indigo-600 rounded-full">
                    {initials}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[min(88vw,16rem)] monitor:w-64">
              <DropdownMenuLabel>
                <p className="font-semibold">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser?.email}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {currentUser?.role}
                </Badge>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
