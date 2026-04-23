import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase, Users, CreditCard, FileText, Settings } from 'lucide-react';

const ProfileTabs = ({ activeTab, onTabChange, children }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">

      {children}
    </Tabs>
  );
};

ProfileTabs.Content = TabsContent;

export default ProfileTabs;

