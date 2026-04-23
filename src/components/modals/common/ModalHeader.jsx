import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ModalHeader = ({ isProfile, employee, employeeId }) => {
  return (
    <DialogHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pb-4 pt-6 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isProfile ? 'Edit Profile' : employee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              {isProfile ? 'Update your profile information' : 'Fill in employee details below'}
            </p>
          </div>
        </div>
        {employee && (
          <div className="rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300">
            ID: <span className="font-mono">{employee.professional?.employeeId || 'E/M No'}</span>
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

export default ModalHeader;
