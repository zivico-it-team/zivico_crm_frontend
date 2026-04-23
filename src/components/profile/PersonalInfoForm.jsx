import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';

const PersonalInfoForm = ({
  formData,
  onChange,
  hidePasswordSection = false,
  hideEmergencySection = false,
  showNicField = false,
  showUsernameField = false,
  onPasswordChange = () => {},
}) => {
  const [profileImage, setProfileImage] = useState(formData?.personalInfo?.profileImage || null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        onChange('personalInfo', 'profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (field, value) => {
    const nextPasswordData = { ...passwordData, [field]: value };
    setPasswordData(nextPasswordData);
    setPasswordError('');
    onPasswordChange(nextPasswordData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      {/* <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-gray-200">
            {profileImage ? (
              <AvatarImage src={profileImage} alt="Profile" />
            ) : (
              <AvatarFallback>
                <User className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          <label 
            htmlFor="profile-image-upload" 
            className="absolute bottom-0 right-0 p-1 transition-colors bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
          >
            <Camera className="w-4 h-4 text-white" />
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <p className="text-sm text-gray-500">Click the camera icon to update your profile picture (max 5MB)</p>
        </div>
      </div> */}

      {/* Personal Information Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName"
            value={formData.personalInfo.fullName || ''} 
            onChange={(e) => onChange('personalInfo', 'fullName', e.target.value)} 
            placeholder="Enter your full name"
          />
        </div>
        {showUsernameField && (
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.personalInfo.username || ''}
              onChange={(e) => onChange('personalInfo', 'username', e.target.value)}
              placeholder="Enter your username"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            value={formData.personalInfo.email || ''} 
            onChange={(e) => onChange('personalInfo', 'email', e.target.value)} 
            placeholder="Enter your email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            value={formData.personalInfo.phone || ''} 
            onChange={(e) => onChange('personalInfo', 'phone', e.target.value)} 
            placeholder="Enter your phone number"
          />
        </div>
        {showNicField && (
          <div className="space-y-2">
            <Label htmlFor="nic">NIC</Label>
            <Input
              id="nic"
              value={formData.personalInfo.nic || ''}
              onChange={(e) => onChange('personalInfo', 'nic', e.target.value)}
              placeholder="Enter your NIC number"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob"
            type="date"
            value={formData.personalInfo.dob || ''} 
            onChange={(e) => onChange('personalInfo', 'dob', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select 
            id="gender"
            className="flex w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.personalInfo.gender || ''}
            onChange={(e) => onChange('personalInfo', 'gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city"
            value={formData.personalInfo.address?.city || ''} 
            onChange={(e) => onChange('personalInfo', 'address', { 
              ...formData.personalInfo.address, 
              city: e.target.value 
            })} 
            placeholder="Enter your city"
          />
        </div>
      </div>

      {!hideEmergencySection && (
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="mb-4 text-lg font-medium">Emergency Contact</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name</Label>
              <Input
                id="emergencyName"
                value={formData.personalInfo.emergencyContact?.name || ''}
                onChange={(e) =>
                  onChange('personalInfo', 'emergencyContact', {
                    ...formData.personalInfo.emergencyContact,
                    name: e.target.value,
                  })
                }
                placeholder="Enter emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              <Input
                id="emergencyPhone"
                value={formData.personalInfo.emergencyContact?.phone || ''}
                onChange={(e) =>
                  onChange('personalInfo', 'emergencyContact', {
                    ...formData.personalInfo.emergencyContact,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter emergency contact phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input
                id="emergencyRelationship"
                value={formData.personalInfo.emergencyContact?.relationship || ''}
                onChange={(e) =>
                  onChange('personalInfo', 'emergencyContact', {
                    ...formData.personalInfo.emergencyContact,
                    relationship: e.target.value,
                  })
                }
                placeholder="Enter relationship"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyEmail">Contact Email</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={formData.personalInfo.emergencyContact?.email || ''}
                onChange={(e) =>
                  onChange('personalInfo', 'emergencyContact', {
                    ...formData.personalInfo.emergencyContact,
                    email: e.target.value,
                  })
                }
                placeholder="Enter emergency contact email"
              />
            </div>
          </div>
        </div>
      )}

      {!hidePasswordSection && (
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="mb-4 text-lg font-medium">Change Password</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          {passwordError && (
            <p className="mt-2 text-sm text-red-500">{passwordError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;
