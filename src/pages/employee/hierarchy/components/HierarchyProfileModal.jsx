import React from 'react';
import { Building2, CalendarDays, IdCard, MapPin, UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildAvatarUrl } from '@/lib/avatar';

const getInitials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'NA';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const roleLabel = (person) => {
  if (person?.hierarchyTitle) return person.hierarchyTitle;
  if (person?.designation) return person.designation;
  if (!person?.role) return 'Team Member';
  return person.role.charAt(0).toUpperCase() + person.role.slice(1);
};

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
      <Icon className="h-3.5 w-3.5 dark:text-slate-400" />
      <span>{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{value || 'N/A'}</p>
  </div>
);

const HierarchyProfileModal = ({ open, onOpenChange, person }) => {
  if (!person) return null;

  const avatar = buildAvatarUrl(person);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-200 bg-white sm:max-w-[560px] dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-slate-100">Profile Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-5 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 sm:flex-row sm:items-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md dark:border-slate-700">
              {avatar ? (
                <img src={avatar} alt={person.name || 'Profile'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-emerald-500 text-2xl font-bold text-white">
                  {getInitials(person.name)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{person.name || 'Unknown Member'}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">Profile overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard icon={UserRound} label="Role" value={roleLabel(person)} />
            <InfoCard icon={IdCard} label="Employee ID" value={person.employeeId} />
            <InfoCard icon={Building2} label="Department" value={person.department} />
            <InfoCard icon={CalendarDays} label="Joined Date" value={formatDate(person.joiningDate)} />
            <InfoCard icon={MapPin} label="Work Location" value={person.workLocation} />
            <InfoCard icon={CalendarDays} label="Date of Birth" value={formatDate(person.dob)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HierarchyProfileModal;
