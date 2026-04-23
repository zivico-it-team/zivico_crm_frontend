import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

const AvatarSection = ({ avatarPreview, name, onAvatarUpload }) => {
  const fileInputRef = useRef(null);

  const triggerAvatarUpload = () => fileInputRef.current.click();

  return (
    <div className="mb-2 flex flex-col items-center text-center">
      <div className="group relative">
        <div className="absolute -inset-1 inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur transition-all group-hover:shadow-xl shadow-lg"></div>
        <Avatar className="relative h-32 w-32 border-4 border-white shadow-lg dark:border-slate-800">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-semibold text-white">
              {name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <button
          type="button"
          onClick={triggerAvatarUpload}
          className="absolute bottom-2 right-2 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <Camera className="h-5 w-5 text-gray-700 dark:text-slate-200" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onAvatarUpload}
        />
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
        Click the camera icon to upload profile picture
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
        JPG, PNG or GIF, max 2MB
      </p>
    </div>
  );
};

export default AvatarSection;
