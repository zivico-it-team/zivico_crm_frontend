import React from 'react';
import { Building, CreditCard, Edit, FileText, Hash, Heart, Mail, MapPin, Phone, User, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="pb-3 border-b border-gray-100">
    <div className="flex items-center gap-2 mb-1">
      {Icon ? <Icon className="w-4 h-4 text-gray-400" /> : null}
      <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">{label}</p>
    </div>
    <p className="text-sm font-medium text-gray-900 break-words">{value || 'Not specified'}</p>
  </div>
);

const ManagerProfile = ({ isOpen, onClose, manager, onEdit }) => {
  if (!manager) {
    return null;
  }

  const documents = Array.isArray(manager.documents) ? manager.documents : [];
  const teamMembers = Array.isArray(manager.teamMembers) ? manager.teamMembers : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6 sm:py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Manager Profile</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            x
          </Button>
        </div>

        <div className="p-4 space-y-6 sm:p-6">
          <div className="p-5 text-white bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{manager.name || 'Unknown Manager'}</h2>
                <p className="mt-1 text-sm text-slate-200">
                  {manager.professional?.designation || manager.designation || 'Manager'} | {manager.professional?.department || manager.department || 'Unassigned Department'}
                </p>
              </div>
              <div className="text-sm text-slate-200">
                ID: {manager.professional?.employeeId || manager.employeeId || manager.id || 'N/A'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Personal Details</h3>
              <div className="space-y-3">
                <DetailItem label="Full Name" value={manager.name} icon={User} />
                <DetailItem label="Email" value={manager.email} icon={Mail} />
                <DetailItem label="Phone" value={manager.phone} icon={Phone} />
                <DetailItem label="Gender" value={manager.gender} icon={User} />
                <DetailItem label="Nationality" value={manager.nationality} icon={MapPin} />
                <DetailItem label="Address" value={manager.addressLine || manager.address} icon={MapPin} />
                <DetailItem label="City" value={manager.city} icon={MapPin} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Work Details</h3>
              <div className="space-y-3">
                <DetailItem label="Employee ID" value={manager.professional?.employeeId || manager.employeeId || manager.id} icon={Hash} />
                <DetailItem label="Department" value={manager.professional?.department || manager.department} icon={Building} />
                <DetailItem label="Designation" value={manager.professional?.designation || manager.designation} icon={Building} />
                <DetailItem label="Employment Type" value={manager.professional?.employmentType} icon={Building} />
                <DetailItem label="Reporting Manager" value={manager.professional?.reportingManager} icon={Users} />
                <DetailItem label="Work Location" value={manager.professional?.workLocation} icon={MapPin} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Emergency Contact</h3>
              <div className="space-y-3">
                <DetailItem label="Name" value={manager.emergencyContact?.name} icon={Heart} />
                <DetailItem label="Relationship" value={manager.emergencyContact?.relationship} icon={Heart} />
                <DetailItem label="Phone" value={manager.emergencyContact?.phone} icon={Phone} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Bank Details</h3>
              <div className="space-y-3">
                <DetailItem label="Bank Name" value={manager.bank?.bankName} icon={CreditCard} />
                <DetailItem label="Account Holder" value={manager.bank?.accountHolder} icon={User} />
                <DetailItem label="Account Number" value={manager.bank?.accountNumberMasked} icon={CreditCard} />
                <DetailItem label="Branch" value={manager.bank?.branch} icon={Building} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-5 bg-white border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {teamMembers.length}
                </span>
              </div>
              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id || member._id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{member.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {member.professional?.designation || member.designation || 'Employee'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No team members found in the database.</p>
              )}
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {documents.length}
                </span>
              </div>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={doc._id || doc.fileName || index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-900">
                          {doc.fileName || doc.title || 'Document'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents found in the database.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit(manager);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerProfile;
