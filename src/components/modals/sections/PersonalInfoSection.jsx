import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PersonalInfoSection = ({
  formData,
  formErrors,
  departments,
  designationOptions,
  onChange,
  showRoleSelector = false
}) => {
  const selectClassName =
    'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-400';
  const selectedRole = String(formData.role || 'employee').toLowerCase();
  const isEmployeeRole = selectedRole === 'employee';
  const employmentStatus =
    String(formData.employmentStatus || 'active').toLowerCase() === 'inactive'
      ? 'inactive'
      : 'active';
  const isActiveStatus = employmentStatus === 'active';
  const getStatusButtonClassName = (status) => {
    const selected = employmentStatus === status;

    if (status === 'active') {
      return selected
        ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-100 dark:border-green-400 dark:bg-green-500/15 dark:text-green-300'
        : 'border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:text-green-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300';
    }

    return selected
      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-100 dark:border-red-400 dark:bg-red-500/15 dark:text-red-300'
      : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300';
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-gray-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal & Professional Information</h3>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </Label>
              {formErrors.name && (
                <span className="text-xs font-medium text-red-500">{formErrors.name}</span>
              )}
            </div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Full Name"
              className={`h-11 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Email Address
              </Label>
              {formErrors.email && (
                <span className="text-xs font-medium text-red-500">{formErrors.email}</span>
              )}
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="example@company.com"
              className={`h-11 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="011-1234567"
              className="h-11 border-gray-300 dark:border-slate-600"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nicNo" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                NIC No <span className="text-red-500">*</span>
              </Label>
              {formErrors.nicNo && (
                <span className="text-xs font-medium text-red-500">{formErrors.nicNo}</span>
              )}
            </div>
            <Input
              id="nicNo"
              value={formData.nicNo || ''}
              onChange={(e) => onChange('nicNo', e.target.value)}
              placeholder="NIC No"
              className={`h-11 ${formErrors.nicNo ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dob" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              {formErrors.dob && (
                <span className="text-xs font-medium text-red-500">{formErrors.dob}</span>
              )}
            </div>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ''}
              onChange={(e) => onChange('dob', e.target.value)}
              className={`h-11 ${formErrors.dob ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Username <span className="text-red-500">*</span>
              </Label>
              {formErrors.userName && (
                <span className="text-xs font-medium text-red-500">{formErrors.userName}</span>
              )}
            </div>
            <Input
              id="username"
              value={formData.userName}
              onChange={(e) => onChange('userName', e.target.value)}
              placeholder="Username"
              className={`h-11 ${formErrors.userName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Employee ID <span className="text-red-500">*</span>
              </Label>
              {formErrors.employeeId && (
                <span className="text-xs font-medium text-red-500">{formErrors.employeeId}</span>
              )}
            </div>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => onChange('employeeId', e.target.value)}
              className={`h-11 font-mono ${formErrors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter employee ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Department <span className="text-red-500">*</span>
            </Label>
            <select
              id="department_id"
              value={formData.department_id}
              onChange={(e) => onChange('department_id', e.target.value)}
              className={selectClassName}
              required
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="designation" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Designation {isEmployeeRole && <span className="text-red-500">*</span>}
              </Label>
              {formErrors.designation && (
                <span className="text-xs font-medium text-red-500">{formErrors.designation}</span>
              )}
            </div>
            <select
              id="designation"
              value={formData.designation}
              onChange={(e) => onChange('designation', e.target.value)}
              className={`${selectClassName} ${formErrors.designation ? 'border-red-500 dark:border-red-500' : ''}`}
              required={isEmployeeRole}
            >
              <option value="">
                {formData.department_id
                  ? isEmployeeRole
                    ? 'Select a designation'
                    : 'Select a designation (optional)'
                  : 'Select department first'}
              </option>
              {designationOptions.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
            {!isEmployeeRole && (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Designation is optional when the account role is Manager.
              </p>
            )}
          </div>

          <div className="space-y-2">
            {showRoleSelector && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Account Role
                </Label>
                <select
                  id="role"
                  value={formData.role || 'employee'}
                  onChange={(e) => onChange('role', e.target.value)}
                  className={selectClassName}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Designation is required for Employee accounts and optional for Manager accounts.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Active / Inactive <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange('employmentStatus', 'active')}
                className={`h-11 rounded-lg border text-sm font-semibold transition ${getStatusButtonClassName('active')}`}
                aria-pressed={isActiveStatus}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => onChange('employmentStatus', 'inactive')}
                className={`h-11 rounded-lg border text-sm font-semibold transition ${getStatusButtonClassName('inactive')}`}
                aria-pressed={!isActiveStatus}
              >
                Inactive
              </button>
            </div>

            {isActiveStatus ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="appointmentDate" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Appointment Date <span className="text-red-500">*</span>
                  </Label>
                  {formErrors.appointmentDate && (
                    <span className="text-xs font-medium text-red-500">{formErrors.appointmentDate}</span>
                  )}
                </div>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate || ''}
                  onChange={(e) => onChange('appointmentDate', e.target.value)}
                  className={`h-11 ${formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="resignedDate" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Resigned Date <span className="text-red-500">*</span>
                  </Label>
                  {formErrors.resignedDate && (
                    <span className="text-xs font-medium text-red-500">{formErrors.resignedDate}</span>
                  )}
                </div>
                <Input
                  id="resignedDate"
                  type="date"
                  value={formData.resignedDate || ''}
                  onChange={(e) => onChange('resignedDate', e.target.value)}
                  className={`h-11 ${formErrors.resignedDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
            )}
          </div>

          {/* <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Account Status</Label>
            <div className="flex items-center px-3 bg-white border border-gray-300 rounded-lg h-11">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-700">Active</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Employee will be active upon creation</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
