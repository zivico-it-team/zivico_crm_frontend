import MainLayout from '@/components/MainLayout';
import BankDetailsSection from '@/components/profile/BankDetailsSection';
import DocumentsSection from '@/components/profile/DocumentsSection';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { buildAvatarUrl } from '@/lib/avatar';
import { Briefcase, Building, Calendar, Camera, CreditCard, FileText, Mail, MapPin, Phone, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const ensureObject = (value, fallback = {}) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const mapDocumentsFromApi = (documents = []) =>
  ensureArray(documents).map((doc, index) => ({
    id: `${doc?.fileName || doc?.title || 'doc'}-${index}-${doc?.uploadedAt || Date.now()}`,
    name: doc?.fileName || doc?.title || `Document ${index + 1}`,
    size: doc?.size || '',
    uploadDate: toDateInputValue(doc?.uploadedAt),
    type: doc?.fileType || '',
    title: doc?.title || '',
    fileName: doc?.fileName || '',
    fileType: doc?.fileType || '',
    fileUrl: doc?.fileUrl || '',
    uploadedAt: doc?.uploadedAt || new Date().toISOString(),
  }));

const mapApiUserToProfile = (user, fallbackProfile) => {
  const professional = ensureObject(user?.professional, {});
  const emergencyContact = ensureObject(user?.emergencyContact, {});
  const bank = ensureObject(user?.bank, {});

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
      nic: user?.nic || '',
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
        email: emergencyContact?.email || '',
      },
    },
    professionalInfo: {
      ...fallbackProfile.professionalInfo,
      employeeId: professional?.employeeId || '',
      department: professional?.department || '',
      designation: professional?.designation || professional?.position || '',
      joiningDate: toDateInputValue(professional?.joiningDate),
      employmentType: professional?.employmentType || 'Full-time',
      workLocation: professional?.workLocation || '',
      reportingManager: professional?.reportingManager || '',
    },
    bankDetails: {
      ...fallbackProfile.bankDetails,
      bankName: bank?.bankName || '',
      accountHolder: bank?.accountHolder || user?.name || '',
      accountNumber: bank?.accountNumberMasked || bank?.accountNumber || '',
      branch: bank?.branch || bank?.ifscCode || '',
      ifscCode: bank?.ifscCode || '',
    },
    documents: mapDocumentsFromApi(user?.documents),
  };
};

const mapProfileToApiPayload = (profile) => {
  const personal = profile?.personalInfo || {};
  const professional = profile?.professionalInfo || {};
  const address = personal?.address || {};
  const emergencyContact = personal?.emergencyContact || {};
  const bank = profile?.bankDetails || {};

  return {
    name: personal?.fullName || '',
    email: personal?.email || '',
    userName: personal?.username || '',
    phone: personal?.phone || '',
    dob: personal?.dob || null,
    nic: personal?.nic || '',
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
      email: emergencyContact?.email || '',
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
    bank: {
      bankName: bank?.bankName || '',
      accountHolder: bank?.accountHolder || personal?.fullName || '',
      accountNumberMasked: bank?.accountNumber || '',
      branch: bank?.branch || bank?.ifscCode || '',
    },
    documents: ensureArray(profile?.documents).map((doc) => ({
      title: doc?.title || doc?.name || '',
      fileUrl: doc?.fileUrl || '',
      fileName: doc?.fileName || doc?.name || '',
      fileType: doc?.fileType || doc?.type || '',
      uploadedAt: doc?.uploadedAt || (doc?.uploadDate ? new Date(doc.uploadDate).toISOString() : new Date().toISOString()),
    })),
  };
};

