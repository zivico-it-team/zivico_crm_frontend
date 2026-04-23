import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ActionModal = ({ 
  isOpen, 
  onClose, 
  selectedLeave, 
  actionType, 
  onConfirm 
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onConfirm(comment);
    setComment('');
  };

  const handleClose = () => {
    onClose();
    setComment('');
  };

  if (!selectedLeave || !actionType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Add a comment for <strong>{selectedLeave.user_name || 'Employee'}</strong> regarding their {selectedLeave.leave_type || 'leave'} leave request.
          </p>
          <textarea
            className="w-full h-24 p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional comments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant={actionType === 'approve' ? 'default' : 'destructive'}
            onClick={handleSubmit}
            className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionModal;