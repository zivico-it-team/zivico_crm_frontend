import React from 'react';
import { Eye, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TeamPerformanceTable = ({ teams, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
        <div className="animate-pulse">
          <div className="h-5 mb-3 bg-gray-200 rounded sm:h-6 sm:mb-4"></div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded sm:h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderTrendIndicator = (trend, value) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="ml-0.5 text-xs font-medium sm:text-sm">{value}</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="ml-0.5 text-xs font-medium sm:text-sm">{value}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-600">
        <span className="text-xs font-medium sm:text-sm">{value}</span>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Team Performance</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 sm:text-sm">{teams?.length || 0} teams</span>
          <Filter className="w-3 h-3 text-gray-400 sm:w-4 sm:h-4" />
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {teams?.map((team) => (
          <div key={team.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-2 h-2 rounded-full sm:w-3 sm:h-3 ${team.color}`}></div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate sm:text-base">{team.name}</h4>
                  <p className="text-xs text-gray-500 sm:text-sm">{team.leads} leads</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900 sm:text-sm">{team.conversion}</p>
                  <p className="text-xs text-gray-500">conv.</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900 sm:text-sm">{team.revenue}</p>
                  <p className="text-xs text-gray-500">rev.</p>
                </div>
                <div className="text-center">
                  {renderTrendIndicator(team.trend, team.change)}
                </div>
              </div>
            </div>
            
            <div className="mt-2 sm:mt-3">
              <div className="flex justify-between mb-1 text-xs text-gray-500">
                <span>Performance</span>
                <span>{team.conversion}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full sm:h-2">
                <div 
                  className={`h-1.5 rounded-full sm:h-2 ${team.color}`}
                  style={{ 
                    width: `${parseInt(team.conversion)}%`,
                    maxWidth: '100%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-3 mt-3 border-t border-gray-200 sm:pt-4 sm:mt-4">
        <button className="flex items-center justify-center w-full py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 sm:py-2 sm:text-sm">
          <Eye className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
          View Detailed Report
        </button>
      </div>
    </div>
  );
};

export default TeamPerformanceTable;