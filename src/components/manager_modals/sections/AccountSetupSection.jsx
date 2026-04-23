import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const AccountSetupSection = ({ formData, onChange }) => {
  return (
    <div className="p-6 space-y-6 border rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50">
      <h3 className="text-lg font-semibold text-gray-900">Account Setup</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Create a strong password"
            className="border-gray-300 h-11"
            required
          />
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-1 overflow-hidden bg-gray-200 rounded-full">
              <div className={`h-full ${formData.password?.length >= 8 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <span className="text-xs text-gray-500">{formData.password?.length >= 8 ? 'Strong' : 'Weak'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Re-enter password"
            className="border-gray-300 h-11"
            required
          />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-xs font-medium text-green-600">✓ Passwords match</p>
          )}
        </div>
      </div>
      
      <div className="p-3 mt-4 text-sm bg-white rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span className="font-medium">Default Role: {formData.role === 'admin' ? 'Admin' : 'Manager'}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formData.role === 'admin' 
            ? 'Admins have full system access including settings' 
            : 'Managers can manage their team and approve requests'}
        </p>
      </div>
    </div>
  );
};

export default AccountSetupSection;