const ProfileView = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultProfile = useMemo(() => ({
    avatar: '',
    personalInfo: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      dob: '',
      nic: '',
      gender: '',
      maritalStatus: '',
      nationality: '',
      address: { street: '', city: '', state: '', postalCode: '', country: '' },
      emergencyContact: { name: '', phone: '', relationship: '', email: '' },
    },
    professionalInfo: {
      employeeId: '',
      department: '',
      designation: '',
      joiningDate: '',
      employmentType: 'Full-time',
      workLocation: '',
      reportingManager: '',
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      branch: '',
      ifscCode: '',
      accountType: 'Savings',
      accountHolder: '',
    },
    documents: [],
  }), []);

  useEffect(() => {
    if (!currentUser) return;

    const fallbackProfile = {
      ...defaultProfile,
      personalInfo: {
        ...defaultProfile.personalInfo,
        fullName: currentUser?.name || 'User',
        username: currentUser?.userName || currentUser?.username || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        nic: currentUser?.nic || '',
      },
      professionalInfo: {
        ...defaultProfile.professionalInfo,
        employeeId: currentUser?.professional?.employeeId || currentUser?.employeeId || '',
        department: currentUser?.professional?.department || currentUser?.department || '',
        designation: currentUser?.professional?.designation || currentUser?.designation || '',
      },
    };

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/profile/me');
        const user = res?.data?.data;
        setProfile(mapApiUserToProfile(user, fallbackProfile));
      } catch (error) {
        console.error('Error loading profile from API:', error);
        setProfile(fallbackProfile);
        toast({
          title: 'Profile Load Warning',
          description: 'Could not fetch profile from server. Showing available data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, defaultProfile, toast]);

  const saveProfile = async (updatedProfile, successToast = null, passwordData = null) => {
    const payload = mapProfileToApiPayload(updatedProfile);
    const hasPasswordInput =
      !!passwordData?.currentPassword || !!passwordData?.newPassword || !!passwordData?.confirmPassword;

    if (hasPasswordInput) {
      payload.currentPassword = String(passwordData.currentPassword || '');
      payload.newPassword = String(passwordData.newPassword || '');
      payload.confirmPassword = String(passwordData.confirmPassword || '');
    }

    const res = await api.patch('/profile/me', payload);
    const updatedUser = res?.data?.data;
    const normalizedProfile = mapApiUserToProfile(updatedUser, defaultProfile);

    setProfile(normalizedProfile);

    if (updatedUser && setCurrentUser && currentUser) {
      const nextSessionUser = {
        ...currentUser,
        ...updatedUser,
        id: updatedUser?._id || updatedUser?.id || currentUser?.id,
        _id: updatedUser?._id || updatedUser?.id || currentUser?._id,
      };
      setCurrentUser(nextSessionUser);
      localStorage.setItem('currentUser', JSON.stringify(nextSessionUser));
    }

    if (successToast) {
      toast(successToast);
    }
  };

  const handleUpdateProfile = async (newData, passwordData = {}) => {
    const merged = {
      ...profile,
      ...newData,
      personalInfo: {
        ...profile.personalInfo,
        ...newData.personalInfo,
        address: {
          ...profile.personalInfo.address,
          ...newData.personalInfo?.address,
        },
        emergencyContact: {
          ...profile.personalInfo.emergencyContact,
          ...newData.personalInfo?.emergencyContact,
        },
      },
      professionalInfo: {
        ...profile.professionalInfo,
        ...newData.professionalInfo,
      },
    };
    const hasPasswordInput =
      !!passwordData.currentPassword || !!passwordData.newPassword || !!passwordData.confirmPassword;

    if (hasPasswordInput) {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({
          title: 'Password Update Failed',
          description: 'Current password, new password, and confirm password are required.',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Password Update Failed',
          description: 'New password and confirm password do not match.',
          variant: 'destructive',
        });
        return;
      }

      if (String(passwordData.newPassword).length < 6) {
        toast({
          title: 'Password Update Failed',
          description: 'New password must be at least 6 characters.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await saveProfile(
        merged,
        {
          title: hasPasswordInput ? 'Profile & Password Updated' : 'Profile Updated',
          description: hasPasswordInput
            ? 'Your profile and password have been updated.'
            : 'Your information has been successfully saved.',
        },
        passwordData
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast({ title: 'Invalid File', description: 'Please select an image file.', variant: 'destructive' });
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast({ title: 'File Too Large', description: 'Please select an image smaller than 5MB.', variant: 'destructive' });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.patch('/profile/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const photoData = res?.data?.data || {};
      const imageUrl = buildAvatarUrl(photoData);
      setProfile((prev) => ({ ...prev, avatar: imageUrl }));

      if (setCurrentUser && currentUser) {
        const nextSessionUser = {
          ...currentUser,
          profileImageUrl: photoData?.profileImageUrl || '',
          profilePicture: photoData?.profilePicture || photoData?.profileImageUrl || '',
          profileImageFileName: photoData?.profileImageFileName || '',
          profileImageVersion: photoData?.profileImageVersion || currentUser?.profileImageVersion || null,
          updatedAt: photoData?.updatedAt || currentUser?.updatedAt || null,
        };
        setCurrentUser(nextSessionUser);
        localStorage.setItem('currentUser', JSON.stringify(nextSessionUser));
        window.dispatchEvent(new CustomEvent('profile-image-updated', { detail: { user: nextSessionUser } }));
      }

      toast({ title: 'Photo Updated', description: 'Profile picture changed successfully.' });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({ title: 'Upload Failed', description: 'Failed to upload image. Please try again.', variant: 'destructive' });
    }
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg sm:p-4 bg-gray-50 sm:gap-4">
      <div className="p-2 bg-white rounded-full shadow-sm">{React.createElement(Icon, { className: 'w-4 h-5 text-gray-600 sm:w-5' })}</div>
      <div>
        <p className="text-xs tracking-wide text-gray-500 uppercase">{label}</p>
        <p className="font-semibold text-gray-900">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  const DetailItem = ({ label, value }) => (
    <div className="pb-2 border-b border-gray-100">
      <p className="mb-1 text-sm font-medium text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'Not specified'}</p>
    </div>
  );

  if (loading || !profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  const tabs = [
    { value: 'personal', icon: User, label: 'Personal' },
    { value: 'professional', icon: Briefcase, label: 'Professional' },
    { value: 'bank', icon: CreditCard, label: 'Bank & Salary' },
    { value: 'documents', icon: FileText, label: 'Documents' },
  ];

  const fullName = profile?.personalInfo?.fullName || 'User';

  return (
    <>
      <Helmet><title>{fullName} - Profile | CRM</title></Helmet>
      <MainLayout>
        <div className="w-full px-4 mx-auto space-y-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
            <div
              className="relative bg-center bg-cover h-28 sm:h-32"
              style={{ backgroundImage: 'url(/images/31.webp)' }}
            />
            <div className="px-5 pb-8 sm:px-8">
              <div className="flex flex-col gap-5 -mt-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg sm:w-32 sm:h-32">
                      <AvatarImage src={profile.avatar} alt={fullName} />
                      <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow cursor-pointer">
                      <Camera size={18} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                      {fullName}
                    </h1>
                    <p className="text-gray-500">
                      {profile.professionalInfo.designation || 'Not specified'}
                    </p>
                  </div>
                </div>

                <Button onClick={() => setIsEditModalOpen(true)}>
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 py-3 border-t mt-6 border-gray-100 sm:py-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
                {[
                  { icon: Mail, value: profile.personalInfo.email, bg: 'bg-blue-50', color: 'text-blue-600' },
                  { icon: Phone, value: profile.personalInfo.phone, bg: 'bg-green-50', color: 'text-green-600' },
                  { icon: Briefcase, value: profile.professionalInfo.department, bg: 'bg-purple-50', color: 'text-purple-600' },
                  { icon: MapPin, value: profile.professionalInfo.workLocation || "Nugegoda", bg: 'bg-orange-50', color: 'text-orange-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 truncate">
                    <div className={`p-1.5 rounded-lg sm:p-2 ${item.bg}`}><item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color}`} /></div>
                    <span className="truncate">{item.value || 'Not provided'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex justify-start w-full h-auto p-1 overflow-x-auto bg-white border border-gray-200 flex-nowrap rounded-xl hide-scrollbar sm:flex-wrap sm:overflow-visible">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg sm:px-4 sm:py-2 sm:text-sm whitespace-nowrap data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div>
              <TabsContent value="personal" className="space-y-6">
                <div className="p-4 bg-white border border-gray-200 shadow-sm sm:p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base font-semibold sm:text-lg">Personal Details</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-x-12">
                    {[
                      { label: 'Full Name', value: profile.personalInfo.fullName },
                      { label: 'Username', value: profile.personalInfo.username },
                      { label: 'Phone Number', value: profile.personalInfo.phone },
                      { label: 'NIC', value: profile.personalInfo.nic },
                      { label: 'Date of Birth', value: profile.personalInfo.dob },
                      { label: 'Gender', value: profile.personalInfo.gender },
                      { label: 'City', value: profile.personalInfo.address.city },
                    ].map((item, idx) => <DetailItem key={idx} label={item.label} value={item.value} />)}
                  </div>
                </div>

                <div className="p-4 bg-white border border-gray-200 shadow-sm sm:p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base font-semibold sm:text-lg">Emergency Contact</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-x-12">
                    {[
                      { label: 'Contact Name', value: profile.personalInfo.emergencyContact.name },
                      { label: 'Contact Phone', value: profile.personalInfo.emergencyContact.phone },
                      { label: 'Relationship', value: profile.personalInfo.emergencyContact.relationship },
                      { label: 'Contact Email', value: profile.personalInfo.emergencyContact.email },
                    ].map((item, idx) => <DetailItem key={idx} label={item.label} value={item.value} />)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <div className="p-4 bg-white border border-gray-200 shadow-sm sm:p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base font-semibold sm:text-lg">Employment Details</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {[
                      { label: 'Employee ID', value: profile.professionalInfo.employeeId, icon: User },
                      { label: 'Department', value: profile.professionalInfo.department, icon: Building },
                      { label: 'Position', value: profile.professionalInfo.designation, icon: Briefcase },
                      { label: 'Joining Date', value: profile.professionalInfo.joiningDate, icon: Calendar },
                      { label: 'Employment Type', value: profile.professionalInfo.employmentType, icon: FileText },
                      { label: 'Reporting Manager', value: profile.professionalInfo.reportingManager, icon: User },
                    ].map((item, idx) => <InfoRow key={idx} label={item.label} value={item.value} icon={item.icon} />)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bank">
                <BankDetailsSection
                  data={profile.bankDetails}
                  onSave={async (d) => {
                    try {
                      await saveProfile({ ...profile, bankDetails: { ...profile.bankDetails, ...d } }, {
                        title: 'Success',
                        description: 'Bank details updated successfully.',
                      });
                    } catch (error) {
                      console.error('Error updating bank details:', error);
                      toast({
                        title: 'Update Failed',
                        description: error?.response?.data?.message || 'Failed to update bank details.',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsSection
                  documents={ensureArray(profile.documents)}
                  onUpdate={async (d) => {
                    try {
                      await saveProfile({ ...profile, documents: d }, {
                        title: 'Documents Updated',
                        description: 'Your documents have been updated.',
                      });
                    } catch (error) {
                      console.error('Error updating documents:', error);
                      toast({
                        title: 'Update Failed',
                        description: error?.response?.data?.message || 'Failed to update documents.',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProfile}
          initialData={profile}
          showNicField
          showUsernameField
        />
      </MainLayout>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default ProfileView;
