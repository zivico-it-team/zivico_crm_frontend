import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import useEmployeeForm from './hooks/useEmployeeForm';
import AvatarSection from './sections/AvatarSection';
import PersonalInfoSection from './sections/PersonalInfoSection';
import AccountSetupSection from './sections/AccountSetupSection';
import LeaveBalancesSection from './sections/LeaveBalancesSection';
import ModalHeader from './common/ModalHeader';
import FormActions from './common/FormActions';

const EmployeeModal = ({ isOpen, onClose, onSave, employee, isProfile = false }) => {
  const { toast } = useToast();

  const {
    formData,
    formErrors,
    isSubmitting,
    setIsSubmitting,
    avatarPreview,
    activeTab,
    setActiveTab,
    editingBalances,
    formState,
    departments,
    designationOptions,
    handlers
  } = useEmployeeForm(employee, isProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handlers.validateForm()) return;

    setIsSubmitting(true);

    try {
      const finalFormData = {
        ...formData,
        leaveBalances: editingBalances,
      };

      if (onSave) {
        await onSave(finalFormData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to save employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto rounded-lg bg-white p-0 shadow-xl sm:max-w-3xl dark:border-slate-700 dark:bg-slate-900">
        <DialogDescription className="sr-only">
          {isProfile ? 'Edit employee profile details' : employee ? 'Edit employee details' : 'Create a new employee'}
        </DialogDescription>
        <ModalHeader
          isProfile={isProfile}
          employee={employee}
          employeeId={formData.employeeId}
        />

        <div className="border-b border-slate-200 px-6 pt-4 dark:border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="personal"
                className="text-slate-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:text-slate-300 dark:data-[state=active]:bg-blue-500/20 dark:data-[state=active]:text-blue-300"
              >
                Personal Details
              </TabsTrigger>
              {formState.isAdmin && !isProfile && (
                <TabsTrigger
                  value="leaves"
                  className="text-slate-700 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:text-slate-300 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300"
                >
                  Leave Balances
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <AvatarSection
            avatarPreview={avatarPreview}
            name={formData.name}
            onAvatarUpload={(e) => handlers.handleAvatarUpload(e, toast)}
          />

          <Tabs value={activeTab} className="w-full">
            <TabsContent value="personal" className="space-y-6">
              <PersonalInfoSection
                formData={formData}
                formErrors={formErrors}
                departments={departments}
                designationOptions={designationOptions}
                onChange={handlers.handleChange}
                showRoleSelector={formState.isAdmin && !isProfile}
              />

              {!employee && !isProfile && (
                <AccountSetupSection
                  formData={formData}
                  onChange={handlers.handleChange}
                />
              )}
            </TabsContent>

            {formState.isAdmin && !isProfile && (
              <TabsContent value="leaves" className="space-y-6">
                <LeaveBalancesSection
                  editingBalances={editingBalances}
                  onBalanceChange={handlers.handleLeaveBalanceChange}
                />
              </TabsContent>
            )}
          </Tabs>

          <FormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            isEdit={!!employee || !!isProfile}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;
