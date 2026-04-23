import React from 'react';

const PersonalDetailsTab = ({ profileData }) => {
  const personal = profileData?.personalInfo || {};
  const address = personal?.address || {};

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border border-gray-200 shadow-sm sm:p-6 lg:p-8 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-12">

          <Detail label="Full Name" value={personal?.fullName} />
          <Detail label="Date of Birth" value={personal?.dob} />
          <Detail label="Gender" value={personal?.gender} />
          <Detail label="City" value={personal?.address.city || "Nugegoda"} />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="pb-3 border-b border-gray-100">
    <p className="mb-1 text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 break-words">
      {value || 'Not specified'}
    </p>
  </div>
);

export default PersonalDetailsTab;
