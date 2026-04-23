import React from 'react';
import { Settings, TrendingUp, ArrowUpRight, AlertCircle, Clock } from 'lucide-react';
import InsightCard from '../cards/InsightCard';

const KeyInsightsSection = () => {
  const insights = [
    {
      id: 1,
      title: 'Top Performing Team',
      description: 'Sales Team leads with 28% conversion rate. Consider replicating their outreach strategies across other teams.',
      actionText: 'View Strategy →',
      color: 'blue',
      icon: TrendingUp
    },
    {
      id: 2,
      title: 'Growth Opportunity',
      description: 'Website leads increased by 35% this quarter. Allocate 20% more budget to digital marketing campaigns.',
      actionText: 'Optimize Budget →',
      color: 'green',
      icon: ArrowUpRight
    },
    {
      id: 3,
      title: 'Area for Improvement',
      description: 'Technical Team shows 18% conversion rate. Schedule training sessions and improve response templates.',
      actionText: 'Schedule Training →',
      color: 'yellow',
      icon: AlertCircle
    },
    {
      id: 4,
      title: 'Quick Win',
      description: 'Response time improved by 0.5 hours. Automate initial responses to maintain and improve this metric.',
      actionText: 'Setup Automation →',
      color: 'purple',
      icon: Clock
    }
  ];

  return (
    <div className="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 sm:mt-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Key Insights & Recommendations</h3>
        <Settings className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            title={insight.title}
            description={insight.description}
            actionText={insight.actionText}
            icon={insight.icon}
            color={insight.color}
            onActionClick={() => console.log(`Clicked ${insight.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default KeyInsightsSection;