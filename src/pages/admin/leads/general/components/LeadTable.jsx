import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, AlertCircle, Tag } from 'lucide-react';

import LeadStageBadge from './LeadStageBadge';
import TagBadge from './TagBadge';

const LeadTable = ({
  leads,
  columns,
  page,
  pageSize,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onTagClick,
  onAddToLabelTab,
  showLabelAction = true,
}) => {
  const navigate = useNavigate();

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white border rounded-lg dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full dark:bg-slate-800">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">No leads found</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">Upload leads or create a new lead to get started.</p>
      </div>
    );
  }

  const safeColumns = Array.isArray(columns) ? columns : [];
  const allSelected = leads.every((lead) => selectedRows.includes(lead.id));

  const handleEditClick = (lead) => {
    navigate(`/leads/${lead.id}`, {
      state: { leadData: lead },
    });
  };

  const handleAddToLabelTab = (lead, event) => {
    event.stopPropagation();
    if (onAddToLabelTab) {
      onAddToLabelTab(lead);
    }
  };

  const renderLeadLink = (lead, value, className = 'text-blue-600 hover:underline dark:text-blue-300') =>
    value ? (
      <button onClick={() => handleEditClick(lead)} className={className}>
        {value}
      </button>
    ) : (
      '-'
    );

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-slate-900">
      <table className="w-full min-w-[1400px] border-collapse">
        <thead className="border-b bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 bg-gray-50 dark:bg-slate-900">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onSelectAll(leads.map((lead) => lead.id))}
                className="w-4 h-4 border-gray-300 rounded"
              />
            </th>

            <th className="z-10 px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase bg-gray-50 w-[150px] dark:bg-slate-900 dark:text-slate-300">
              ACTIONS
            </th>

            {safeColumns.includes('email') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[200px] dark:text-slate-300">
                EMAIL
              </th>
            )}

            {safeColumns.includes('name') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[150px] dark:text-slate-300">
                NAME
              </th>
            )}

            {safeColumns.includes('phone') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[120px] dark:text-slate-300">
                PHONE
              </th>
            )}

            {safeColumns.includes('country') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[140px] dark:text-slate-300">
                COUNTRY
              </th>
            )}

            {safeColumns.includes('language') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[140px] dark:text-slate-300">
                LANGUAGE
              </th>
            )}

            {safeColumns.includes('assignedTo') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[180px] dark:text-slate-300">
                ASSIGNED TO
              </th>
            )}

            {safeColumns.includes('leadPool') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[180px] dark:text-slate-300">
                LEAD POOL
              </th>
            )}

            {safeColumns.includes('followUp') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[140px] dark:text-slate-300">
                FOLLOW-UP
              </th>
            )}

            {safeColumns.includes('stage') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[160px] dark:text-slate-300">
                STAGE
              </th>
            )}

            {safeColumns.includes('tag') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[120px] dark:text-slate-300">
                TAG
              </th>
            )}

            {safeColumns.includes('comment') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[200px] dark:text-slate-300">
                LAST COMMENT
              </th>
            )}

            {safeColumns.includes('assignedDate') && (
              <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase w-[150px] dark:text-slate-300">
                DATE
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100 dark:bg-slate-900 dark:divide-slate-700">
          {leads.map((lead, index) => (
            (() => {
              const isSelected = selectedRows.includes(lead.id);
              const rowBaseClass = isSelected
                ? 'bg-blue-50 ring-1 ring-blue-100 dark:bg-slate-800 dark:ring-slate-700'
                : index % 2 === 0
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-gray-50/30 dark:bg-slate-800/70';

              return (
            <tr
              key={lead.id}
              className={`transition-colors ${rowBaseClass} hover:bg-gray-50/80 dark:hover:bg-slate-800`}
            >
              <td className={`px-4 py-3 ${rowBaseClass}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectRow(lead.id)}
                  className="w-4 h-4 border-gray-300 rounded"
                />
              </td>

              <td className={`z-10 px-6 py-3 ${rowBaseClass}`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(lead)}
                    className="p-1.5 text-gray-500 transition-all rounded-lg hover:text-blue-600 hover:bg-blue-50 hover:scale-110 dark:text-slate-300 dark:hover:text-blue-300 dark:hover:bg-blue-500/20"
                    title="Edit Lead"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {showLabelAction && (
                    <button
                      onClick={(event) => handleAddToLabelTab(lead, event)}
                      className="p-1.5 text-gray-500 transition-all rounded-lg hover:text-green-600 hover:bg-green-50 hover:scale-110 dark:text-slate-300 dark:hover:text-green-300 dark:hover:bg-green-500/20"
                      title="Add to Label Tab"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>

              {safeColumns.includes('email') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[180px] dark:text-white">
                  {renderLeadLink(lead, lead.email)}
                </td>
              )}

              {safeColumns.includes('name') && (
                <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-[130px] dark:text-blue-300">
                  {renderLeadLink(lead, lead.name)}
                </td>
              )}

              {safeColumns.includes('phone') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[100px] dark:text-white">
                  {renderLeadLink(lead, lead.phone)}
                </td>
              )}

              {safeColumns.includes('country') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[120px] dark:text-white">
                  {lead.country || '-'}
                </td>
              )}

              {safeColumns.includes('language') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[120px] dark:text-white">
                  {lead.language || '-'}
                </td>
              )}

              {safeColumns.includes('assignedTo') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[160px] dark:text-white">
                  {!lead.assignedTo || lead.assignedTo === 'N/A' ? 'Unassigned' : lead.assignedTo}
                </td>
              )}

              {safeColumns.includes('leadPool') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[160px] dark:text-white">
                  {lead.leadPool || '-'}
                </td>
              )}

              {safeColumns.includes('followUp') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[120px] dark:text-white">
                  {!lead.followUp || lead.followUp === 'N/A' ? '-' : lead.followUp}
                </td>
              )}

              {safeColumns.includes('stage') && (
                <td className="px-4 py-3">
                  <LeadStageBadge stage={lead.stage || 'New'} />
                </td>
              )}

              {safeColumns.includes('tag') && (
                <td className="px-4 py-3">
                  <TagBadge
                    tag={lead.tag || 'New Lead'}
                    onClick={() => onTagClick(lead)}
                    className="transition-opacity cursor-pointer hover:opacity-80"
                  />
                </td>
              )}

              {safeColumns.includes('comment') && (
                <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[180px] dark:text-slate-300">
                  {lead.comment || '-'}
                </td>
              )}

              {safeColumns.includes('assignedDate') && (
                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[130px] dark:text-white">
                  {lead.assignedDate || '-'}
                </td>
              )}
            </tr>
              );
            })()
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
