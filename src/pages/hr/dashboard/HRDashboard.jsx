import React from 'react';
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard';

const HRDashboard = () => (
  <AdminDashboard
    pageTitle="HR Dashboard - CRM"
    welcomeLabel="HR"
    welcomeDescription="Today's attendance snapshot is ready for HR review."
    routeBase="/hr"
  />
);

export default HRDashboard;
