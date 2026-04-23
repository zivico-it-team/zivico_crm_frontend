import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PersonalInfoSection = ({ formData, formErrors, departments, onChange }) => {
  return (
    <div className="p-6 space-y-6 border rounded-xl bg-gray-50/50">
      <h3 className="text-lg font-semibold text-gray-900">Manager Information</h3>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
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
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="manager@company.com"
              className={`h-11 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="011-1234567"
              className="border-gray-300 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
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
              <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
                Manager ID <span className="text-red-500">*</span>
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
              placeholder="Enter manager ID"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="designation" className="text-sm font-medium text-gray-700">
                Designation <span className="text-red-500">*</span>
              </Label>
              {formErrors.designation && (
                <span className="text-xs font-medium text-red-500">{formErrors.designation}</span>
              )}
            </div>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => onChange('designation', e.target.value)}
              placeholder="Department Manager"
              className={`h-11 ${formErrors.designation ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id" className="text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </Label>
            <select
              id="department_id"
              value={formData.department_id}
              onChange={(e) => onChange('department_id', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg h-11 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Account Status</Label>
            <div className="flex items-center px-3 bg-white border border-gray-300 rounded-lg h-11">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-700">Active</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Manager will be active upon creation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
