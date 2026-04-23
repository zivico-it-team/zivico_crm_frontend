import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PersonalInfoForm from './PersonalInfoForm';

const EditProfileModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  hidePasswordSection = false,
  hideEmergencySection = false,
  hideProfessionalSection = false,
  showAdminBasicProfessionalFields = false,
  showUsernameField = false,
}) => {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      nationality: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: ''
      },
      emergencyContact: {
        name: '',
        phone: ''
      }
    },
    professionalInfo: {
      designation: '',
      department: '',
      joiningDate: '',
      employmentType: '',
      reportingManager: '',
      workLocation: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    }
    if (isOpen) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [initialData, isOpen]);

  const handlePersonalInfoChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = hideProfessionalSection && !showAdminBasicProfessionalFields
      ? { ...formData, professionalInfo: {} }
      : formData;
    onSave(payload, passwordData);
  };

  const handleProfessionalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
          <PersonalInfoForm 
            formData={formData}
            onChange={handlePersonalInfoChange}
            hidePasswordSection={hidePasswordSection}
            hideEmergencySection={hideEmergencySection}
            showUsernameField={showUsernameField}
            onPasswordChange={setPasswordData}
          />

          {showAdminBasicProfessionalFields && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-medium">Professional Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.professionalInfo?.designation || ''}
                    onChange={(e) => handleProfessionalInfoChange('designation', e.target.value)}
                    placeholder="Enter designation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workLocation">Working Location</Label>
                  <Input
                    id="workLocation"
                    value={formData.professionalInfo?.workLocation || ''}
                    onChange={(e) => handleProfessionalInfoChange('workLocation', e.target.value)}
                    placeholder="Enter working location"
                  />
                </div>
              </div>
            </div>
          )}

          {!hideProfessionalSection && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-medium">Professional Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.professionalInfo?.employeeId || ''}
                    onChange={(e) => handleProfessionalInfoChange('employeeId', e.target.value)}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.professionalInfo?.joiningDate || ''}
                    onChange={(e) => handleProfessionalInfoChange('joiningDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Input
                    id="employmentType"
                    value={formData.professionalInfo?.employmentType || ''}
                    onChange={(e) => handleProfessionalInfoChange('employmentType', e.target.value)}
                    placeholder="Enter employment type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportingManager">Reporting Manager</Label>
                  <Input
                    id="reportingManager"
                    value={formData.professionalInfo?.reportingManager || ''}
                    onChange={(e) => handleProfessionalInfoChange('reportingManager', e.target.value)}
                    placeholder="Enter reporting manager"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Input
                    id="workLocation"
                    value={formData.professionalInfo?.workLocation || ''}
                    onChange={(e) => handleProfessionalInfoChange('workLocation', e.target.value)}
                    placeholder="Enter work location"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
