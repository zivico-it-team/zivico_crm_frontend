import { Button } from '@/components/ui/button';

const FormActions = ({ onClose, isSubmitting, isEdit }) => {
  return (
    <div className="sticky bottom-0 mt-8 space-y-4 border-t border-slate-200 bg-white pb-2 pt-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-slate-400">
          <span className="text-red-500">*</span> indicates required field
        </div>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="h-11 border-gray-300 px-8 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="px-8 text-white transition-all duration-200 shadow-lg h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>{isEdit ? 'Save Changes' : 'Create Employee'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormActions;
