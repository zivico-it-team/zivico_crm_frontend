import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ModalHeader = ({ isProfile, manager, managerId }) => {
  return (
    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isProfile ? 'Edit Profile' : manager ? 'Edit Manager' : 'Add New Manager'}
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-600">
              {isProfile ? 'Update your profile information' : 'Fill in manager details below'}
            </p>
          </div>
        </div>
        {manager && (
          <div className="px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-100 border border-purple-200 rounded-full shadow-sm">
            ID: <span className="font-mono">{managerId}</span>
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

export default ModalHeader;