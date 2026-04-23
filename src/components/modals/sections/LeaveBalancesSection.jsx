import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Info } from 'lucide-react';

const LEAVE_ITEMS = [
  { key: 'Annual', label: 'Annual Leave', Icon: Calendar, colorClass: 'text-blue-600', checkboxId: 'annualHalfDay' },
  { key: 'Casual', label: 'Casual Leave', Icon: Clock, colorClass: 'text-emerald-600', checkboxId: 'casualHalfDay' },
  { key: 'Special', label: 'Special Leave', Icon: Info, colorClass: 'text-amber-600', checkboxId: 'specialHalfDay' },
  { key: 'Unpaid', label: 'Unpaid Leave', Icon: Clock, colorClass: 'text-purple-600', checkboxId: 'unpaidHalfDay' },
];

const LeaveBalancesSection = ({ editingBalances, onBalanceChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Set Leave Balances</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
          Assign initial leave balances for the new employee
        </p>
      </div>

      {LEAVE_ITEMS.map(({ key, label, Icon, colorClass, checkboxId }) => (
        <div key={key} className="rounded-lg border border-slate-200 p-5 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-4">
            {React.createElement(Icon, { className: `w-5 h-5 ${colorClass}` })}
            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-gray-700 dark:text-slate-300">Total Days</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={editingBalances[key]?.total || 0}
                onChange={(e) => onBalanceChange(key, 'total', e.target.value)}
                className="dark:border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-slate-300">Used Days</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editingBalances[key]?.used || 0}
                  onChange={(e) => onBalanceChange(key, 'used', e.target.value)}
                  className="w-20 dark:border-slate-600"
                />
                <div className="flex items-center gap-1 text-gray-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={editingBalances[key]?.halfDay === 1}
                    onChange={(e) => onBalanceChange(key, 'halfDay', e.target.checked ? 1 : 0)}
                    className="accent-blue-600 dark:accent-blue-400"
                  />
                  <label htmlFor={checkboxId} className="text-sm">Half</label>
                </div>
              </div>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-slate-900/70">
              <div className="text-sm text-gray-700 dark:text-slate-300">Remaining</div>
              <div className={`text-xl font-semibold ${colorClass}`}>
                {Number(editingBalances[key]?.remaining || 0).toFixed(1)} days
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded bg-gray-50 p-3 text-sm text-gray-500 dark:bg-slate-800 dark:text-slate-400">
        <Info className="inline w-4 h-4 mr-1" />
        Total - Used = Remaining. Half day = 0.5 days.
      </div>
    </div>
  );
};

export default LeaveBalancesSection;
