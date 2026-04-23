// src/components/manager_modals/sections/LeaveBalancesSection.jsx
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Info } from 'lucide-react';

const LeaveBalancesSection = ({ editingBalances, onBalanceChange }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Set Leave Balances</h3>
        <p className="mt-1 text-sm text-gray-600">
          Assign initial leave balances for the new manager
        </p>
      </div>

      <div className="p-5 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium">Annual Leave</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm">Total Days</label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={editingBalances.Annual?.total || 24}
              onChange={(e) => onBalanceChange('Annual', 'total', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Used Days</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={editingBalances.Annual?.used || 0}
                onChange={(e) => onBalanceChange('Annual', 'used', e.target.value)}
                className="w-20"
              />
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="annualHalfDay"
                  checked={editingBalances.Annual?.halfDay === 1}
                  onChange={(e) => onBalanceChange('Annual', 'halfDay', e.target.checked ? 1 : 0)}
                />
                <label htmlFor="annualHalfDay" className="text-sm">Half</label>
              </div>
            </div>
          </div>
          <div className="p-3 rounded bg-gray-50">
            <div className="text-sm">Remaining</div>
            <div className="text-xl font-semibold text-purple-600">
              {(editingBalances.Annual?.remaining || 24).toFixed(1)} days
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h4 className="font-medium">Casual Leave</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm">Total Days</label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={editingBalances.Casual?.total || 10}
              onChange={(e) => onBalanceChange('Casual', 'total', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Used Days</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={editingBalances.Casual?.used || 0}
                onChange={(e) => onBalanceChange('Casual', 'used', e.target.value)}
                className="w-20"
              />
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="casualHalfDay"
                  checked={editingBalances.Casual?.halfDay === 1}
                  onChange={(e) => onBalanceChange('Casual', 'halfDay', e.target.checked ? 1 : 0)}
                />
                <label htmlFor="casualHalfDay" className="text-sm">Half</label>
              </div>
            </div>
          </div>
          <div className="p-3 rounded bg-gray-50">
            <div className="text-sm">Remaining</div>
            <div className="text-xl font-semibold text-emerald-600">
              {(editingBalances.Casual?.remaining || 10).toFixed(1)} days
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium">Medical Leave</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm">Total Days</label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={editingBalances.Medical?.total || 21}
              onChange={(e) => onBalanceChange('Medical', 'total', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Used Days</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={editingBalances.Medical?.used || 0}
                onChange={(e) => onBalanceChange('Medical', 'used', e.target.value)}
                className="w-20"
              />
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="medicalHalfDay"
                  checked={editingBalances.Medical?.halfDay === 1}
                  onChange={(e) => onBalanceChange('Medical', 'halfDay', e.target.checked ? 1 : 0)}
                />
                <label htmlFor="medicalHalfDay" className="text-sm">Half</label>
              </div>
            </div>
          </div>
          <div className="p-3 rounded bg-gray-50">
            <div className="text-sm">Remaining</div>
            <div className="text-xl font-semibold text-blue-600">
              {(editingBalances.Medical?.remaining || 21).toFixed(1)} days
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 text-sm text-gray-500 rounded bg-gray-50">
        <Info className="inline w-4 h-4 mr-1" />
        Total - Used = Remaining. Half day = 0.5 days.
      </div>
    </div>
  );
};

export default LeaveBalancesSection;
