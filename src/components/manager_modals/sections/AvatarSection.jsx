import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

const AvatarSection = ({ avatarPreview, name, onAvatarUpload }) => {
  const fileInputRef = useRef(null);

  const triggerAvatarUpload = () => fileInputRef.current.click();

  return (
    <div className="flex flex-col items-center mb-2 text-center">
      <div className="relative group">
        <div className="absolute inset-0 transition-all rounded-full shadow-lg group-hover:shadow-xl -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 blur opacity-20"></div>
        <Avatar className="relative w-32 h-32 border-4 border-white shadow-lg">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} className="object-cover" />
          ) : (
            <AvatarFallback className="text-3xl font-semibold text-white bg-gradient-to-br from-purple-500 to-indigo-600">
              {name?.charAt(0).toUpperCase() || 'M'}
            </AvatarFallback>
          )}
        </Avatar>
        <button
          type="button"
          onClick={triggerAvatarUpload}
          className="absolute p-3 transition-all bg-white rounded-full shadow-lg bottom-2 right-2 hover:shadow-xl hover:bg-gray-50 hover:scale-105 active:scale-95"
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onAvatarUpload}
        />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Click the camera icon to upload profile picture
      </p>
      <p className="mt-1 text-xs text-gray-400">
        JPG, PNG or GIF • Max 2MB
      </p>
    </div>
  );
};

export default AvatarSection;