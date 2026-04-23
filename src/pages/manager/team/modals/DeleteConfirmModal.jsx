import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Remove Member",
  isBulk = false,
  selectedCount = 0 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            {message}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This action cannot be undone. All data will be permanently removed.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;