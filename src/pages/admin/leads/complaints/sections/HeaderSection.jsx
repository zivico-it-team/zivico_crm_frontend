import React from 'react';
import { RefreshCw } from 'lucide-react';
import TimeRangeSelector from '../controls/TimeRangeSelector';
import ExportButton from '../controls/ExportButton';

const HeaderSection = ({ 
  title, 
  description, 
  timeRange, 
  setTimeRange, 
  teamFilter, 
  setTeamFilter, 
  isLoading, 
  handleRefresh,
  showExportMenu,
  setShowExportMenu,
  handleExport 
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:gap-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{title}</h1>
        <p className="text-xs text-gray-600 sm:text-sm">{description}</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <TimeRangeSelector 
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            teamFilter={teamFilter}
            setTeamFilter={setTeamFilter}
            isLoading={isLoading}
          />

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 sm:p-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <ExportButton 
          isLoading={isLoading}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default HeaderSection;