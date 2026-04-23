import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export const CancelLeaveDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-slate-100">
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-amber-500" />
            Cancel Leave Application
          </DialogTitle>
          <DialogDescription className="dark:text-slate-300">
            Are you sure you want to cancel this leave application? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Keep Application
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Yes, Cancel Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
