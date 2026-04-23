import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import EditProfileModal from '@/components/profile/EditProfileModal';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';

import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import PersonalDetailsTab from './components/PersonalDetailsTab';

const EMPTY_PROFILE = {
  avatar: '',
  personalInfo: {
    fullName: '',
    username: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  },
  professionalInfo: {
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: '',
    reportingManager: '',
    workLocation: '',
  },
};

const toDateInputValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

const mapApiUserToProfile = (user, fallbackProfile = EMPTY_PROFILE) => {
  const professional = user?.professional || {};
  const emergencyContact = user?.emergencyContact || {};

  return {
    ...fallbackProfile,
    avatar: buildAvatarUrl(user),
    personalInfo: {
      ...fallbackProfile.personalInfo,
      fullName: user?.name || '',
      username: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dob: toDateInputValue(user?.dob),
      gender: user?.gender || '',
      nationality: user?.nationality || '',
      address: {
        ...fallbackProfile.personalInfo.address,
        street: user?.addressLine || '',
        city: user?.city || '',
        state: user?.state || '',
        postalCode: user?.postalCode || '',
      },
      emergencyContact: {
        ...fallbackProfile.personalInfo.emergencyContact,
        name: emergencyContact?.name || '',
        phone: emergencyContact?.phone || '',
        relationship: emergencyContact?.relationship || '',
      },
    },
    professionalInfo: {
      ...fallbackProfile.professionalInfo,
      employeeId: professional?.employeeId || '',
      department: professional?.department || '',
      designation: professional?.designation || '',
      joiningDate: toDateInputValue(professional?.joiningDate),
      employmentType: professional?.employmentType || '',
      reportingManager: professional?.reportingManager || '',
      workLocation: professional?.workLocation || '',
    },
  };
};

const mapProfileToApiPayload = (profileData, passwordData = {}) => {
  const personal = profileData?.personalInfo || {};
  const professional = profileData?.professionalInfo || {};
  const address = personal?.address || {};
  const emergencyContact = personal?.emergencyContact || {};

  return {
    name: personal?.fullName || '',
    userName: personal?.username || '',
    email: personal?.email || '',
    phone: personal?.phone || '',
    dob: personal?.dob || null,
    gender: personal?.gender || '',
    nationality: personal?.nationality || '',
    addressLine: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    emergencyContact: {
      name: emergencyContact?.name || '',
      phone: emergencyContact?.phone || '',
      relationship: emergencyContact?.relationship || '',
    },
    professional: {
      employeeId: professional?.employeeId || '',
      designation: professional?.designation || '',
      department: professional?.department || '',
      joiningDate: professional?.joiningDate || null,
      employmentType: professional?.employmentType || '',
      reportingManager: professional?.reportingManager || '',
      workLocation: professional?.workLocation || '',
    },
    ...(passwordData?.currentPassword || passwordData?.newPassword || passwordData?.confirmPassword
      ? {
          currentPassword: passwordData?.currentPassword || '',
          newPassword: passwordData?.newPassword || '',
          confirmPassword: passwordData?.confirmPassword || '',
        }
      : {}),
  };
};

const ManagerProfileView = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fallbackProfile = mapApiUserToProfile(currentUser, EMPTY_PROFILE);

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/profile/me');
        const apiUser = response?.data?.data;
        setProfileData(mapApiUserToProfile(apiUser, fallbackProfile));
      } catch (error) {
        console.error('Error loading manager profile:', error);
        setProfileData(fallbackProfile);
        toast({
          title: 'Profile Load Warning',
          description: 'Could not fetch manager profile from server. Showing available session data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, toast]);

  const syncCurrentUser = (updatedUser) => {
    if (!updatedUser || !currentUser) {
      return;
    }

    const nextSessionUser = {
      ...currentUser,
      ...updatedUser,
      id: updatedUser?._id || updatedUser?.id || currentUser?.id,
      _id: updatedUser?._id || updatedUser?.id || currentUser?._id,
    };

    setCurrentUser(nextSessionUser);
    localStorage.setItem('currentUser', JSON.stringify(nextSessionUser));
  };

  const handleUpdateProfile = async (newData, passwordData = {}) => {
    const mergedProfile = {
      ...profileData,
      ...newData,
      personalInfo: {
        ...profileData.personalInfo,
        ...newData.personalInfo,
        address: {
          ...profileData.personalInfo.address,
          ...newData.personalInfo?.address,
        },
        emergencyContact: {
          ...profileData.personalInfo.emergencyContact,
          ...newData.personalInfo?.emergencyContact,
        },
      },
      professionalInfo: {
        ...profileData.professionalInfo,
        ...newData.professionalInfo,
      },
    };

    try {
      const response = await api.patch('/profile/me', mapProfileToApiPayload(mergedProfile, passwordData));
      const updatedUser = response?.data?.data;
      const normalizedProfile = mapApiUserToProfile(updatedUser, mergedProfile);

      setProfileData(normalizedProfile);
      syncCurrentUser(updatedUser);
      setIsEditModalOpen(false);

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully saved.',
      });
    } catch (error) {
      console.error('Error updating manager profile:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.patch('/profile/me/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const photoData = response?.data?.data || {};
      const imageUrl = buildAvatarUrl(photoData);
      setProfileData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));

      const nextUser = {
        ...currentUser,
        profileImageUrl: photoData?.profileImageUrl || '',
        profilePicture: photoData?.profilePicture || photoData?.profileImageUrl || '',
        profileImageFileName: photoData?.profileImageFileName || '',
        profileImageVersion: photoData?.profileImageVersion || currentUser?.profileImageVersion || null,
        updatedAt: photoData?.updatedAt || currentUser?.updatedAt || null,
      };

      syncCurrentUser(nextUser);
      window.dispatchEvent(new CustomEvent('profile-image-updated', { detail: { user: nextUser } }));

      toast({
        title: 'Photo Updated',
        description: 'Profile picture changed successfully.',
      });
    } catch (error) {
      console.error('Error uploading manager profile photo:', error);
      toast({
        title: 'Upload Failed',
        description: error?.response?.data?.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !profileData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            <p className="text-gray-600">
              Loading {currentUser?.role === 'hr' ? 'HR' : 'manager'} profile...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {profileData?.personalInfo?.fullName || (currentUser?.role === 'hr' ? 'HR' : 'Manager')}
          {' - '}
          {currentUser?.role === 'hr' ? 'HR' : 'Manager'} Profile | CRM
        </title>
      </Helmet>

      <MainLayout>
        <div className="w-full px-4 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
          <ProfileHeader
            profileData={profileData}
            onEditClick={() => setIsEditModalOpen(true)}
            onAvatarUpload={handleAvatarUpload}
          />

          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileTabs.Content value="personal">
                <PersonalDetailsTab profileData={profileData} />
              </ProfileTabs.Content>
            </motion.div>
          </ProfileTabs>
        </div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProfile}
          initialData={profileData}
        />
      </MainLayout>
    </>
  );
};

export default ManagerProfileView;
