import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Check, X } from 'lucide-react';

const ChangePasswordForm = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const checkStrength = (password) => {
    setValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  };

  const handleChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (field === 'new') checkStrength(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (!Object.values(validation).every(Boolean)) {
      toast({
        title: "Weak Password",
        description: "Please meet all password requirements.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Password changed successfully."
      });
      setPasswords({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-blue-50">
          <Lock className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input 
            type="password" 
            value={passwords.current}
            onChange={(e) => handleChange('current', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input 
            type="password"
            value={passwords.new}
            onChange={(e) => handleChange('new', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
          <div className={`flex items-center gap-1 ${validation.length ? 'text-green-600' : ''}`}>
            {validation.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            Min 8 chars
          </div>
          <div className={`flex items-center gap-1 ${validation.uppercase ? 'text-green-600' : ''}`}>
            {validation.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            Uppercase
          </div>
          <div className={`flex items-center gap-1 ${validation.lowercase ? 'text-green-600' : ''}`}>
            {validation.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            Lowercase
          </div>
          <div className={`flex items-center gap-1 ${validation.number ? 'text-green-600' : ''}`}>
            {validation.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            Number
          </div>
          <div className={`flex items-center gap-1 ${validation.special ? 'text-green-600' : ''}`}>
            {validation.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            Special Char
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input 
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleChange('confirm', e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">Change Password</Button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;