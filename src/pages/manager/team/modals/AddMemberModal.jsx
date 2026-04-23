import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { teamDepartments } from '../utils/teamData';

const selectClassName =
  'h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400';

const AddMemberModal = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  formSubmitting,
  newEmployee,
  setNewEmployee,
  teamOptions = [],
  managerOptions = []
}) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewEmployee({...newEmployee, [id]: value});
  };

  const teams = teamOptions.length > 0 ? teamOptions : teamDepartments;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white sm:max-w-[650px] dark:border-slate-700 dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Add New Team Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Personal Info</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputField id="name" label="Full Name *" value={newEmployee.name} onChange={handleChange} required />
              <InputField id="userName" label="Username *" value={newEmployee.userName} onChange={handleChange} required />
              <InputField id="dateOfBirth" label="DOB *" type="date" value={newEmployee.dateOfBirth} onChange={handleChange} required />
              <InputField id="email" label="Email" type="email" value={newEmployee.email} onChange={handleChange} />
              <InputField id="password" label="Password *" type="password" value={newEmployee.password} onChange={handleChange} required />
              <InputField id="phone" label="Phone *" value={newEmployee.phone} onChange={handleChange} required />
              <InputField id="employeeId" label="Employee ID" value={newEmployee.employeeId} onChange={handleChange} />
              <div className="col-span-2">
                <InputField id="address" label="Address" value={newEmployee.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Employment Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Employment Info</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputField id="designation" label="Designation *" value={newEmployee.designation} onChange={handleChange} required />
              <InputField id="joiningDate" label="Joining Date *" type="date" value={newEmployee.joiningDate} onChange={handleChange} required />
              <InputField id="workLocation" label="Work Location *" value={newEmployee.workLocation} onChange={handleChange} required />
              
              {/* Team Select */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 dark:text-slate-300">Team *</Label>
                <select
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className={selectClassName}
                  required
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Manager Assignment */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Manager Assignment</h4>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">Assigned Manager</Label>
              <select
                value={newEmployee.manager}
                onChange={(e) => setNewEmployee({...newEmployee, manager: e.target.value})}
                className={selectClassName}
              >
                <option value="">Select manager</option>
                <option value="none">No Manager</option>

                {managerOptions.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={formSubmitting}
              className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {formSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Add Member</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Simple Input Field Component
const InputField = ({ id, label, type = "text", value, onChange, required, className = "" }) => (
  <div className="space-y-1">
    <Label htmlFor={id} className="text-xs text-slate-600 dark:text-slate-300">{label}</Label>
    <Input 
      id={id}
      type={type}
      required={required}
      value={value || ''}
      onChange={onChange}
      className={`h-9 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
    />
  </div>
);

export default AddMemberModal;
