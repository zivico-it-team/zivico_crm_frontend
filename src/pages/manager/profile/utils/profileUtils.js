export const loadProfileData = (currentUser, initialData) => {
  if (!currentUser) return null;
  
  const storedData = localStorage.getItem(`manager_profile_${currentUser.id}`);
  if (storedData) {
    return JSON.parse(storedData);
  } else {
    localStorage.setItem(`manager_profile_${currentUser.id}`, JSON.stringify(initialData));
    return initialData;
  }
};

export const saveProfileData = (currentUser, profileData) => {
  if (currentUser && profileData) {
    localStorage.setItem(`manager_profile_${currentUser.id}`, JSON.stringify(profileData));
  }
};