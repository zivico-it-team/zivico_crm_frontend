const normalizeValue = (value) => String(value || '').trim().toLowerCase();

export const isHRUser = (user) => {
  const role = normalizeValue(user?.role);

  if (role === 'hr' || role.includes('hr')) {
    return true;
  }

  if (role !== 'manager') {
    return false;
  }

  const department = normalizeValue(user?.professional?.department);
  const designation = normalizeValue(user?.professional?.designation);
  const teamName = normalizeValue(user?.professional?.teamName);

  return (
    department === 'hr' ||
    department.includes('human resource') ||
    designation.includes('hr') ||
    designation.includes('human resource') ||
    teamName === 'hr'
  );
};

export const isAdminOrHRUser = (user) =>
  normalizeValue(user?.role) === 'admin' || isHRUser(user);

export const canAccessRoles = (user, allowedRoles = []) => {
  const role = normalizeValue(user?.role);
  const normalizedAllowedRoles = allowedRoles.map((item) => normalizeValue(item));

  if (!role) {
    return false;
  }

  if (normalizedAllowedRoles.includes(role)) {
    return true;
  }

  return normalizedAllowedRoles.includes('admin') && isHRUser(user);
};

export const getDashboardPathForUser = (user) => {
  const role = normalizeValue(user?.role);

  if (isHRUser(user)) {
    return '/hr/dashboard';
  }

  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'employee') {
    return '/employee/dashboard';
  }

  if (role === 'manager') {
    return '/manager/dashboard';
  }

  if (role.includes('admin')) {
    return '/admin/dashboard';
  }

  if (role.includes('employee')) {
    return '/employee/dashboard';
  }

  if (role.includes('manager')) {
    return '/manager/dashboard';
  }

  if (role.includes('hr')) {
    return '/hr/dashboard';
  }

  return '/';
};
