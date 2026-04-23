import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Mail, Phone, Briefcase, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { buildAvatarUrl } from "@/lib/avatar";

import EditProfileModal from "@/components/profile/EditProfileModal";

const ProfileView = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("personal");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- DEFAULT STRUCTURE ---------------- */

  const defaultProfile = {
    avatar: "",
    personalInfo: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      dob: "",
      gender: "",
      maritalStatus: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
      },
    },
    professionalInfo: {
      designation: "",
      workLocation: "",
    },
    settings: {},
  };

  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const mapApiUserToProfile = (user, fallback = defaultProfile) => ({
    ...fallback,
    avatar: buildAvatarUrl(user),
    personalInfo: {
      ...fallback.personalInfo,
      fullName: user?.name || "",
      username: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: toDateInputValue(user?.dob),
      gender: user?.gender || "",
      maritalStatus: user?.maritalStatus || "",
      address: {
        ...fallback.personalInfo.address,
        street: user?.addressLine || "",
        city: user?.city || "",
        state: user?.state || "",
        postalCode: user?.postalCode || "",
      },
    },
    professionalInfo: {
      ...fallback.professionalInfo,
      designation: user?.professional?.designation || "",
      workLocation: user?.professional?.workLocation || "",
    },
  });

  const mapProfileToAdminPayload = (profile = {}) => {
    const personal = profile?.personalInfo || {};
    const address = personal?.address || {};

    return {
      name: personal?.fullName || "",
      userName: personal?.username || "",
      email: personal?.email || "",
      phone: personal?.phone || "",
      dob: personal?.dob || null,
      gender: personal?.gender || "",
      nationality: personal?.nationality || "",
      addressLine: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      professional: {
        designation: profile?.professionalInfo?.designation || "",
        workLocation: profile?.professionalInfo?.workLocation || "",
      },
    };
  };

  /* ---------------- UTIL FUNCTIONS ---------------- */

  const syncCurrentUser = (updatedUser, fallbackName = "") => {
    if (!updatedUser || !currentUser) return null;

    const nextSessionUser = {
      ...currentUser,
      ...updatedUser,
      name: updatedUser?.name || fallbackName || currentUser?.name || "",
      id: updatedUser?._id || updatedUser?.id || currentUser?.id,
      _id: updatedUser?._id || updatedUser?.id || currentUser?._id,
    };

    setCurrentUser(nextSessionUser);
    localStorage.setItem("currentUser", JSON.stringify(nextSessionUser));
    return nextSessionUser;
  };

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fallbackProfile = mapApiUserToProfile(currentUser, defaultProfile);

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/profile/me");
        const apiUser = response?.data?.user;
        const mapped = mapApiUserToProfile(apiUser, fallbackProfile);
        setProfileData(mapped);
        localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(mapped));
      } catch (error) {
        try {
          const stored = localStorage.getItem(`profile_${currentUser.id}`);
          const parsed = stored ? JSON.parse(stored) : null;
          if (parsed) {
            setProfileData({
              ...fallbackProfile,
              ...parsed,
              personalInfo: {
                ...fallbackProfile.personalInfo,
                ...parsed.personalInfo,
                address: {
                  ...fallbackProfile.personalInfo.address,
                  ...parsed.personalInfo?.address,
                },
              },
            });
          } else {
            setProfileData(fallbackProfile);
          }
        } catch {
          setProfileData(fallbackProfile);
        }

        toast({
          title: "Profile Load Warning",
          description: "Could not fetch admin profile from server. Showing available session data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, toast]);

  /* ---------------- UPDATE PROFILE ---------------- */

  const handleUpdateProfile = async (newData, passwordData = {}) => {
    const updated = {
      ...profileData,
      ...newData,
      personalInfo: {
        ...profileData.personalInfo,
        ...newData.personalInfo,
        address: {
          ...profileData.personalInfo.address,
          ...newData.personalInfo?.address,
        },
      },
    };
    const hasPasswordInput =
      !!passwordData.currentPassword || !!passwordData.newPassword || !!passwordData.confirmPassword;

    if (hasPasswordInput) {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({
          title: "Password Update Failed",
          description: "Current password, new password, and confirm password are required.",
          variant: "destructive",
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Password Update Failed",
          description: "New password and confirm password do not match.",
          variant: "destructive",
        });
        return;
      }

      if (String(passwordData.newPassword).length < 6) {
        toast({
          title: "Password Update Failed",
          description: "New password must be at least 6 characters.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (hasPasswordInput) {
        await api.patch("/admin/profile/me/password", {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmPassword,
        });
      }

      const response = await api.patch("/admin/profile/me", mapProfileToAdminPayload(updated));
      const updatedUser = response?.data?.user || {};
      const normalizedProfile = mapApiUserToProfile(updatedUser, updated);

      setProfileData(normalizedProfile);
      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(normalizedProfile));

      const nextUser = syncCurrentUser(
        updatedUser,
        normalizedProfile?.personalInfo?.fullName || updated?.personalInfo?.fullName || ""
      );
      if (nextUser) {
        window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { user: nextUser } }));
      }
      setIsEditModalOpen(false);

      toast({
        title: hasPasswordInput ? "Profile & Password Updated" : "Profile Updated",
        description: hasPasswordInput
          ? "Your profile and password have been updated."
          : "Your information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error?.response?.data?.message || "Unable to update profile.",
        variant: "destructive",
      });
    }
  };

  /* ---------------- AVATAR UPLOAD ---------------- */

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast({
        title: "Invalid File",
        description: "Select an image file",
        variant: "destructive",
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast({
        title: "File Too Large",
        description: "Max size 5MB",
        variant: "destructive",
      });
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.patch("/profile/me/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const photoData = response?.data?.data || {};
      const imageUrl = buildAvatarUrl(photoData);

      const nextProfile = { ...profileData, avatar: imageUrl };
      setProfileData(nextProfile);
      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(nextProfile));

      const nextUser = syncCurrentUser({
        ...currentUser,
        profileImageUrl: photoData?.profileImageUrl || "",
        profilePicture: photoData?.profilePicture || photoData?.profileImageUrl || "",
        profileImageFileName: photoData?.profileImageFileName || "",
        profileImageVersion:
          photoData?.profileImageVersion || currentUser?.profileImageVersion || null,
        updatedAt: photoData?.updatedAt || currentUser?.updatedAt || null,
      });

      if (nextUser) {
        window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { user: nextUser } }));
      }

      toast({
        title: "Photo Updated",
        description: "Profile picture updated.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error?.response?.data?.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      e.target.value = "";
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <Helmet>
        <title>
          {profileData.personalInfo.fullName} - Profile
        </title>
      </Helmet>

      <MainLayout>
        <div className="space-y-6">

          {/* ---------- HEADER ---------- */}

          <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
            <div
              className="relative bg-center bg-cover h-28 sm:h-32"
              style={{
                backgroundImage: "url(/images/3.webp)",
              }}
            />

            <div className="px-5 pb-8 sm:px-8">
              <div className="flex flex-col gap-5 -mt-14 sm:flex-row sm:items-end sm:justify-between">

                {/* Avatar + Name */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg sm:w-32 sm:h-32">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback>
                        {profileData.personalInfo.fullName?.charAt(0)}
                      </AvatarFallback>
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
                      {profileData.personalInfo.fullName}
                    </h1>
                    <p className="text-gray-500">
                      {profileData.professionalInfo?.designation || "CEO"}
                    </p>
                  </div>
                </div>

                <Button onClick={() => setIsEditModalOpen(true)}>
                  Edit Profile
                </Button>
              </div>

              {/* Contact Info */}

              <div className="grid gap-4 pt-6 mt-6 text-sm border-t md:grid-cols-4">
                <InfoItem
                  icon={<Mail size={16} />}
                  text={profileData.personalInfo.email}
                />

                <InfoItem
                  icon={<Phone size={16} />}
                  text={
                    profileData.personalInfo.phone || "Not provided"
                  }
                />

                <InfoItem
                  icon={<Briefcase size={16} />}
                  text={profileData.professionalInfo?.designation || "Not provided"}
                />

                <InfoItem
                  icon={<MapPin size={16} />}
                  text={profileData.professionalInfo?.workLocation || "Not provided"}
                />
              </div>
            </div>
          </div>

          {/* ---------- PERSONAL TAB ---------- */}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TabsContent value="personal">
                <div className="p-6 bg-white border shadow-sm rounded-xl">
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                      Personal Details
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <DetailItem
                      label="Full Name"
                      value={profileData.personalInfo.fullName}
                    />

                    <DetailItem
                      label="Date of Birth"
                      value={
                        profileData.personalInfo.dob || "Not specified"
                      }
                    />

                    <DetailItem
                      label="Gender"
                      value={
                        profileData.personalInfo.gender ||
                        "Not specified"
                      }
                    />

                    <DetailItem
                      label="City"
                      value={
                        profileData.personalInfo.address.city ||
                        "Not specified"
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdateProfile}
            initialData={profileData}
            hideEmergencySection
            hideProfessionalSection
            showAdminBasicProfessionalFields
            showUsernameField
          />
        </div>
      </MainLayout>
    </>
  );
};

/* ---------- SMALL REUSABLE COMPONENTS ---------- */

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-600">
    <div className="p-2 bg-gray-100 rounded">{icon}</div>
    <span className="truncate">{text}</span>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="pb-2 border-b">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default ProfileView;
