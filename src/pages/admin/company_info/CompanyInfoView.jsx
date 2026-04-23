import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';

const CompanyInfoView = () => {
  return (
    <>
      <Helmet>
        <title>Company Information - HRMS</title>
        <meta name="description" content="Manage company information and settings" />
      </Helmet>
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900">Company Information</h1>
          <p className="text-gray-600 mt-4">Manage company details and settings</p>
        </div>
      </MainLayout>
    </>
  );
};

export default CompanyInfoView;