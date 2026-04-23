import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/components/ui/use-toast';

const FileManagementView = () => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>File Management - HRMS</title>
        <meta name="description" content="Manage all files shared across the system" />
      </Helmet>
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
          <p className="text-gray-600 mt-4">This feature is coming soon!</p>
        </div>
      </MainLayout>
    </>
  );
};

export default FileManagementView;