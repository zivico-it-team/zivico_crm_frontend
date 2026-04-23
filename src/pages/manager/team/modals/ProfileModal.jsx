import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, Briefcase, Mail, Phone, Calendar, MapPin, 
  Cake, Building, BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, formatDate } from '../utils/teamUtils';

const ProfileModal = ({ isOpen, onOpenChange, member }) => {
  if (!member) return null;

  const statusClass = cn(
    "px-2 py-0.5 rounded-full text-xs font-medium border",
    member.status === 'Active'
      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"
      : member.status === 'On Leave'
        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
        : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            Employee Profile
          </DialogTitle>
        </DialogHeader>

        {/* Profile Content */}
        <div className="space-y-5">
          {/* Profile Header with Avatar */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <Avatar className="w-20 h-20 border-4 border-white shadow-md dark:border-slate-600">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-xl text-blue-700 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-200">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300">{member.designation}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={statusClass}>
                  {member.status || 'Active'}
                </span>
                {member.employeeId && (
                  <span className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded-full dark:bg-slate-600 dark:text-slate-100">
                    ID: {member.employeeId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard 
              icon={Mail} 
              label="Email" 
              value={member.email} 
            />
            <InfoCard 
              icon={Phone} 
              label="Phone" 
              value={member.phone} 
            />
            <InfoCard 
              icon={Building} 
              label="Department" 
              value={member.department} 
            />
            <InfoCard 
              icon={Briefcase} 
              label="Designation" 
              value={member.designation} 
            />
            <InfoCard 
              icon={Calendar} 
              label="Joined Date" 
              value={member.joiningDate ? formatDate(member.joiningDate) : 'N/A'} 
            />
            <InfoCard 
              icon={Cake} 
              label="Birth Date" 
              value={member.dateOfBirth ? formatDate(member.dateOfBirth) : 'N/A'} 
            />
            <InfoCard 
              icon={MapPin} 
              label="Location" 
              value={member.workLocation || 'N/A'} 
              className="col-span-2"
            />
          </div>

          {/* Bio Section - if available */}
          {member.bio && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <p className="text-sm text-gray-700 dark:text-slate-200">{member.bio}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Simple Info Card Component
const InfoCard = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800", className)}>
    <Icon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-slate-400" />
    <div>
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{value || 'N/A'}</p>
    </div>
  </div>
);

export default ProfileModal;
