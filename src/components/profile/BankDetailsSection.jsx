import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreditCard, Edit } from 'lucide-react';

const BankDetailsSection = ({ data, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });

  useEffect(() => {
    setFormData({ ...data });
  }, [data]);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">Bank Name</p>
          <p className="font-medium text-gray-900">{data.bankName}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">Account Holder</p>
          <p className="font-medium text-gray-900">{data.accountHolder}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">Account Number</p>
          <p className="font-medium tracking-widest text-gray-900">
            **** **** {(data.accountNumber || '').slice(-4)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">Branch</p>
          <p className="font-medium text-gray-900">{data.branch || data.ifscCode}</p>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Update Bank Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={formData.accountHolder || ''}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                type="password"
                value={formData.accountNumber || ''}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                value={formData.branch || ''}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankDetailsSection;