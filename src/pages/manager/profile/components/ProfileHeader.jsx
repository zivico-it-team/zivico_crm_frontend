import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, MapPin, Mail, Phone, Camera } from 'lucide-react';

const ProfileHeader = ({ profileData, onEditClick, onAvatarUpload }) => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">

      {/* Cover Image */}
      <div
        className="relative h-24 bg-center bg-cover sm:h-28 md:h-32 lg:h-40"
        style={{ backgroundImage: 'url(/images/31.webp)' }}
      />

      <div className="px-4 pb-8 sm:px-6 lg:px-8">

        {/* Avatar + Name Section */}
        <div className="relative flex flex-col gap-6 -mt-14 sm:-mt-16 md:flex-row md:items-end md:justify-between">

          {/* Left Side */}
          <div className="flex flex-col w-full gap-4 sm:flex-row sm:items-end sm:gap-6">

            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg sm:w-28 sm:h-28 md:w-32 md:h-32">
                <AvatarImage src={profileData?.avatar} />
                <AvatarFallback className="text-xl text-blue-600 bg-blue-100 sm:text-2xl md:text-3xl">
                  {profileData?.personalInfo?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600 sm:w-5 sm:h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onAvatarUpload}
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {profileData?.personalInfo?.fullName}
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                {profileData?.professionalInfo?.designation || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <Button onClick={onEditClick} className="w-auto whitespace-nowrap">
            Edit Profile
          </Button>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 gap-4 pt-6 mt-6 border-t border-gray-100 sm:grid-cols-2 lg:grid-cols-4">

          <Info icon={<Mail className="w-4 h-4 text-blue-600" />} text={profileData?.personalInfo?.email} />
          <Info icon={<Phone className="w-4 h-4 text-green-600" />} text={profileData?.personalInfo?.phone} />
          <Info icon={<Briefcase className="w-4 h-4 text-purple-600" />} text={profileData?.professionalInfo?.department} />
          <Info icon={<MapPin className="w-4 h-4 text-orange-600" />} text={profileData?.professionalInfo?.workLocation} />

        </div>
      </div>
    </div>
  );
};

const Info = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm text-gray-600">
    <div className="flex-shrink-0 p-2 rounded-lg bg-gray-50">
      {icon}
    </div>
    <span className="truncate">{text || 'Not provided'}</span>
  </div>
);

export default ProfileHeader;