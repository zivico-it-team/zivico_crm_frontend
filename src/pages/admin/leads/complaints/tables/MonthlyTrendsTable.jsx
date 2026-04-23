import React from 'react';
import { 
  Calendar, Users, Target, DollarSign, Clock, 
  TrendingUp, TrendingDown 
} from 'lucide-react';

const MonthlyTrendsTable = ({ monthlyData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2 sm:p-6">
        <div className="animate-pulse">
          <div className="h-5 mb-3 bg-gray-200 rounded sm:h-6 sm:mb-4"></div>
          <div className="space-y-2 sm:space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded sm:h-10"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2 sm:p-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center sm:mb-6">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Monthly Performance Trends</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 sm:px-3 sm:py-1.5 sm:text-sm">
            Compare Periods
          </button>
          <button className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 sm:px-3 sm:py-1.5 sm:text-sm">
            Download
          </button>
        </div>
      </div>
      
      {/* Mobile Card View */}
      <div className="block space-y-3 sm:hidden">
        {monthlyData?.map((month, index) => {
          const conversionRate = ((month.conversions / month.leads) * 100).toFixed(1);
          const prevMonth = index > 0 ? monthlyData[index - 1] : null;
          const trend = prevMonth ? month.leads > prevMonth.leads ? 'up' : 'down' : 'stable';
          
          return (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{month.month}</span>
                </div>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Leads</p>
                  <p className="font-medium">{month.leads}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Conversions</p>
                  <p className="font-medium">{month.conversions}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rate</p>
                  <p className="font-medium">{conversionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-medium">{month.revenue}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Response Time</p>
                  <p className="font-medium">{month.responseTime}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Month</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Leads</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Conversions</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Rate</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Revenue</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Response Time</th>
              <th className="px-3 py-2 text-xs font-medium text-left text-gray-500 sm:px-4 sm:py-3">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyData?.map((month, index) => {
              const conversionRate = ((month.conversions / month.leads) * 100).toFixed(1);
              const prevMonth = index > 0 ? monthlyData[index - 1] : null;
              const trend = prevMonth ? month.leads > prevMonth.leads ? 'up' : 'down' : 'stable';
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{month.month}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{month.leads}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>{month.conversions}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <span>{conversionRate}%</span>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                      <span>{month.revenue}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>{month.responseTime}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm sm:px-4 sm:py-3">
                    {trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : trend === 'down' ? (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyTrendsTable;