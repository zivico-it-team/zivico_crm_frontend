import React from 'react';
import { Building, CreditCard, FileText, Hash, Heart, Mail, MapPin, Phone, User } from 'lucide-react';

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

const formatDate = (value) => {
  if (!value) return '';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? ''
    : parsedDate.toLocaleDateString();
};

const EmployeeProfile = ({ isOpen, onClose, employee }) => {
  if (!employee) {
    return null;
  }

  const documents = Array.isArray(employee.documents) ? employee.documents : [];
  const professional = employee.professional || {};
  const employmentStatus =
    String(professional.employmentStatus || employee.status || 'active').toLowerCase() === 'inactive'
      ? 'Inactive'
      : 'Active';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6 sm:py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Employee Profile</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            x
          </Button>
        </div>

        <div className="p-4 space-y-6 sm:p-6">
          <div className="p-5 text-white bg-gradient-to-r from-blue-700 to-indigo-600 rounded-xl">
            <h2 className="text-2xl font-bold">{employee.name || 'Unknown Employee'}</h2>
            <p className="mt-1 text-sm text-blue-100">
              {employee.designation || employee.professional?.designation || 'Employee'} | {employee.department || employee.professional?.department || 'Unassigned Department'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Personal Details</h3>
              <div className="space-y-3">
                <DetailItem label="Full Name" value={employee.name} icon={User} />
                <DetailItem label="Email" value={employee.email} icon={Mail} />
                <DetailItem label="Phone" value={employee.phone} icon={Phone} />
                <DetailItem label="NIC No" value={professional.nicNo || employee.nicNo} icon={Hash} />
                <DetailItem label="Date of Birth" value={formatDate(employee.dob)} icon={User} />
                <DetailItem label="Gender" value={employee.gender} icon={User} />
                <DetailItem label="Address" value={employee.addressLine} icon={MapPin} />
                <DetailItem label="City" value={employee.city} icon={MapPin} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Work Details</h3>
              <div className="space-y-3">
                <DetailItem label="Employee ID" value={employee.employeeId || employee.professional?.employeeId} icon={Hash} />
                <DetailItem label="Department" value={employee.department || employee.professional?.department} icon={Building} />
                <DetailItem label="Designation" value={employee.designation || employee.professional?.designation} icon={Building} />
                <DetailItem label="Status" value={employmentStatus} icon={Building} />
                <DetailItem label="Appointment Date" value={formatDate(professional.appointmentDate || employee.appointmentDate)} icon={User} />
                <DetailItem label="Resigned Date" value={formatDate(professional.resignedDate || employee.resignedDate)} icon={User} />
                <DetailItem label="Employment Type" value={employee.professional?.employmentType} icon={Building} />
                <DetailItem label="Reporting Manager" value={employee.professional?.reportingManager} icon={User} />
                <DetailItem label="Joining Date" value={formatDate(employee.createdAt)} icon={User} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Emergency Contact</h3>
              <div className="space-y-3">
                <DetailItem label="Name" value={employee.emergencyContact?.name} icon={Heart} />
                <DetailItem label="Relationship" value={employee.emergencyContact?.relationship} icon={Heart} />
                <DetailItem label="Phone" value={employee.emergencyContact?.phone} icon={Phone} />
              </div>
            </div>

            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Bank Details</h3>
              <div className="space-y-3">
                <DetailItem label="Bank Name" value={employee.bank?.bankName} icon={CreditCard} />
                <DetailItem label="Account Holder" value={employee.bank?.accountHolder} icon={User} />
                <DetailItem label="Account Number" value={employee.bank?.accountNumberMasked} icon={CreditCard} />
                <DetailItem label="Branch" value={employee.bank?.branch} icon={Building} />
              </div>
            </div>
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
                  <div key={doc._id || doc.fileName || index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {doc.fileName || doc.title || 'Document'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents found in the database.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfile;
