import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, History } from 'lucide-react';

export const LeaveTypeSelector = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
      <TabsList className="rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
        <TabsTrigger 
          value="apply" 
          className="gap-2 rounded-lg px-4 py-2 text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className="gap-2 rounded-lg px-4 py-2 text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
        >
          <History className="w-4 h-4" />
          History
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
