import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ShieldAlert, Bell, Eye, LogOut } from 'lucide-react';

const AccountSettingsSection = ({ settings, onUpdate }) => {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const handleToggle = (section, field) => {
    if (section) {
      onUpdate({
        ...settings,
        [section]: {
          ...settings[section],
          [field]: !settings[section][field]
        }
      });
    } else {
      onUpdate({
        ...settings,
        [field]: !settings[field]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-50">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Security & Privacy</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Secure your account with 2FA.</p>
            </div>
            <Switch 
              checked={settings.twoFactor} 
              onCheckedChange={() => handleToggle(null, 'twoFactor')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Profile Visibility</Label>
              <p className="text-sm text-gray-500">Make your profile public to company.</p>
            </div>
            <Switch 
              checked={settings.privacy.profileVisibility === 'public'} 
              onCheckedChange={(checked) => onUpdate({
                ...settings,
                privacy: { profileVisibility: checked ? 'public' : 'private' }
              })} 
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default AccountSettingsSection;