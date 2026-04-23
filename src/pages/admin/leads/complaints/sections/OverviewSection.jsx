import React from 'react';
import { UserPlus, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';

const OverviewSection = ({ overviewData, metrics, isLoading }) => {
  const additionalMetrics = [
    {
      id: 1,
      title: 'Active Leads',
      value: overviewData?.activeLeads || 0,
      icon: UserPlus,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Response Rate',
      value: overviewData?.responseRate || '0%',
      icon: MessageSquare,
      color: 'green'
    },
    {
      id: 3,
      title: 'Avg Conversion',
      value: `${metrics?.avgConversionRate || 0}%`,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Lead Growth',
      value: `${metrics?.leadGrowth || 0}%`,
      icon: TrendingUp,
      color: 'yellow'
    }
  ];

  const iconColors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4 sm:gap-4 sm:mb-6">
      {additionalMetrics.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <div key={metric.id} className="p-3 bg-white border border-gray-200 rounded-lg sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate sm:text-sm">{metric.title}</p>
                <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
                  {isLoading ? '...' : metric.value}
                </p>
              </div>
              <Icon className={`w-4 h-4 flex-shrink-0 sm:w-5 sm:h-5 ${iconColors[metric.color]}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewSection;