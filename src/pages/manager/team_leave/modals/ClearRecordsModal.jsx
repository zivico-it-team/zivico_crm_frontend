import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { clearOptions } from '../utils/leaveData';
import { getLeaveStats } from '../utils/leaveUtils';

const ClearRecordsModal = ({ 
  isOpen, 
  onClose, 
  leaves, 
  clearOption, 
  setClearOption, 
  onConfirm 
}) => {
  const stats = getLeaveStats(leaves);

  const getOptionCount = (option) => {
    switch(option) {
      case 'all': return leaves.length;
      case 'approved': return stats.approved;
      case 'rejected': return stats.rejected;
      case 'pending': return stats.pending;
      default: return 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Leave Requests</DialogTitle>
          <DialogDescription>
            Select which leave requests you want to clear. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {clearOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`clear-${option.value}`}
                  name="clearOption"
                  value={option.value}
                  checked={clearOption === option.value}
                  onChange={(e) => setClearOption(e.target.value)}
                  className="w-4 h-4 text-red-600"
                />
                <label htmlFor={`clear-${option.value}`} className="text-sm font-medium text-gray-700">
                  {option.label} ({getOptionCount(option.value)})
                </label>
              </div>
            ))}
          </div>
          
          {leaves.length > 0 && (
            <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> This will permanently delete {clearOption === 'all' ? 'all' : clearOption} leave request{clearOption === 'all' ? 's' : ''}. This action cannot be undone.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={leaves.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearRecordsModal;