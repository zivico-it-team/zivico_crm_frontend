import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AccountSetupSection = ({ formData, onChange }) => {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Setup</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Create a strong password"
            className="h-11 border-gray-300 dark:border-slate-600"
            required
          />
          <div className="flex items-center space-x-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
              <div className={`h-full ${formData.password?.length >= 8 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">{formData.password?.length >= 8 ? 'Strong' : 'Weak'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Re-enter password"
            className="h-11 border-gray-300 dark:border-slate-600"
            required
          />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-xs font-medium text-green-600">✓ Passwords match</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSetupSection;
