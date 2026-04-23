import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPathForUser, isHRUser } from '@/lib/roleUtils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  Upload,
  UserCircle,
  X,
  Flag,
  UserPlus,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  Network,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isMobile, isOverlay = false }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [leadsMenuOpen, setLeadsMenuOpen] = useState(false);
  const [employeeLeadsMenuOpen, setEmployeeLeadsMenuOpen] = useState(false);

  const isLeadsRoute = location.pathname.startsWith('/leads');
  const isEmployeeLeadsRoute = location.pathname.startsWith('/employee/leads');
  const hrUser = isHRUser(currentUser);

  const leadsSubMenuItems = [
    { to: '/leads/general', icon: PhoneCall, label: 'General' },
    { to: '/leads/assign', icon: UserPlus, label: 'Assign Leads' },
    { to: '/leads/upload', icon: Upload, label: 'Upload' },
    { to: '/leads/rankings', icon: Flag, label: 'LB (Rankings)' },
  ];

  const employeeLeadsSubMenuItems = [
    { to: '/employee/leads/general', icon: PhoneCall, label: 'General' },
    { to: '/employee/leads/rankings', icon: Flag, label: 'LB (Rankings)' },
  ];

  const getBaseLinks = () => {
    if (currentUser?.role === 'admin' || hrUser) {
      const basePath = hrUser ? '/hr' : '/admin';
      const links = [
        {
          to: `${basePath}/dashboard`,
          icon: LayoutDashboard,
          label: 'Dashboard',
        },
        {
          to: hrUser ? '/hr/profile' : '/admin/profile',
          icon: UserCircle,
          label: hrUser ? 'My Profile' : 'Admin Profile',
        },
        { to: `${basePath}/employees`, icon: Users, label: 'Employees' },
        { to: `${basePath}/leave`, icon: Calendar, label: 'Leave Management' },
        { to: `${basePath}/leave-balance`, icon: CalendarDays, label: 'Leave Balance' },
        { to: `${basePath}/important-documents`, icon: FileText, label: 'Important Documents' },
        { to: `${basePath}/attendance`, icon: Clock, label: 'Attendance' },
        // { to: `${basePath}/files`, icon: FileText, label: 'Files' },
        { to: `${basePath}/hierarchy`, icon: Network, label: 'Company Hierarchy' },
      ];

      if (currentUser?.role === 'admin') {
        links.splice(3, 0, { to: '/admin/access', icon: ShieldCheck, label: 'Access' });
      }

      return links;
    }

    if (currentUser?.role === 'manager') {
      return [
        { to: getDashboardPathForUser(currentUser), icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/manager/profile', icon: UserCircle, label: 'Manager Profile' },
        { to: '/manager/leave-requests', icon: Calendar, label: 'Leave Requests' },
        { to: '/manager/team', icon: Users, label: 'My Team' },
        { to: '/manager/team-attendance', icon: Clock, label: 'Team Attendance' },
        { to: '/manager/important-documents', icon: FileText, label: 'Important Documents' },
        // { to: '/manager/team-files', icon: FileText, label: 'Team Files' },
        { to: '/manager/hierarchy', icon: Network, label: 'Company Hierarchy' },
      ];
    }

    if (isMobile && currentUser?.role === 'employee') {
      return [
        { to: '/employee/leave', icon: Calendar, label: 'Leave Application' },
        { to: '/employee/important-documents', icon: FileText, label: 'Important Documents' },
      ];
    }

    return [
      { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/employee/profile', icon: UserCircle, label: 'My Profile' },
      { to: '/employee/leave', icon: Calendar, label: 'Leave Application' },
      { to: '/employee/attendance', icon: Clock, label: 'My Attendance' },
      { to: '/employee/important-documents', icon: FileText, label: 'Important Documents' },
      // { to: '/employee/shared-files', icon: Share2, label: 'Shared Files' },
      { to: '/employee/hierarchy', icon: Network, label: 'Company Hierarchy' },
    ];
  };

  const baseLinks = getBaseLinks();

  // ------------------ MOBILE SIDEBAR ------------------
  if (isOverlay) {
    return (
      <aside className="h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-slate-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {baseLinks.map((link) => (
            <React.Fragment key={link.to}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                  }`
                }
              >
                <link.icon className="flex-shrink-0 w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>

              {/* Leads Menu */}
              {link.label.toLowerCase().includes('profile') &&
                (currentUser?.role === 'admin' || (currentUser?.role === 'manager' && !hrUser)) && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => setLeadsMenuOpen(!leadsMenuOpen)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        isLeadsRoute
                          ? 'bg-purple-50 text-purple-600 font-medium border-l-4 border-purple-600 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PhoneCall className="w-5 h-5" />
                        <span className="font-medium">Leads</span>
                      </div>
                      {leadsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {leadsMenuOpen &&
                      leadsSubMenuItems.map((sub) => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                              isActive ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                            }`
                          }
                        >
                          <sub.icon className="w-4 h-4" />
                          <span>{sub.label}</span>
                        </NavLink>
                      ))}
                  </div>
                )}

              {link.label.toLowerCase().includes('profile') && currentUser?.role === 'employee' && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => setEmployeeLeadsMenuOpen(!employeeLeadsMenuOpen)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      isEmployeeLeadsRoute
                        ? 'bg-purple-50 text-purple-600 font-medium border-l-4 border-purple-600 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-5 h-5" />
                      <span className="font-medium">Leads</span>
                    </div>
                    {employeeLeadsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {employeeLeadsMenuOpen &&
                    employeeLeadsSubMenuItems.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                            isActive ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                          }`
                        }
                      >
                        <sub.icon className="w-4 h-4" />
                        <span>{sub.label}</span>
                      </NavLink>
                    ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>
      </aside>
    );
  }

  // ------------------ DESKTOP SIDEBAR ------------------
  return (
    <aside className="flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {baseLinks.map((link) => (
          <React.Fragment key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                } ${!isOpen && 'justify-center'}`
              }
              title={!isOpen ? link.label : ''}
            >
              <link.icon className={`flex-shrink-0 ${!isOpen ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {isOpen && <span className="font-medium">{link.label}</span>}
            </NavLink>

            {/* Leads for Admin/Manager */}
            {link.label.toLowerCase().includes('profile') &&
              (currentUser?.role === 'admin' || (currentUser?.role === 'manager' && !hrUser)) && (
                <>
                  <button
                    onClick={() => setLeadsMenuOpen(!leadsMenuOpen)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group w-full ${
                      isLeadsRoute || leadsMenuOpen
                        ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    } ${!isOpen && 'justify-center'}`}
                    title={!isOpen ? 'Leads' : ''}
                  >
                    <PhoneCall className={`flex-shrink-0 ${!isOpen ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    {isOpen && (
                      <>
                        <span className="flex-1 font-medium text-left">Leads</span>
                        {leadsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  {leadsMenuOpen &&
                    leadsSubMenuItems.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            isActive ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                          } ${!isOpen && 'justify-center'}`
                        }
                        title={!isOpen ? sub.label : ''}
                      >
                        <sub.icon className={`flex-shrink-0 ${!isOpen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                        {isOpen && <span>{sub.label}</span>}
                      </NavLink>
                    ))}
                </>
              )}

            {/* Leads for Employee */}
            {link.label.toLowerCase().includes('profile') && currentUser?.role === 'employee' && (
              <>
                <button
                  onClick={() => setEmployeeLeadsMenuOpen(!employeeLeadsMenuOpen)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group w-full ${
                    isEmployeeLeadsRoute || employeeLeadsMenuOpen
                      ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                  } ${!isOpen && 'justify-center'}`}
                  title={!isOpen ? 'Leads' : ''}
                >
                  <PhoneCall className={`flex-shrink-0 ${!isOpen ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  {isOpen && (
                    <>
                      <span className="flex-1 font-medium text-left">Leads</span>
                      {employeeLeadsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
                {employeeLeadsMenuOpen &&
                  employeeLeadsSubMenuItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          isActive ? 'bg-purple-50 text-purple-600 font-medium dark:bg-purple-500/20 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                        } ${!isOpen && 'justify-center'}`
                      }
                      title={!isOpen ? sub.label : ''}
                    >
                      <sub.icon className={`flex-shrink-0 ${!isOpen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      {isOpen && <span>{sub.label}</span>}
                    </NavLink>
                  ))}
              </>
            )}
          </React.Fragment>
        ))}
      </nav>
      
    </aside>
  );
};

export default Sidebar;
