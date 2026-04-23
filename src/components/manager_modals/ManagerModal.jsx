import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import useManagerForm from './hooks/useManagerForm';
import AvatarSection from './sections/AvatarSection';
import PersonalInfoSection from './sections/PersonalInfoSection';
import AccountSetupSection from './sections/AccountSetupSection';
import LeaveBalancesSection from './sections/LeaveBalancesSection';
import ModalHeader from './common/ModalHeader';
import FormActions from './common/FormActions';

const ManagerModal = ({ isOpen, onClose, onSave, manager, isProfile = false }) => {
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
    departments,
    handlers,
  } = useManagerForm(manager, isProfile);

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
      console.error('Error saving manager:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save manager',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto p-0 bg-white rounded-lg shadow-xl">
        <ModalHeader
          isProfile={isProfile}
          manager={manager}
          managerId={formData.employeeId}
        />

        <div className="px-6 pt-4 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="personal" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="leaves" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Leave Balances
              </TabsTrigger>
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
                onChange={handlers.handleChange}
              />

              {!manager && !isProfile && (
                <AccountSetupSection
                  formData={formData}
                  onChange={handlers.handleChange}
                />
              )}
            </TabsContent>

            <TabsContent value="leaves" className="space-y-6">
              <LeaveBalancesSection
                editingBalances={editingBalances}
                onBalanceChange={handlers.handleLeaveBalanceChange}
              />
            </TabsContent>
          </Tabs>

          <FormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            isEdit={!!manager || !!isProfile}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerModal;
