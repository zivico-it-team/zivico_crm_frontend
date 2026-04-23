import { Button } from '@/components/ui/button';

const FormActions = ({ onClose, isSubmitting, isEdit }) => {
  return (
    <div className="sticky bottom-0 pt-6 pb-2 mt-8 space-y-4 bg-white border-t">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> indicates required field
        </div>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="px-8 border-gray-300 h-11 hover:bg-gray-50" 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="px-8 text-white transition-all duration-200 shadow-lg h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>{isEdit ? 'Save Changes' : 'Create Manager'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormActions;