import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Mail, Phone } from 'lucide-react';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';
import { useAuth } from '@/contexts/AuthContext';
import HierarchyProfileModal from './components/HierarchyProfileModal';

const DEFAULT_SUMMARY = {
  totalEmployees: 0,
  management: 0,
  teams: 0,
  hierarchyLevels: 3,
};

const COLOR_PALETTE = ['blue', 'green', 'purple', 'orange', 'red'];

const colorClasses = {
  purple: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', text: 'text-purple-700', light: 'bg-purple-100' },
  orange: { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', text: 'text-orange-700', light: 'bg-orange-100' },
  red: { bg: 'bg-gradient-to-br from-red-500 to-red-600', text: 'text-red-700', light: 'bg-red-100' },
  blue: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-blue-700', light: 'bg-blue-100' },
  green: { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-green-700', light: 'bg-green-100' },
};

const normalizeTeamName = (value = '') => String(value).trim().toLowerCase();

const getManagerLabel = (manager = {}) =>
  manager?.teamName || manager?.department || manager?.designation || 'Manager';

const getInitials = (name = '') => {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'NA';
  return words.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
};

const ProfilePicture = ({ person, size = 'w-20 h-20', color = 'blue' }) => {
  const profileImage = buildAvatarUrl(person);

  return (
    <div className="relative inline-block">
      <div className={`${size} rounded-full overflow-hidden border-2 border-white shadow-lg`}>
        {profileImage ? (
          <img
            src={profileImage}
            alt={person?.name || 'Profile'}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className={`flex items-center justify-center w-full h-full ${colorClasses[color]?.bg || colorClasses.blue.bg}`}>
            <span className={`${size === 'w-32 h-32' ? 'text-4xl' : size === 'w-24 h-24' ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
              {getInitials(person?.name)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewHierarchy = () => {
  const { currentUser } = useAuth();
  const [hierarchy, setHierarchy] = useState({
    view: 'employee_full',
    cards: {
      ceo: null,
      hrManager: null,
      managers: [],
    },
    teams: [],
    summary: DEFAULT_SUMMARY,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const loadHierarchy = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/hierarchy/overview');
      const payload = response?.data || {};

      setHierarchy({
        view: payload?.view || 'employee_full',
        cards: {
          ceo: payload?.cards?.ceo || null,
          hrManager: payload?.cards?.hrManager || null,
          managers: Array.isArray(payload?.cards?.managers) ? payload.cards.managers : [],
        },
        teams: Array.isArray(payload?.teams) ? payload.teams : [],
        summary: payload?.summary || DEFAULT_SUMMARY,
      });
    } catch (err) {
      console.error('Error loading hierarchy:', err);
      setError(err?.response?.data?.message || 'Failed to load company hierarchy');
      setHierarchy((prev) => ({
        ...prev,
        teams: [],
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  useEffect(() => {
    const handleFocus = () => {
      loadHierarchy();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadHierarchy]);

  useEffect(() => {
    const handleProfileImageUpdated = () => {
      loadHierarchy();
    };

    window.addEventListener('profile-image-updated', handleProfileImageUpdated);
    return () => window.removeEventListener('profile-image-updated', handleProfileImageUpdated);
  }, [loadHierarchy]);

  const teamColorMap = useMemo(() => {
    const map = {};
    hierarchy.teams.forEach((team, index) => {
      map[normalizeTeamName(team.teamName)] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });
    return map;
  }, [hierarchy.teams]);

  const managers = useMemo(() => {
    const items = Array.isArray(hierarchy?.cards?.managers) ? hierarchy.cards.managers : [];

    return items.map((manager, index) => {
      const mappedColor = teamColorMap[normalizeTeamName(manager?.teamName)] || COLOR_PALETTE[index % COLOR_PALETTE.length];
      return {
        ...manager,
        color: mappedColor,
      };
    });
  }, [hierarchy?.cards?.managers, teamColorMap]);

  const summary = hierarchy.summary || DEFAULT_SUMMARY;
  const isAdminUser = currentUser?.role === 'admin';
  const ceoCard = useMemo(() => {
    const baseCeo = hierarchy?.cards?.ceo || null;
    if (!baseCeo) return null;

    // Keep hierarchy payload as source of truth, but prefer live session data
    // when the signed-in admin updates profile details.
    if (isAdminUser) {
      return {
        ...baseCeo,
        name: currentUser?.name || baseCeo.name,
        email: currentUser?.email || baseCeo.email,
        phone: currentUser?.phone || baseCeo.phone,
      };
    }

    return baseCeo;
  }, [hierarchy?.cards?.ceo, isAdminUser, currentUser?.name, currentUser?.email, currentUser?.phone]);
  const totalEmployees = Number(summary.totalEmployees || 0);
  const managementCount = Number(summary.management || 0);
  const totalTeams = Number(summary.teams || 0);
  const hierarchyLevels = Number(summary.hierarchyLevels || 3);
  const openProfile = useCallback((person, hierarchyTitle = '') => {
    if (!person) return;
    setSelectedPerson({
      ...person,
      hierarchyTitle,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-5rem)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Organization Overview</h1>
        <p className="mt-2 text-gray-600">View company structure and teams</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadHierarchy}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-12">
        {ceoCard && (
          <div className="text-center">
            <div className="mb-6 rounded-3xl px-6 py-4">
              <ProfilePicture
                person={ceoCard}
                size="w-32 h-32"
                color="blue"
              />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">Managing Director</h2>
              <p className="text-gray-600">{ceoCard.name}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                {isAdminUser && ceoCard.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {ceoCard.email}
                  </div>
                )}
                {isAdminUser && ceoCard.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {ceoCard.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {hierarchy?.cards?.hrManager && (
          <div className="pt-12 text-center border-t">
            <button
              type="button"
              onClick={() =>
                openProfile(
                  hierarchy.cards.hrManager,
                  hierarchy.cards.hrManager.designation || 'HR Partner',
                )
              }
              className="mb-6 rounded-3xl px-6 py-4 transition-all hover:-translate-y-1"
            >
              <ProfilePicture
                person={hierarchy.cards.hrManager}
                size="w-24 h-24"
                color="green"
              />
              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {hierarchy.cards.hrManager.designation || 'HR Partner'}
              </h2>
              <p className="text-gray-600">{hierarchy.cards.hrManager.name}</p>
            </button>
          </div>
        )}

        {managers.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Managers</h2>
              <p className="mt-1 text-sm text-gray-600">Leadership team by department</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {managers.map((manager) => (
                <button
                  key={manager._id || manager.email || manager.name}
                  type="button"
                  onClick={() => openProfile(manager, 'Manager')}
                  className="w-full rounded-lg bg-white p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <ProfilePicture
                    person={manager}
                    size="w-20 h-20"
                    color={manager.color}
                  />
                  <h3 className="mt-4 text-lg font-bold text-gray-800">
                    {manager.name}
                  </h3>
                  <p className="text-gray-600">{getManagerLabel(manager)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {hierarchy.teams.length > 0 ? hierarchy.teams.map((team) => {
            const normalizedName = normalizeTeamName(team.teamName);
            const color = teamColorMap[normalizedName] || 'blue';
            const members = Array.isArray(team.members) ? team.members : [];
            const managerForTeam = managers.find(
              (m) => normalizeTeamName(m.teamName) === normalizedName
            );
            const managedBy = team.managedBy || managerForTeam?.name || '';

            return (
              <div key={team.teamName} className="pt-8 border-t">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-800 capitalize">
                      {team.teamName}
                    </h3>
                    <span className={`px-3 py-1 text-sm ${colorClasses[color].text} rounded-full ${colorClasses[color].light}`}>
                      {team.membersCount ?? members.length} members
                    </span>
                  </div>
                  {managedBy && (
                    <div className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg shadow-sm">
                      Managed by: <span className="font-semibold">{managedBy}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {members.map((employee) => (
                    <button
                      key={employee._id || employee.email || employee.name}
                      type="button"
                      onClick={() => openProfile(employee, 'Employee')}
                      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mb-3 flex justify-center">
                        <ProfilePicture
                          person={employee}
                          size="w-16 h-16"
                          color={color}
                        />
                      </div>
                      <p className="font-medium text-gray-800">{employee.name}</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {employee.designation || employee.role || 'Employee'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          }) : (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No team hierarchy data found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-12 md:grid-cols-4">
        <div className="p-6 text-center transition-shadow bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
          <div className="text-2xl font-bold text-gray-800">{totalEmployees}</div>
          <div className="text-sm text-gray-600">Total Employees</div>
        </div>
        <div className="p-6 text-center transition-shadow bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
          <div className="text-2xl font-bold text-gray-800">{managementCount}</div>
          <div className="text-sm text-gray-600">Management</div>
        </div>
        <div className="p-6 text-center transition-shadow bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
          <div className="text-2xl font-bold text-gray-800">{totalTeams}</div>
          <div className="text-sm text-gray-600">Teams</div>
        </div>
        <div className="p-6 text-center transition-shadow bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
          <div className="text-2xl font-bold text-gray-800">{hierarchyLevels}</div>
          <div className="text-sm text-gray-600">Hierarchy Levels</div>
        </div>
      </div>

      <HierarchyProfileModal
        open={!!selectedPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
        person={selectedPerson}
      />
    </div>
  );
};

export default ViewHierarchy;
